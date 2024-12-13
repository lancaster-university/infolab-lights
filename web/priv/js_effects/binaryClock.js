class BinaryClockBit {
    constructor(display, x, y, size) {
      this.display = display;
      this.x = x; 
      this.y = y;
      this.size = size; 
    }
  
    render(isOn, t, color) {
      for (let dx = 0; dx < this.size; dx++) {
        for (let dy = 0; dy < this.size; dy++) {
          const intensity = isOn ? 255 : 0;
          const r = intensity * color[0];
          const g = intensity * color[1];
          const b = intensity * color[2];
          const px = Math.floor(this.x + dx - this.size / 2);
          const py = Math.floor(this.y + dy - this.size / 2);
  
          if (px >= 0 && px < this.display.width && py >= 0 && py < this.display.height) {
            this.display.setPixel(px, py, [r, g, b]);
          }
        }
      }
    }
  }
  
  return class MyEffect {
    constructor(display) {
      this.display = display;
      this.bits = [];
      //size of the bits
      this.bitSize = 8;
      
      // (hours, minutes, seconds)
      const cols = 6; 
      // (1, 2, 4, 8)
      const rows = 4;
      // extra spacing between groups
      const xSpacing = Math.floor(display.width / (cols + 2)); 
      // use only the top 80% of the display because bottom part of display is bunched up
      const ySpacing = Math.floor((display.height * 0.8) / rows); 
  
      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          let extraSpacing = 0;
          if (col >= 2 && col < 4) extraSpacing = xSpacing; 
          if (col >= 4) extraSpacing = 2 * xSpacing;
  
          const x = xSpacing * col + xSpacing / 2 + extraSpacing;
          const y = ySpacing * row + ySpacing / 2; 
          this.bits.push(new BinaryClockBit(display, x, y, this.bitSize));
        }
      }
    }
  
    update() {
      const t = Date.now() / 1000;
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
  
      const binaryDigits = [
        [(hours / 10) | 0, hours % 10],     // tens and ones digit of hours
        [(minutes / 10) | 0, minutes % 10], // tens and ones digit of minutes
        [(seconds / 10) | 0, seconds % 10]  // tens and ones digit of seconds
      ];
  
      const binaryTime = binaryDigits
        .flat()
        .map(digit => [8, 4, 2, 1].map(value => (digit & value ? 1 : 0)))
        .flat();
  
      const colors = [
        [0.53, 0.81, 0.92], // baby blue for hours
        [1.0, 1.0, 1.0],    // white for minutes
        [1.0, 0.75, 0.8]    // pastel pink for seconds 🏳️‍⚧️
      ];
  
      for (let x = 0; x < this.display.width; x++) {
        for (let y = 0; y < this.display.height; y++) {
          this.display.setPixel(x, y, [0, 0, 0]); // clear screen by setting all pixels to black
        }
      }
  
      for (let i = 0; i < this.bits.length; i++) {
        const isOn = i < binaryTime.length ? binaryTime[i] : 0;
        // determine color based on column group
        const colorIndex = Math.floor(i / 8); 
        const color = colors[colorIndex] || [1.0, 1.0, 1.0]; // Default to white if out of range
        this.bits[i].render(isOn, t, color);
      }
      this.display.flush();
    }
  }
  