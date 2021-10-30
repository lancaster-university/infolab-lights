return class RainbowEffect {
  /**
  * Converts an HSV color value to RGB. Conversion formula
  * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
  * Assumes h, s, and v are contained in the set [0, 1] and
  * returns r, g, and b in the set [0, 255].
  *
  * @param   Number  h       The hue
  * @param   Number  s       The saturation
  * @param   Number  v       The value
  * @return  Array           The RGB representation
  */
  hsvToRgb(h, s, v) {
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
  }

  constructor(display) {
    this.display = display;

    this.#clear();
    this.position = 0;
    this.tick = 0;
  }

  #clear() {
    for (let x = 0; x < this.display.width; x++) {
      for (let y = 0; y < this.display.height; y++) {
        this.display.setPixel(x, y, [0, 0, 0]);
      }
    }

    this.display.flush();
  }

  update() {
    // limit our fps a bit
    this.tick += 1;

    if (this.tick < 3) {
      return;
    }

    this.tick = 0;

    for (let x = 0; x < this.display.width; x++) {
      const color = this.hsvToRgb((this.position + x / this.display.width) % 1, 1, 0.5);
      for (let y = 0; y < this.display.height; y++) {
        this.display.setPixel(x, y, color);
      }
    }

    this.display.flush();

    this.position += 0.002;
    this.position %= 1;
  }
}

