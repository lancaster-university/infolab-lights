let t = 0;

return class LavaLamp {
  constructor(display) {
    this.display = display;

    this.#clear();
  }

  #clear() {
    this.display.flush();
  }

  rounder(n, d) {
    n *= 2;
    if (n > 1) {
      n = 1;
    } else if (n < 0.8) {
      n = 0;
    }
    d /= this.display.width/4;
    if (d > 255) {
      d = 255;
    }
    return n * 255 - d;
  }

  dist(x1,y1,x2,y2) {
    return (x1-x2)**2 + (y1-y2)**2;
  }

  update() {
    t += 0.05;
    for (let x = 0; x < this.display.width; x++) {
      for (let y = 0; y < this.display.height; y++) {
        let dist = this.dist(this.display.width/2,this.display.height/2, x, y);
        let r = Math.abs((Math.sin((x/10)**1.5 + (t/3))+Math.cos((y/10)**1.5 + t)));
        let g = Math.abs((Math.sin((x/1)/10 - t)+Math.cos((y/1)/10 - (t/2))));
        let b = 1-Math.abs((Math.cos((x/0.8)/10 + t*2)+Math.tan((y/1.2)/10 - (t/2))));
        this.display.setPixel(x, y, [this.rounder(r - 0.5,dist), this.rounder(g - 0.5, dist), this.rounder(b,dist)]);
      }
    }
    this.display.flush();
  }
}
