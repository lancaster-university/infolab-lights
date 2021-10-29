# Control component

This goes somewhere connected to the LED network

## Usage

```bash
cargo run -- --pixels wss://infolab21-lights.lancs.ac.uk/live/websocket --scene InfoLab.xml
```

## Building for rpi

Inside `control/docker`

Build cross compile image:
```bash
docker build -t armv7-unknown-linux-gnueabihf-clang .
```

Build for rpi:

```bash
cross build --release --target armv7-unknown-linux-gnueabihf
```
