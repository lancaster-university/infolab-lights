use image::GenericImageView;
use outgoing::Scene;
use std::error::Error;
use std::net::UdpSocket;
use std::path::PathBuf;
use std::time::{Duration, Instant};
use structopt::StructOpt;

use tungstenite::Message;
use url::Url;

use crate::pixel::Pixel;

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
        let r = inner(&opt, &mut scene);

        println!("Inner loop failed: {:#?}", r);

        std::thread::sleep(Duration::from_secs(5));
    }
}

fn inner(opt: &Opt, scene: &mut Scene) -> Result<(), Box<dyn Error>> {
    let socket = UdpSocket::bind("0.0.0.0:0")?;
    let mut scratch = Vec::new();
    println!("okay, connected to udp");

    let (mut source, _) = tungstenite::connect(&opt.pixels)?;

    println!("okay, connected to spout");

    // let blank = image::RgbImage::new(120, 80);
    // blank.save_with_format("/tmp/lol.bmp", image::ImageFormat::Bmp)?;

    let fps = 25;
    let time_between_frames = Duration::from_secs(1) / fps;
    let time_between_packets = time_between_frames / (scene.controller_count() + 1);

    println!(
        "Aiming for a FPS of {}, time between frames: {:?}, between packets: {:?}",
        fps, time_between_frames, time_between_packets
    );

    let mut last_frame_sent = Instant::now();

    while let Ok(Message::Binary(msg)) = source.read_message() {
        if last_frame_sent.elapsed() < time_between_frames {
            continue;
        }

        last_frame_sent = Instant::now();

        let frame = image::load_from_memory_with_format(&msg, image::ImageFormat::Png)?;
        let frame = frame.fliph();
        // frame.save_with_format("/tmp/lol.bmp", image::ImageFormat::Bmp)?;
        //
        for (x, y, pix) in frame.pixels() {
            let [r, g, b, _] = pix.0;
            scene.update_at((x as u16, y as u16), Pixel { r, g, b });
        }

        let t = Instant::now();
        scene.send(&socket, &mut scratch, time_between_packets);
        println!("Sent a frame in {:?}", t.elapsed());
    }

    Ok(())
}
