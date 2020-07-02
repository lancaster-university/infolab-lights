use tungstenite::Message;

mod incoming;
mod outgoing;
mod scene;
mod screen;

fn main() {
    let scene_file = std::env::var("INFOLAB_SCENE_FILE").unwrap();
    let scene_str = std::fs::read_to_string(scene_file).unwrap();
    let scene = scene::parse_scene(&scene_str);

    let sink = outgoing::OutState::new(scene);

    let mut source = incoming::connnect_to_spout();

    let mut screen = None;

    while let Ok(Message::Text(msg)) = source.read_message() {
        let val: incoming::ScreenUpdate = serde_json::from_str(&msg).unwrap();

        match val {
            incoming::ScreenUpdate::Full { screen: full } => {
                screen = Some(screen::Screen::from_full(full))
            }
            incoming::ScreenUpdate::Diff { diff } => {
                if let Some(s) = screen.as_mut() {
                    s.update_with_diff(diff);
                }
            }
        };

        if let Some(s) = screen.as_ref() {
            sink.send(s);
        }
    }
}
