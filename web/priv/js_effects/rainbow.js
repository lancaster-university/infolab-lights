class RainbowEffect {
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

  constructor(set_pixel, width, height) {
    this.set_pixel = set_pixel;
    this.width = width;
    this.height = height;

    this.#clear();
    this.position = 0;
  }

  #clear() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.set_pixel(x, y, [0, 0, 0]);
      }
    }
  }

  update() {
    for (let x = 0; x < this.width; x++) {
      const color = this.hsvToRgb((this.position + x / this.width) % 1, 1, 1);
      for (let y = 0; y < this.height; y++) {
        this.set_pixel(x, y, color);
      }
    }

    this.position += 0.01;
    this.position %= 1;
  }
}
