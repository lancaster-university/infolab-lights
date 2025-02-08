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

//first time using js, i hate it - sorry :)
//forgive some horrible code for once in your life pls ;-;
class BoidGroup {
  constructor(colour, width, height) {
    this.groupColour = colour;
    this.boids = [];
    this.totalBoids = 0;

    this.width = width;
    this.height = height;

    this.cohesion_factor = 1;
    this.separation_factor = 1;
    this.align_factor = 1;
    this.separation_distance = 2;
    this.boid_max_speed = 2;
    this.boid_min_speed = 1;
  }

  addBoid(x, y) {
    this.boids.push(new Boid(x,y,this.groupColour));
    this.totalBoids++;
  }

  getBoids() {
    return this.boids;
  }

  getGroupColour() {
    return this.groupColour;
  }

  numBoids() {
    return this.totalBoids;
  }

  update(dt) {
    for (let i = 0; i < this.totalBoids; i++) {
      let px_avg = 0, py_avg = 0, vx_avg = 0, vy_avg = 0, sep_x = 0, sep_y = 0, neighbours = 0;

      const curBoid = this.boids[i];

      const px = curBoid.getPosX(), py = curBoid.getPosY();
      const vx = curBoid.getVelX(), vy = curBoid.getVelY();

      for (let j = 0; j < this.totalBoids; j++) {
        if (j == i) {continue;} //don't want to consider the current boid as a neighbouring boid

        const neigbourBoid = this.boids[j];

        const npx = neigbourBoid.getPosX(), npy = neigbourBoid.getPosY();
        const nvx = neigbourBoid.getVelX(), nvy = neigbourBoid.getVelY();

        const dx = npx - px, dy = npy - py;
        const dist = Math.sqrt((dx) ** 2 + (dy) ** 2);

        if (dist < this.separation_distance) {
          sep_x += dx; sep_y += dy;
        }

        px_avg += npx; py_avg += npy; 
        vx_avg += nvx; vy_avg += nvy;

        neighbours++;
      }

      if (neighbours > 0) {
        px_avg = (px_avg) / neighbours; py_avg = (py_avg) / neighbours;
        vx_avg = (vx_avg) / neighbours; vy_avg = (vy_avg) / neighbours;

        curBoid.setVel(curBoid.getVelX() + ((px_avg - px) * this.cohesion_factor) + ((vx_avg - vx) * this.align_factor) * dt, curBoid.getVelY() + ((py_avg - py) * this.cohesion_factor) + ((vy_avg - vy) * this.align_factor) * dt);
      }

      console.log(sep_x, sep_y)
      curBoid.setVel(curBoid.getVelX() + (sep_x * this.separation_factor) * dt, curBoid.getVelY() + (sep_y * this.separation_factor) * dt);

      if (px > this.width) {curBoid.setVel(curBoid.getVelX() - 10 * dt, curBoid.getVelY());}
      if (px < 0) {curBoid.setVel(curBoid.getVelX() + 10 * dt, curBoid.getVelY());}
      if (py > this.height) {curBoid.setVel(curBoid.getVelX(), curBoid.getVelY() - 10 * dt);}
      if (py < 0) {curBoid.setVel(curBoid.getVelX(), curBoid.getVelY() + 10 * dt);}

      const speed = Math.sqrt((curBoid.getVelX() ** 2) + (curBoid.getVelY() ** 2));

      if (speed > this.boid_max_speed) {
        curBoid.setVel((curBoid.getVelX() / speed) * this.boid_max_speed, (curBoid.getVelY() / speed) * this.boid_max_speed);
      }
      if (speed < this.boid_min_speed) {
        curBoid.setVel((curBoid.getVelX() / speed) * this.boid_min_speed, (curBoid.getVelY() / speed) * this.boid_min_speed);
      }

      curBoid.setPos(curBoid.getPosX() + curBoid.getVelX(), curBoid.getPosY() + curBoid.getVelY());
    }
  }
}

class Boid {
  constructor(x, y, colour) {
    //boid position data
    this.px = x;
    this.py = y;

    //boid velocity data
    this.vx = 0;
    this.vy = 0;

    this.colour = colour;
  }

  getPosX() {
    return this.px;
  }

  getPosY() {
    return this.py;
  }

  getVelX() {
    return this.vx;
  }

  getVelY() {
    return this.vy;
  }

  setPos(x, y) {
    this.px = x; this.py = y;
  }

  setVel(x, y) {
    this.vx = x; this.vy = y;
  }

  setAcc(x, y) {
    this.acc_x = x; this.acc_y = y;
  }
}

return class MyEffect {
  constructor(display) {
    this.display = display;

    this.groups = [
      new BoidGroup([0,255,0], this.display.width, this.display.height),
      new BoidGroup([255,0,0], this.display.width, this.display.height),
      new BoidGroup([0,0,255], this.display.width, this.display.height)
    ];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 20; j++) {
        const rx = Math.random() * ((this.display.width - 20) - 20) + 20, ry = Math.random() * ((this.display.height - 20) - 20) + 20;
        this.groups[i].addBoid(rx, ry);
      }
    }
   

    this.#clear();
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
    this.#clear();

    for (let i = 0; i < 3; i++) {
      const boids = this.groups[i].getBoids();
      for (let j = 0; j < this.groups[i].numBoids(); j++) {
        const boid = boids[j];
        const x = Math.floor(boid.getPosX()), y = Math.floor(boid.getPosY());

        if (x >= this.display.width || x < 0 || isNaN(x)) {continue;}
        if (y >= this.display.height || y < 0 || isNaN(y)) {continue;}

        this.display.setPixel(x, y, this.groups[i].getGroupColour());
      }
      this.groups[i].update(1/30);
    }
    
    
    this.display.flush();
  }
}