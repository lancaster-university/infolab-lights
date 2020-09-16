use crate::pixel::Pixel;
use getset::Getters;
use itertools::Itertools;
use roxmltree;
use std::collections::HashMap;
use std::net::SocketAddrV4;
use std::io::Write;
use std::num::Wrapping;
use num_traits::Zero;
use std::net::UdpSocket;
use speedy::Writable;
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
        PacketHeader {
            cid,
            lid,
            len: pixels.len() as u16 + 6,
            cmd,
            chk: pixels.iter().map(Pixel::wrapping_sum).sum::<Wrapping<u8>>().0,
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
        let pixels = vec![Pixel::zero(); lights.len()];

        Self { id, lights, pixels }
    }

    fn send<'a>(&mut self, addr: SocketAddrV4, sock: &UdpSocket, scratch: &'a mut Vec<u8>) {
        let hdr = PacketHeader::new(self.id, 255, 0x0C, &self.pixels);
        let mut c = std::io::Cursor::new(scratch);
        hdr.write_to_stream_with_ctx(speedy::BigEndian {}, &mut c).unwrap();
        c.write(self.pixels.as_bytes()).unwrap();

        sock.send_to(c.into_inner(), addr).unwrap();
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

    fn send<'a>(&mut self, sock: &UdpSocket, scratch: &'a mut Vec<u8>) {
        for controller in &mut self.controllers {
            controller.send(self.addr, sock, scratch);
        }
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
    scratch: Vec<u8>,
}

impl Scene {
    pub fn update_at(&mut self, pos: (u16, u16), pix: Pixel) -> Option<()> {
        let (ridx, cidx, lidx) = self.index.get(&pos)?;

        self.routers[*ridx].update_at((*cidx, *lidx), pix);

        Some(())
    }

    pub fn send(&mut self, sock: &UdpSocket) {
        for router in &mut self.routers {
            router.send(sock, &mut self.scratch);
        }
    }
}

fn parse_router(router: roxmltree::Node) -> Router {
    let hostname = router.attribute("hostname").unwrap();
    let port = router.attribute("port").unwrap();

    let addr = SocketAddrV4::new(hostname.parse().unwrap(), port.parse().unwrap());

    let controllers_map = router
        .children()
        .filter(|n| n.has_tag_name("Light"))
        .map(|light| {
            let [lid, cid] = light
                .attribute("id")
                .unwrap()
                .parse::<u16>()
                .unwrap()
                .to_ne_bytes();
            let x = light.attribute("x").unwrap().parse().unwrap();
            let y = light.attribute("y").unwrap().parse().unwrap();
            let z = light.attribute("z").unwrap().parse().unwrap();

            (
                cid,
                Light {
                    id: lid,
                    x,
                    y,
                    z,
                },
            )
        })
        .into_group_map();

    let controllers = controllers_map
        .into_iter()
        .map(|(id, lights)| Controller::new(id, lights))
        .collect();

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

    let index = routers
        .iter()
        .enumerate()
        .flat_map(|(ridx, r)| r.lights().map(move |(cidx, lidx, l)| (ridx, cidx, lidx, l)))
        .map(|(ridx, cidx, lidx, l)| ((l.x, l.y), (ridx, cidx, lidx)))
        .collect();

    Scene { routers, index, scratch: Vec::new() }
}
