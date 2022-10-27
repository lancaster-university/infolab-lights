const blob_count = 15;
let t = 0;

class Blob{
  constructor(display){
    this.display = display;
    this.x = Math.floor(Math.random() * (display.width - 1))
    this.y = Math.floor(Math.random() * (display.height - 1))
    this.x_vel = (Math.random() * 4) - 2
    this.y_vel = (Math.random() * 4) - 2
    this.rad = Math.floor(Math.random() * 6) + 30
  }

  move(){
    this.x += this.x_vel;
    this.y += this.y_vel;
    if(this.x < 0){
      this.x_vel = -this.x_vel;
      this.x = 0;
    }
    if(this.x > this.display.width){
      this.x_vel = -this.x_vel;
      this.x = this.display.width;
    }
    if(this.y < 0){
      this.y_vel = -this.y_vel;
      this.y = 0;
    }
    if(this.y > this.display.height){
      this.y_vel = -this.y_vel;
      this.y = this.display.height;
    }
  }
}

return class MyEffect {
  constructor(display) {
    this.blobs = new Array(3);
    for(let i = 0; i < blob_count; i++){
      this.blobs[i] = new Blob(display);
    }
    this.display = display;
  }

  #clear(){}

  update() {
    t += 0.1
    for(let i = 0; i < blob_count; i++){
      this.blobs[i].move()
    }
    for (let x = 0; x < this.display.width; x++) {
      for (let y = 0; y < this.display.height; y++) {
        let sum = 0;
        for(let i = 0; i < blob_count; i++){
          sum = Math.min(sum + (this.blobs[i].rad) * (255 / Math.max(0.001, this.dist(this.blobs[i].x, this.blobs[i].y, x, y)) ** 2), 255);
        }
        let r = 0.5 * (Math.sin(t) + 1)
        let g = 0.5 * (Math.sin(t + (2/3) * Math.PI) + 1)
        let b = 0.5 * (Math.sin(t + (4/3) * Math.PI) + 1)
        this.display.setPixel(x, y, [r * sum, g * sum, b * sum]);
      }
    }  
    this.display.flush()
  }

  dist(ax, ay, bx, by){
    return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
  }
}
