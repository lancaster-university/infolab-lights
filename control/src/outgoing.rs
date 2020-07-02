use crate::{
    scene::{Light, Scene},
    screen::{Pixel, Screen},
};
use deku::prelude::*;
use std::net::{SocketAddrV4, UdpSocket};

#[derive(DekuWrite)]
struct Packet {
    cid: u8,
    lid: u8,
    #[deku(update = "(self.data.len() * 3 + 6)")]
    len: u16,
    cmd: u8,
    #[deku(
        update = "self.data.iter().cloned().fold(0, |acc, p| p.r.wrapping_add(p.g).wrapping_add(p.b).wrapping_add(acc))"
    )]
    chk: u8,
    #[deku(count = "len")]
    data: Vec<Pixel>,
}

impl Packet {
    fn new(cid: u8, lid: u8, cmd: u8, pixels: Vec<Pixel>) -> Self {
        let mut s = Self {
            cid,
            lid,
            len: 0,
            cmd,
            chk: 0,
            data: pixels,
        };
        s.update().unwrap();
        s
    }
}

pub struct Controller {
    pub id: u8,
    pub lights: Vec<Light>,
}

impl Controller {
    fn send(&self, addr: SocketAddrV4, sock: &UdpSocket, screen: &Screen) {
        let pixels: Vec<_> = self.lights.iter().map(|l| screen.get(l.x, l.y)).collect();

        let pkt = Packet::new(self.id, 255, 0x0C, pixels);
        let buf = pkt.to_bytes().unwrap();

        sock.send_to(&buf, addr).unwrap();
    }
}

pub struct Router {
    pub addr: SocketAddrV4,
    pub controllers: Vec<Controller>,
}

impl Router {
    fn send(&self, sock: &UdpSocket, screen: &Screen) {
        for controller in &self.controllers {
            controller.send(self.addr, sock, screen);
        }
    }
}

pub struct OutState {
    socket: UdpSocket,
    scene: Scene,
}

impl OutState {
    pub fn new(scene: Scene) -> OutState {
        let socket = UdpSocket::bind("0.0.0.0:1234").unwrap();

        OutState { socket, scene }
    }

    pub fn send(&self, screen: &Screen) {
        for router in &self.scene.0 {
            router.send(&self.socket, screen);
        }
    }
}
