return class MyEffect {
  constructor(display) {
    this.display = display;
    this.t = 0;
    this.particles = [];

    this.font = {
      'W': [[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
      'i': [[1],[0],[1],[1],[1],[1],[1]],
      'l': [[1,1],[0,1],[0,1],[0,1],[0,1],[0,1],[1,1,1]],
      'y': [[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
      'o': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
      'u': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
      ' ': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
      'b': [[1,0,0],[1,0,0],[1,1,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,0]],
      'e': [[0,1,1,1],[1,0,0,0],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,0,0,0],[0,1,1,1]],
      'm': [[1,0,1,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
      'p': [[1,1,1,0],[1,0,0,1],[1,0,0,1],[1,1,1,0],[1,0,0,0],[1,0,0,0],[1,0,0,0]],
      'g': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
      'f': [[0,1,1,1],[1,0,0,0],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,0,0,0],[1,0,0,0]],
      '?': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,1,0,0]],
    };

    this.line1 = 'Will you be my';
    this.line2 = 'poopy gf?';

    this.buildBitmaps();
    this.spawnParticles();
  }

  buildBitmaps() {
    this.bitmaps = [this.line1, this.line2].map(text => {
      const chars = text.split('').map(c => this.font[c] || this.font[' ']);
      const rows = Array.from({length: 7}, () => []);
      for (const char of chars) {
        for (let row = 0; row < 7; row++) {
          for (let col = 0; col < char[row].length; col++) rows[row].push(char[row][col]);
          rows[row].push(0);
        }
      }
      return { rows, width: rows[0].length };
    });
  }

  spawnParticles() {
    const { width, height } = this.display;
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        hue: Math.random(),
        life: Math.random(),
        speed: 0.003 + Math.random() * 0.004,
        isHeart: Math.random() < 0.3,
      });
    }
  }

  hsvToRgb(h, s, v) {
    const i = Math.floor(h * 6), f = h * 6 - i;
    const p = v*(1-s), q = v*(1-f*s), t = v*(1-(1-f)*s);
    let r,g,b;
    switch(i%6){case 0:r=v;g=t;b=p;break;case 1:r=q;g=v;b=p;break;case 2:r=p;g=v;b=t;break;case 3:r=p;g=q;b=v;break;case 4:r=t;g=p;b=v;break;case 5:r=v;g=p;b=q;break;}
    return [Math.round(r*255),Math.round(g*255),Math.round(b*255)];
  }

  update() {
    const { width, height } = this.display;
    this.t++;

    // Clear
    for (let x = 0; x < width; x++)
      for (let y = 0; y < height; y++)
        this.display.setPixel(x, y, [0, 0, 0]);

    // Draw particles behind text
    for (const p of this.particles) {
      p.x += p.vx; p.y += p.vy; p.life += p.speed;
      if (p.x < 0) p.x = width; if (p.x >= width) p.x = 0;
      if (p.y < 0) p.y = height; if (p.y >= height) p.y = 0;
      const brightness = 0.4 + 0.4 * Math.sin(p.life * Math.PI * 2);
      const hue = (p.hue + this.t * 0.002) % 1;
      const rgb = this.hsvToRgb(hue, 0.8, brightness);
      const px = Math.floor(p.x), py = Math.floor(p.y);
      if (px >= 0 && px < width && py >= 0 && py < height)
        this.display.setPixel(px, py, rgb);
    }

    // Pulsing border ring
    const pulse = 0.5 + 0.5 * Math.sin(this.t * 0.05);
    const borderHue = (this.t * 0.003) % 1;
    const borderRgb = this.hsvToRgb(borderHue, 1, pulse);
    for (let x = 0; x < width; x++) {
      this.display.setPixel(x, 0, borderRgb);
      this.display.setPixel(x, height - 1, borderRgb);
    }
    for (let y = 0; y < height; y++) {
      this.display.setPixel(0, y, borderRgb);
      this.display.setPixel(width - 1, y, borderRgb);
    }

    // Draw two lines of static white text, centered
    const lineHeight = 7;
    const gap = 3;
    const totalHeight = lineHeight * 2 + gap;
    const startY = Math.floor((height - totalHeight) / 2);

    this.bitmaps.forEach((bitmap, lineIdx) => {
      const startX = Math.floor((width - bitmap.width) / 2);
      const lineY = startY + lineIdx * (lineHeight + gap);
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < bitmap.width; col++) {
          if (!bitmap.rows[row][col]) continue;
          const px = startX + col, py = lineY + row;
          if (px >= 0 && px < width && py >= 0 && py < height)
            this.display.setPixel(px, py, [255, 255, 255]);
        }
      }
    });

    this.display.flush();
  }
}
