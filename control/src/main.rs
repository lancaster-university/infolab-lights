use std::error::Error;
// use std::net::UdpSocket;
use std::path::PathBuf;
use std::time::Duration;
use structopt::StructOpt;

use tungstenite::Message;
use url::Url;

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

    let (mut source, _) = tungstenite::connect(&opt.pixels)?;

    println!("okay, connected to spout");

    let blank = image::RgbImage::new(120, 80);
    blank.save_with_format("/tmp/lol.bmp", image::ImageFormat::Bmp)?;

    while let Ok(Message::Binary(msg)) = source.read_message() {
        let frame = image::load_from_memory_with_format(&msg, image::ImageFormat::Png)?;
        let frame = frame.fliph();
        frame.save_with_format("/tmp/lol.bmp", image::ImageFormat::Bmp)?;
    }

    Ok(())
}
