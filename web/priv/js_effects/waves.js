// Waves by @DStarUK, very heavily adapted from Rainbow by @simmsb
//
// Writing effects:
//  Effects are written as a class with an 'update' method that is
//  called to render each frame.
//
// The class you write will be initialized with the backing display for you to manipulate:
//
// display:
//   an object that has a 'setPixel' method, and a 'flush' method,
//    it also has 'width' and 'height' attributes:
//
//   setPixel: function(x: number, y: number, v: [number, number, number])
//     Use this to set the colour of a pixel on the screen
//     v is a 3-tuple of RGB values in the range 0-255
//
//   flush: function()
//     Use this to flush the display buffer to the system.
//     Make sure to call this, otherwise you'll not see anything!
//
//   width: number
//   height: number
//     The size of the display in pixels. 0,0 is the top left corner
//
//


// for each pixel, the colour is determined by which diagonal it lies on
// this is calculated by adding the x and y value of each 
// like this:
// [0,0][0,1]
// [0,1][1,1]
// becomes
// [0][1]
// [1][2]
// the waves effect is then achieved by cutting off the rainbow calculator
// a fifth of the way through so it just repeats the blue part

return class MyEffect {
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
      case 0: r = p, g = t, b = v; break;
      case 1: r = p, g = v, b = q; break;
      case 2: r = t, g = v, b = p; break;
      case 3: r = v, g = q, b = p; break;
      case 4: r = v, g = p, b = t; break;
      case 5: r = q, g = p, b = v; break;
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

    if (this.tick < 2) {
      this.display.flush();
      return;
    }

    this.tick = 0;

    for (let x = 0; x < this.display.width; x++) {
      for (let y = 0; y < this.display.height; y++) {
        const color = this.hsvToRgb(((this.position + x)+(this.position + y)) / this.display.height % 0.2, 1, 0.5);
        this.display.setPixel(x, y, color);
      }
    }

    this.display.flush();

    //updating this.position to create the scrolling effect
    this.position += 1;
    this.position %= 10000
  }
}
