use std::error::Error;
// use std::net::UdpSocket;
use std::path::PathBuf;
use std::time::Duration;
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

    loop {
        let _ = inner(&opt);

        std::thread::sleep(Duration::from_secs(5));
    }
}

fn inner(opt: &Opt) -> Result<(), Box<dyn Error>> {
    // let socket = UdpSocket::bind("0.0.0.0:0")?;

    // println!("okay, connected to udp");

    let mut source = incoming::connnect_to_spout(&opt.pixels)?;

    println!("okay, connected to spout");

    let mut img = bmp::Image::new(120, 80);

    let _ = img.save("/tmp/lol.bmp");

    Ok(while let Ok(Message::Text(msg)) = source.read_message() {
        let val: incoming::ScreenUpdate = serde_json::from_str(&msg)?;

        match val {
            incoming::ScreenUpdate::Diff { diff } => {
                for p in diff {
                    img.set_pixel(
                        119u16.saturating_sub(p.x) as u32,
                        p.y as u32,
                        bmp::Pixel {
                            r: p.new.r,
                            g: p.new.g,
                            b: p.new.b,
                        },
                    );
                    // let _ = scene.update_at((p.x, p.y), p.new);
                }
            }
        };

        let _ = img.save("/tmp/lol.bmp");
    })
}
