return class GradientsEffect {
  
  constructor(display) {
    this.display = display;

    
    this.frameRate = 1; // Integer controlling screen update rate.
    this.gradientSpeed = 1; // Number of how fast gradients move across.
    
    this.#clear();
    this.tick = 0;
  }

  #clear() {
    for (let x = 0; x < this.display.width; x++) {
      for (let y = 0; y < this.display.height; y++) {
        this.display.setPixel(x, y, [0,0,0]);
      }
    }
    this.display.flush();
  }

  update() {
    this.tick = this.tick + 1

    // Higher frameRate values -> less updates/sec
    if (this.tick % this.frameRate == 1) {
      return;
    };

    // New Date Object
    let D = new Date();
    let t = D.getTime();

    // Sets gradient speeds
    t = (t/100 * this.gradientSpeed);

    // Sets pixels
    for (let x = 0; x < this.display.width; x++) {
      for (let y = 0; y < this.display.height; y++) {
        this.display.setPixel(x, y, [Math.sin(((x + t)*0.017)) * 255, Math.cos(((y + t)*0.017)) * 255, 255*Math.tan(x+y)/2]);
      }
    }

    // Sends to display
    this.display.flush();
  }
};
