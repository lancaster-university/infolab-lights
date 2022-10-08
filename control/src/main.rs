use image::GenericImageView;
use outgoing::Scene;
use std::error::Error;
use std::net::UdpSocket;
use std::path::PathBuf;
use std::time::Duration;
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
    let scene = outgoing::parse_scene(&scene);

    let (frame_recv, mut frame_send) =
        single_value_channel::channel_starting_with(image::DynamicImage::new_rgb8(120, 80));

    std::thread::spawn(move || sender_thread(frame_recv, scene));

    loop {
        let r = inner(&opt, &mut frame_send);

        println!("Inner loop failed: {:#?}", r);

        std::thread::sleep(Duration::from_secs(5));
    }
}

fn sender_thread(
    mut frame_chan: single_value_channel::Receiver<image::DynamicImage>,
    mut scene: Scene,
) {
    let socket = UdpSocket::bind("0.0.0.0:0").unwrap();
    let mut scratch = Vec::new();
    println!("okay, connected to udp");

    let fps = 25;
    let time_between_frames = Duration::from_secs(1) / fps;
    let time_between_packets = time_between_frames / (scene.controller_count() + 1);

    println!(
        "Aiming for a FPS of {}, time between frames: {:?}, between packets: {:?}",
        fps, time_between_frames, time_between_packets
    );

    loop {
        let frame = frame_chan.latest();

        for (x, y, pix) in frame.pixels() {
            let [r, g, b, _] = pix.0;
            scene.update_at((x as u16, y as u16), Pixel { r, g, b });
        }

        scene.send(&socket, &mut scratch, time_between_packets);
    }
}

fn inner(
    opt: &Opt,
    frame_chan: &mut single_value_channel::Updater<image::DynamicImage>,
) -> Result<(), Box<dyn Error>> {
    let (mut source, _) = tungstenite::connect(&opt.pixels)?;

    println!("okay, connected to spout");

    while let Ok(Message::Binary(msg)) = source.read_message() {
        let frame = image::load_from_memory_with_format(&msg, image::ImageFormat::Png)?;
        let frame = frame.fliph();
        frame_chan.update(frame)?;
    }

    Ok(())
}
