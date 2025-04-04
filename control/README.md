# Control component

This goes somewhere connected to the LED network

## Installation (using systemd)

1. Download the appropriate binary for your system from the [releases page](https://github.com/lancaster-university/infolab-lights/releases):
   ```bash
   # For x86_64 systems
   wget https://github.com/lancaster-university/infolab-lights/releases/latest/download/infolab-light-controller-x86_64-unknown-linux-gnu.tar.gz
   
   # For ARM64 systems (like Raspberry Pi 4)
   wget https://github.com/lancaster-university/infolab-lights/releases/latest/download/infolab-light-controller-aarch64-unknown-linux-gnu.tar.gz
   ```

2. Extract the binary:
   ```bash
   tar -xzf infolab-light-controller-*.tar.gz
   ```

3. Create installation directory and move the binary:
   ```bash
   sudo mkdir -p /opt/infolab-lights
   sudo mv infolab-light-controller-* /opt/infolab-lights/control
   sudo chmod +x /opt/infolab-lights/control
   ```

4. Download the systemd service files:
   ```bash
   # Download the main service file
   sudo wget -O /etc/systemd/system/infolab-lights.service https://raw.githubusercontent.com/lancaster-university/infolab-lights/master/control/infolab-lights.service
   
   # Download the restart service file
   sudo wget -O /etc/systemd/system/infolab-lights-restart.service https://raw.githubusercontent.com/lancaster-university/infolab-lights/master/control/infolab-lights-restart.service
   
   # Download the restart timer file
   sudo wget -O /etc/systemd/system/infolab-lights-restart.timer https://raw.githubusercontent.com/lancaster-university/infolab-lights/master/control/infolab-lights-restart.timer
   ```

5. Download the scene file:
   ```bash
   sudo wget -O /opt/infolab-lights/InfoLab.xml https://raw.githubusercontent.com/lancaster-university/infolab-lights/master/control/InfoLab.xml
   ```

6. Enable and start the services:
   ```bash
   sudo systemctl enable infolab-lights.service
   sudo systemctl start infolab-lights.service
   sudo systemctl enable infolab-lights-restart.timer
   sudo systemctl start infolab-lights-restart.timer
   ```
>Note: The restart timer ensures the service restarts 5 mins after reboot - this is a solution to help dealing with slow MikroTiks when there's a powercut.
7. Check the service status:
   ```bash
   sudo systemctl status infolab-lights.service
   ```

## Optionally: building from source

```bash
cargo run -- --pixels wss://infolab21-lights.lancaster.ac.uk/live/websocket --scene InfoLab.xml
```

## Building for rpi

<!-- Inside `control/docker` -->

<!-- Build cross compile image: -->
<!-- ```bash -->
<!-- docker build -t armv7-unknown-linux-gnueabihf-clang . -->
<!-- ``` -->

Build for rpi:

```bash
cross build --release --target armv7-unknown-linux-gnu
```