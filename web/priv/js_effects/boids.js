//first time using js, i hate it - sorry :)
//want to make some more changes to this in the future (i may do that if i get chance)

class BoidGroup {
  constructor(colour, width, height, cohesion_favour, separation_favour, align_favour, boid_max_speed) {
    this.groupColour = colour;
    this.boids = [];
    this.totalBoids = 0;

    this.width = width;
    this.height = height;

    //best not to play with these too much
    this.cohesion_favour = cohesion_favour;
    this.separation_favour = -separation_favour;
    this.align_favour = align_favour;
    this.bound_favour = 25;
    this.separation_distance = 3;
    this.boid_max_speed = boid_max_speed;
    this.boid_min_speed = 1;
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

        //get needed separation for the boid considering neighbouring boids
        if (dist < this.separation_distance) {
          sep_x += dx; sep_y += dy;
        }

        px_avg += npx; py_avg += npy; 
        vx_avg += nvx; vy_avg += nvy;

        neighbours++;
      }

      if (neighbours > 0) {
        //get average position and velocity of all neighbouring boids
        px_avg = px_avg / neighbours; py_avg = py_avg / neighbours;
        vx_avg = vx_avg / neighbours; vy_avg = vy_avg / neighbours;

        //apply cohesion, alignment and separation by setting the velocity of the current boid to mean calculations and offsets
        curBoid.setVel(
          curBoid.getVelX() + (sep_x * this.separation_favour) + 
          ((px_avg - px) * this.cohesion_favour) + 
          ((vx_avg - vx) * this.align_favour) * dt, 
          curBoid.getVelY() + (sep_y * this.separation_favour) + 
          ((py_avg - py) * this.cohesion_favour) + 
          ((vy_avg - vy) * this.align_favour) * dt);
      }

      //make sure the boid stays within the boundary
      if (px > this.width) {curBoid.setVel(curBoid.getVelX() - this.bound_favour * dt, curBoid.getVelY());}
      if (px < 0) {curBoid.setVel(curBoid.getVelX() + this.bound_favour * dt, curBoid.getVelY());}
      if (py > this.height) {curBoid.setVel(curBoid.getVelX(), curBoid.getVelY() - this.bound_favour * dt);}
      if (py < 0) {curBoid.setVel(curBoid.getVelX(), curBoid.getVelY() + this.bound_favour * dt);}

      const speed = Math.sqrt((curBoid.getVelX() ** 2) + (curBoid.getVelY() ** 2));

      //clamp speed, originally used min and max functions but caused NaN errors :(
      if (speed > this.boid_max_speed) {
        curBoid.setVel((curBoid.getVelX() / speed) * this.boid_max_speed, (curBoid.getVelY() / speed) * this.boid_max_speed);
      }
      if (speed < this.boid_min_speed) {
        curBoid.setVel((curBoid.getVelX() / speed) * this.boid_min_speed, (curBoid.getVelY() / speed) * this.boid_min_speed);
      }

      curBoid.setPos(curBoid.getPosX() + curBoid.getVelX(), curBoid.getPosY() + curBoid.getVelY());
    }
  }

  addBoid(x, y) {
    this.boids.push(new Boid(x,y,this.groupColour));
    this.totalBoids++;
  }

  popBoid() {
    const popped = this.boids.pop()
    this.totalBoids--;
  }

  getBoids() {
    return this.boids;
  }

  numBoids() {
    return this.totalBoids;
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

  getBoidColour() {
    return this.colour
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
}

return class MyEffect {
  constructor(display) {
    this.display = display;

    this.groups = [];
    //may add more settings in the future and improve upon customisability
    this.settings = [this.basicRGB.bind(this), this.fireflies.bind(this), this.greenMess.bind(this), this.pinkypurple.bind(this), this.space.bind(this)];
    this.prevTime = new Date().getTime();
    this.resetInterval = 45;

    this.generate()

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

    //handling time stuff
    const currTime = new Date().getTime();
    const dt = (currTime - this.prevTime) / 1000;
    this.prevTime = currTime;
    this.elapsedTime += dt;

    if (this.elapsedTime > this.resetInterval) {
      this.generate();
      return;
    }

    //boid update to lights
    for (let i = 0; i < this.groups.length; i++) {
      const group = this.groups[i];
      const boids = group.getBoids();
      for (let j = 0; j < group.numBoids(); j++) {
        const boid = boids[j];
        const x = Math.floor(boid.getPosX()), y = Math.floor(boid.getPosY());

        if (x >= this.display.width || x < 0 || isNaN(x)) {continue;}
        if (y >= this.display.height || y < 0 || isNaN(y)) {continue;}

        this.display.setPixel(x, y, boid.getBoidColour());
        this.colourAdjacent(x, y, boid.getBoidColour());
      }
      group.update(dt);
    }

    this.display.flush();
  }

  basicRGB() {
    this.groups = [
      new BoidGroup([0,0,255], this.display.width, this.display.height, 0.05, .5, 0.01, 3),
      new BoidGroup([0,255,0], this.display.width, this.display.height, 0.01, 1, 0.01, 3),
      new BoidGroup([255,0,0], this.display.width, this.display.height, 0.01, .5, 0.05, 3)
    ];

    for (let i = 0; i < this.groups.length; i++) {
      for (let j = 0; j < 20; j++) {
        const rx = Math.random() * ((this.display.width - 20) - 20) + 20, ry = Math.random() * ((this.display.height - 20) - 20) + 20;
        this.groups[i].addBoid(rx, ry);
      }
    }
  }

  fireflies() {
    this.groups = [
      new BoidGroup([252, 207, 3], this.display.width, this.display.height, 0.1, 1, 0.1, 2),
      new BoidGroup([235, 232, 52], this.display.width, this.display.height, 0.01, 3, 0.01, 1),
    ];

    for (let i = 0; i < this.groups.length; i++) {
      for (let j = 0; j < (i == 0 ? 30 : 50); j++) {
        const rx = Math.random() * ((this.display.width - 20) - 20) + 20, ry = Math.random() * ((this.display.height - 20) - 20) + 20;
        this.groups[i].addBoid(rx, ry);
      }
    }
  }

  //don't know why i called it this lol
  space() {
    this.groups = [
      new BoidGroup([255,255,255], this.display.width, this.display.height, 0.001, 2, 0.1, 4),
    ];

    for (let i = 0; i < this.groups.length; i++) {
      for (let j = 0; j < 80; j++) {
        const rx = Math.random() * ((this.display.width - 20) - 20) + 20, ry = Math.random() * ((this.display.height - 20) - 20) + 20;
        this.groups[i].addBoid(rx, ry);
      }
    }
  }

  //this completely breaks the separation rule (found this out when implemented incorrectly originally)
  greenMess() {
    this.groups = [
      new BoidGroup([163, 247, 5], this.display.width, this.display.height, 0.005, -0.01, 0.01, 1),
      new BoidGroup([68, 227, 148], this.display.width, this.display.height, 0.005, -0.01, 0.01, 2),
      new BoidGroup([5, 247, 182], this.display.width, this.display.height, 0.005, -0.01, 0.01, 3),
    ];

    for (let i = 0; i < this.groups.length; i++) {
      for (let j = 0; j < 25; j++) {
        const rx = Math.random() * ((this.display.width - 20) - 20) + 20, ry = Math.random() * ((this.display.height - 20) - 20) + 20;
        this.groups[i].addBoid(rx, ry);
      }
    }
  }

  pinkypurple() {
    this.groups = [
      new BoidGroup([247, 69, 197], this.display.width, this.display.height, 0.01, 0.01, 0.01, 3),
      new BoidGroup([224, 17, 247], this.display.width, this.display.height, 0.01, 0.05, 0.025, 2),
    ];

    for (let i = 0; i < this.groups.length; i++) {
      for (let j = 0; j < 40; j++) {
        const rx = Math.random() * ((this.display.width - 20) - 20) + 20, ry = Math.random() * ((this.display.height - 20) - 20) + 20;
        this.groups[i].addBoid(rx, ry);
      }
    }
  }

  generate() {
    this.reset()

    this.settings[Math.floor(Math.random() * this.settings.length)]();
  }

  reset() {
    this.elapsedTime = 0; //used to reset the simulation after some time has passed (in seconds)

    for (let i = 0; i < this.groups.length; i++) {
      const n = this.groups[i].numBoids();
      for (let j = 0; j < n; j++) {
        this.groups[i].popBoid();
      }
      delete this.groups[i];
    }
  }

  //not really the way i wanted to do this but works for now
  colourAdjacent(x, y, colour) {
    const neighbours = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
    //const neighbours = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1], [x+1,y+1], [x-1,y-1], [x-1,y+1], [x+1,[y-1]]];

    const [r,g,b] = colour;

    for (let i = 0; i < neighbours.length; i++) {
      const [nx, ny] = neighbours[i];

      if (nx >= this.display.width || nx < 0) {continue;}
      if (ny >= this.display.height || ny < 0) {continue;}

      this.display.setPixel(nx, ny, [Math.max(0, r - 100), Math.max(0, g - 100), Math.max(0, b - 100)]);
    }
  }
}