
let t = 0;

return class TheOrb {
  constructor(display) {
    this.display = display;

    this.#clear();
  }

  #clear() {
    this.display.flush();
  }

  dist(a,b) {
    return (((this.display.width/2)-a)**2 + ((this.display.height/2)-b)**2);
  }

  update() {
    t+=0.1;
    for (let x = 0; x < this.display.width; x++) {
      for (let y = 0; y < this.display.height; y++) {
        let x1 = x + Math.sin(t)*this.display.width/2;
        let y1 = y + Math.cos(t)*this.display.height/5;
        let value = [this.dist(x1,y1)*(Math.sin(t)+1), Math.sin(t)*255, this.dist(x,y)*(Math.cos(t)+1)]
        for (let index = 0; index < 3; index++) {
          value[index] = value[index] - 1.05**(this.dist(x,y)/8);
        }
        this.display.setPixel(x, y, value);
      }
    }
    this.display.flush();
  }
}
