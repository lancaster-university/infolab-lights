return class MyEffect {
  constructor(display) {
    this.display = display;
    this.time = 0;
  }

  #getCaustic(x, y, t) {
    let pX = x;
    let pY = y;
    for (let i = 1; i <= 4; i++) {
      let newX = pX + Math.sin(pY * 0.8 * i + t) * (1.2 / i);
      let newY = pY + Math.cos(pX * 0.8 * i + t) * (1.2 / i);
      pX = newX;
      pY = newY;
    }
    
    let v = Math.sin(pX) * Math.cos(pY);
    return Math.pow(1.0 - Math.abs(v), 9.0);
  }

  update() {
    this.time += 0.015; 
    const t = this.time;
    
    const w = this.display.width;
    const h = this.display.height;
    
    const scale = 3.0; 
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        let pX = (x / w) * scale;
        let pY = (y / h) * scale;
        if (w > h) 
          pX *= (w / h);
        else if (h > w) 
          pY *= (h / w);
        const offset = 0.025;
        let cR = this.#getCaustic(pX + offset, pY + offset, t);
        let cG = this.#getCaustic(pX, pY, t);
        let cB = this.#getCaustic(pX - offset, pY - offset, t);
        const depth = y / h;
        const bgR = 0;
        const bgG = 20 + (1.0 - depth) * 50;
        const bgB = 50 + (1.0 - depth) * 70;
        let r = bgR + (cR * 255);
        let g = bgG + (cG * 255) + (cR * 40);
        let b = bgB + (cB * 255);
        r = Math.min(255, Math.max(0, r | 0));
        g = Math.min(255, Math.max(0, g | 0));
        b = Math.min(255, Math.max(0, b | 0));

        this.display.setPixel(x, y, [r, g, b]);
      }
    }

    this.display.flush();
  }
}
