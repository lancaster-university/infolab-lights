use std::error::Error;
use std::net::UdpSocket;
use std::path::PathBuf;
use structopt::StructOpt;

use tungstenite::Message;
use url::Url;

mod incoming;
mod outgoing;
mod pixel;

#[derive(StructOpt)]
struct Opt {
    /// The xml scene file to load
    #[structopt(short, long, parse(from_os_str))]
    scene: PathBuf,

    /// The url of the websocket pixel spout
    #[structopt(short, long)]
    pixels: Url,
}

fn main() -> Result<(), Box<dyn Error>> {
    let opt = Opt::from_args();
    let scene = std::fs::read_to_string(&opt.scene)?;

    let mut scene = outgoing::parse_scene(&scene);

    let socket = UdpSocket::bind("0.0.0.0:1234")?;

    let mut source = incoming::connnect_to_spout(&opt.pixels);

    while let Ok(Message::Text(msg)) = source.read_message() {
        let val: incoming::ScreenUpdate = serde_json::from_str(&msg)?;

        match val {
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
