use crate::pixel::Pixel;
use getset::Getters;
use itertools::Itertools;
use retain_mut::RetainMut;
use speedy::Writable;
use std::collections::HashMap;
use std::io::Write;
use std::net::SocketAddrV4;
use std::net::UdpSocket;
use std::num::Wrapping;
use std::time::Duration;
use zerocopy::AsBytes;

#[derive(Writable)]
struct PacketHeader {
    cid: u8,
    lid: u8,
    len: u16,
    cmd: u8,
    chk: u8,
}

impl PacketHeader {
    fn new(cid: u8, lid: u8, cmd: u8, pixels: &[Pixel]) -> Self {
        let len = (pixels.len() * 3) as u16 + 6;
        let [len_up, len_low] = len.to_be_bytes();
        let chk = cid
            .wrapping_add(lid)
            .wrapping_add(len_up)
            .wrapping_add(len_low)
            .wrapping_add(cmd)
            .wrapping_add(
                pixels
                    .iter()
                    .map(Pixel::wrapping_sum)
                    .sum::<Wrapping<u8>>()
                    .0,
            );

        PacketHeader {
            cid,
            lid,
            len,
            cmd,
            chk,
        }
    }
}

pub struct Controller {
    id: u8,
    lights: Vec<Light>,
    pixels: Vec<Pixel>,
}

impl Controller {
    pub fn new(id: u8, lights: Vec<Light>) -> Self {
        let pixels = vec![Pixel { r: 0, g: 0, b: 40 }; lights.len()];

        Self { id, lights, pixels }
    }

    fn send<'a>(&self, addr: SocketAddrV4, sock: &UdpSocket, scratch: &'a mut Vec<u8>) {
        scratch.clear();

        let hdr = PacketHeader::new(self.id, 255, 0x0C, &self.pixels);
        let mut c = std::io::Cursor::new(scratch);

        hdr.write_to_stream_with_ctx(speedy::BigEndian {}, &mut c)
            .unwrap();

        c.write_all(self.pixels.as_bytes()).unwrap();

        let scratch = c.into_inner();
        // println!("sent to {:?} ({} pixels)", addr, self.pixels.len());
        let _ = sock.send_to(scratch, addr);
    }
}

pub struct Router {
    addr: SocketAddrV4,
    controllers: Vec<Controller>,
}

impl Router {
    pub fn new(addr: SocketAddrV4, controllers: Vec<Controller>) -> Router {
        Router { addr, controllers }
    }

    fn senders<'a>(
        &'a self,
    ) -> impl Iterator<Item = impl for<'b, 'c> FnOnce(&'b UdpSocket, &'c mut Vec<u8>) + 'a> + 'a
    {
        self.controllers
            .iter()
            .map(move |c| {
                move |sock: &UdpSocket, scratch: &mut Vec<u8>| c.send(self.addr, sock, scratch)
            })
            .fuse()
    }

    pub fn lights(&self) -> impl Iterator<Item = (usize, usize, &Light)> {
        self.controllers.iter().enumerate().flat_map(|(cidx, c)| {
            c.lights
                .iter()
                .enumerate()
                .map(move |(lidx, l)| (cidx, lidx, l))
        })
    }

    pub fn update_at(&mut self, path: (usize, usize), pixel: Pixel) {
        self.controllers[path.0].pixels[path.1] = pixel;
    }
}

#[derive(Copy, Clone)]
pub struct Light {
    pub id: u8,
    pub x: u16,
    pub y: u16,
    pub z: u16,
}

#[derive(Getters)]
pub struct Scene {
    #[getset(get = "pub")]
    routers: Vec<Router>,
    #[getset(get = "pub")]
    index: HashMap<(u16, u16), (usize, usize, usize)>,
}

impl Scene {
    pub fn update_at(&mut self, pos: (u16, u16), pix: Pixel) -> Option<()> {
        let (ridx, cidx, lidx) = self.index.get(&pos)?;

        self.routers[*ridx].update_at((*cidx, *lidx), pix);

        Some(())
    }

    pub fn controller_count(&self) -> u32 {
        self.routers
            .iter()
            .map(|r| r.controllers.len() as u32)
            .sum()
    }

    pub fn send(&mut self, sock: &UdpSocket, scratch: &mut Vec<u8>, target_interval: Duration) {
        let mut senders = self.routers.iter().map(|r| r.senders()).collect_vec();

        while !senders.is_empty() {
            RetainMut::retain_mut(&mut senders, |it| {
                if let Some(sender) = it.next() {
                    (sender)(sock, scratch);

                    spin_sleep::sleep(target_interval);

                    true
                } else {
                    false
                }
            });
        }
    }
}

fn parse_router(router: roxmltree::Node) -> Router {
    let hostname = router.attribute("hostname").unwrap();
    let port = router.attribute("port").unwrap();

    let addr = SocketAddrV4::new(hostname.parse().unwrap(), port.parse().unwrap());

    let mut last_lid = 0;
    let mut last_y = 0;

    let controllers_map = router
        .children()
        .filter(|n| n.has_tag_name("Light"))
        .map(|light| {
            let [lid, cid] = light
                .attribute("id")
                .unwrap()
                .parse::<u16>()
                .unwrap()
                .to_le_bytes();
            let x = light.attribute("x").unwrap().parse().unwrap();
            let y = light.attribute("y").unwrap().parse().unwrap();
            let z = light.attribute("z").unwrap().parse().unwrap();

            // if lid as isize != last_lid + 1 {
            //     println!("Non seq lid: {lid}, {x}, {y}");
            //

            if y != 79 && y as isize != last_y - 1 {
                println!("Non seq y: {lid}:{cid}, {x}, {y}")
            }

            last_lid = lid as isize;
            last_y = y as isize;

            (cid, Light { id: lid, x, y, z })
        })
        .into_group_map();

    let mut controllers = controllers_map
        .into_iter()
        .map(|(id, lights)| Controller::new(id, lights))
        .collect_vec();

    controllers.sort_by_key(|c| c.id);

    Router::new(addr, controllers)
}

pub fn parse_scene(scene: &str) -> Scene {
    let doc = roxmltree::Document::parse(scene).unwrap();

    let mut routers = Vec::new();

    let scene = doc.root().first_child().unwrap();
    for node in scene.children() {
        if !node.has_tag_name("FixedIPService") {
            continue;
        }
        routers.push(parse_router(node));
    }

    routers.sort_by_key(|r| r.addr);

    let index = routers
        .iter()
        .enumerate()
        .flat_map(|(ridx, r)| r.lights().map(move |(cidx, lidx, l)| (ridx, cidx, lidx, l)))
        .map(|(ridx, cidx, lidx, l)| ((l.x, l.y), (ridx, cidx, lidx)))
        .collect();

    Scene { routers, index }
}
