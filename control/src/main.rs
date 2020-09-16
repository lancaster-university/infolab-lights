use std::error::Error;
use std::net::UdpSocket;

use tungstenite::Message;

mod incoming;
mod outgoing;
mod pixel;

fn main() -> Result<(), Box<dyn Error>> {
    let scene_file = std::env::var("INFOLAB_SCENE_FILE")?;
    let scene_str = std::fs::read_to_string(scene_file)?;

    let mut scene = outgoing::parse_scene(&scene_str);

    let socket = UdpSocket::bind("0.0.0.0:1234")?;

    let mut source = incoming::connnect_to_spout();

    while let Ok(Message::Text(msg)) = source.read_message() {
        let val: incoming::ScreenUpdate = serde_json::from_str(&msg)?;

        match val {
            incoming::ScreenUpdate::Full { screen: full } => {
                for ((x, y), p) in full.into_iter() {
                    let _ = scene.update_at((x, y), p);
                }
            }
            incoming::ScreenUpdate::Diff { diff } => {
                for p in diff {
                    let _ = scene.update_at((p.x, p.y), p.new);
                }
            }
        };

        scene.send(&socket);
    }

    Ok(())
}
