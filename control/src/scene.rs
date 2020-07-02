use crate::outgoing::{Controller, Router};
use itertools::Itertools;
use roxmltree;
use std::net::SocketAddrV4;

#[derive(Copy, Clone)]
pub struct Light {
    pub id: u8,
    pub x: u16,
    pub y: u16,
    pub z: u16,
}

pub struct Scene(pub Vec<Router>);

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

            (cid, Light { id: lid, x, y, z })
        })
        .into_group_map();

    let controllers = controllers_map
        .into_iter()
        .map(|(id, lights)| Controller { id, lights })
        .collect();

    Router { addr, controllers }
}

pub fn parse_scene(scene: &str) -> Scene {
    let doc = roxmltree::Document::parse(scene).unwrap();

    let mut res = Vec::new();

    let scene = doc.root().first_child().unwrap();
    for node in scene.children() {
        if !node.has_tag_name("FixedIPService") {
            continue;
        }
        res.push(parse_router(node));
    }

    Scene(res)
}
