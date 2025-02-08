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
    this.boid_perception = 10; //how far away a boid will interact with another boid
    this.boid_max_acceleration = 1;
    this.boid_max_velocity = 2;
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

  calcAcceleration(tx, ty, vx, vy) {
    const norm = Math.sqrt((tx) ** 2 + (ty) ** 2);
    const ux = tx / norm, uy = ty / norm;

    const vel_x = ux * this.boid_max_velocity - vx, vel_y = uy * this.boid_max_velocity - vy;

    return this.clampVelocity(vel_x, vel_y, self.boid_max_acceleration);
  }

  clampVelocity(vx, vy, max) {
    const velNorm = Math.sqrt((vx) ** 2 + (vy) ** 2); //speed
    const uvx = vx / velNorm, uvy = vy / velNorm;

    return [uvx * Math.min(velNorm, max), uvy * Math.min(velNorm, max)];
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

        if (dist > this.boid_perception) {continue;} //boid is too far away

        if (dist < this.separation_distance) {
          sep_x += dx; sep_y += dy;
        }

        px_avg += npx; py_avg += npy; 
        vx_avg += nvx; vy_avg += nvy;

        neighbours++;
      }

      if (neighbours > 0) {
        px_avg = (px_avg - px) / neighbours; py_avg = (py_avg - py) / neighbours;
        vx_avg = (vx_avg - vx) / neighbours; vy_avg = (vy_avg - vy) / neighbours;

        //get acceleration for cohesion
        let [c_acc_x, c_acc_y] = this.calcAcceleration(px_avg, py_avg, vx, vy);
        //get acceleration for alignment
        let [a_acc_x, a_acc_y] = this.calcAcceleration(vx_avg, vy_avg, vx, vy);
        //get acceleration for separation
        let [s_acc_x, s_acc_y] = this.calcAcceleration(sep_x, sep_y, vx, vy);

        c_acc_x *= this.cohesion_factor; c_acc_y *= this.cohesion_factor;
        a_acc_x *= this.cohesion_factor; a_acc_y *= this.align_factor;
        s_acc_x *= this.cohesion_factor; s_acc_y *= this.separation_factor;

        //change acceleration of boid
        curBoid.setAcc(curBoid.getAccX() + c_acc_x, curBoid.getAccY() + c_acc_y);
        curBoid.setAcc(curBoid.getAccX() + a_acc_x, curBoid.getAccY() + a_acc_y);
        curBoid.setAcc(curBoid.getAccX() + s_acc_x, curBoid.getAccY() + s_acc_y);
      }

      //do stuff here so boids stay in boundary
      if (px > this.width) {curBoid.setAcc(curBoid.getAccX() - this.boid_max_acceleration, curBoid.getAccY());}
      if (px < this.width) {curBoid.setAcc(curBoid.getAccX() + this.boid_max_acceleration, curBoid.getAccY());}
      if (py > this.height) {curBoid.setAcc(curBoid.getAccX(), curBoid.getAccY() - this.boid_max_acceleration);}
      if (py < this.height) {curBoid.setAcc(curBoid.getAccX(), curBoid.getAccY() + this.boid_max_acceleration);}

      //change velocity of boid
      curBoid.setVel(this.clampVelocity(vx + curBoid.getAccX() * dt, vy + curBoid.getAccY() * dt, this.boid_max_velocity));
      //change position of boid
      curBoid.setPos(curBoid.getPosX() + curBoid.getVelX() * dt, curBoid.getPosY() + curBoid.getVelY() * dt);
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

    //boid acceleration data
    this.acc_x = 0;
    this.acc_y = 0;

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

  getAccX() {
    return this.acc_x;
  }

  getAccY() {
    return this.acc_y;
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

    this.group = new BoidGroup([255,255,255], this.display.width, this.display.height)

    for (let i = 0; i < 20; i++) {
      this.group.addBoid(this.display.width/2,this.display.height/2);
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

    const boids = this.group.getBoids();
    for (let i = 0; i < this.group.numBoids(); i++) {
      const boid = boids[i];

      this.display.setPixel(Math.floor(boid.getPosX()), Math.floor(boid.getPosY()), this.group.getGroupColour());
    }
    
    //this.group.update(1/30);
    this.display.flush();
  }
}