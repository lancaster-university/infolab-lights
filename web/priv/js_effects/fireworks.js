function uniformBetween(min, max) {
  return Math.random() * (max - min) + min;
}

// https://stackoverflow.com/a/49434653
function normalBetween(min, max) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random() //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random()
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)

  num = num / 10.0 + 0.5 // Translate to 0 -> 1
  if (num > 1 || num < 0)
    num = randn_bm(min, max) // resample between 0 and 1 if out of range

  else {
    num *= max - min // Stretch to fill range
    num += min // offset to min
  }
  return num
}

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
function hsvToRgb(h, s, v) {
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


class Buffer {
  /**
   * @param {Array<Array<[number, number, number, number]>>} buffer
   */
  constructor(buffer) {
    this.buffer = buffer;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {[number, number, number, number]} v
   */
  paint(x, y, v) {
    x |= 0;
    y |= 0;

    if (x < 0) {
      return;
    }

    if (x >= this.buffer.length) {
      return;
    }

    if (y < 0) {
      return;
    }

    if (y >= this.buffer[0].length) {
      return;
    }

    this.buffer[x][y] = mergeColours(this.buffer[x][y], v);
  }

  // /**
  //  * @param {Buffer} other
  //  */
  // combine(other) {
  //   for (let x = 0; x < this.buffer.length; x++) {
  //     for (let y = 0; y < this.buffer[0].length; y++) {
  //       this.buffer[x][y] = mergeColours(this.buffer[x][y], other.buffer[x][y]);
  //     }
  //   }
  // }
}

/**
 * @param {[number, number, number, number]} x
 * @param {[number, number, number, number]} y
 */
function mergeColours(x, y) {
  if (x[3] < 0.001) {
    return y;
  }

  if (y[3] < 0.001) {
    return x;
  }

  const z = (1 - x[3]) * y[3]
  const a = z + x[3];

  const r = (z * y[0] + x[0] * x[3]) / a;
  const g = (z * y[1] + x[1] * x[3]) / a;
  const b = (z * y[2] + x[2] * x[3]) / a;

  return [r, g, b, a];
}

class Vector {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * @param {Vector} other
   */
  add(other) {
    return new Vector(
      this.x + other.x,
      this.y + other.y
    );
  }

  inv() {
    return new Vector(
      -this.x,
      -this.y
    );
  }

  /**
   * @param {number} by
   */
  mulScalar(by) {
    return new Vector(
      this.x * by,
      this.y * by,
    );
  }

  /**
   * @param {Vector} other
   */
  mul(other) {
    return new Vector(
      this.x * other.x,
      this.y * other.y
    );
  }

  norm() {
    const mag = this.mag();
    return new Vector(
      this.x / mag,
      this.y / mag
    );
  }

  magSquared() {
    return (this.x * this.x) + (this.y * this.y);
  }

  mag() {
    return Math.sqrt(this.magSquared());
  }
}


// I guess we could also do this by instead drawing curves following the
// trajectory the firework takes, but I decided on just simulating particles and
// keeping track of their positions.
class Particle {
  /**
   * @param {Vector} pos
   * @param {Vector} vel
   * @param {Vector} acc
   */
  constructor(pos, vel, acc) {
    this.pos = pos;
    this.vel = vel;
    this.acc = acc;
  }

  step() {
    this.pos = this.pos.add(this.vel);
    this.vel = this.vel.add(this.acc);
  }
}

class Tracer {
  /**
   * @param {Particle} particle
   * @param {[number, number, number]} colour
   * @param {number} timer
   * @param {FireworksEffect} scene
   */
  constructor(particle, colour, timer, scene) {
    this.particle = particle;
    this.colour = colour;
    this.timer = timer;
    this.fadeTimer = 50;
    this.popped = false;
    this.scene = scene;
    this.previousPositions = new PreviousPositions();
    this.previousPositions.push(this.particle.pos);
  }

  step() {
    this.timer -= 1;

    if (this.timer < 0) {
      this.fadeTimer -= 1;

      if (this.fadeTimer < 0) {
        this.scene.removeTracer(this);
      }
    } else {
      this.particle.step();
      this.previousPositions.push(this.particle.pos);
    }
  }

  /**
   * @param {Buffer} buffer
   */
  drawOnto(buffer) {
    let [r, g, b] = this.colour;
    let a = this.fadeTimer / 50;

    const colour = [r, g, b, a]
    this.previousPositions.drawOnto(buffer, colour, 0.85);
  }

  /**
   * @param {Vector} origin
   * @param {[number, number, number]} colour
   * @param {number} timer
   * @param {FireworksEffect} scene
   */
  static newRandom(origin, colour, timer, scene) {
    const dir = Math.random() * Math.PI * 2;
    const speed = uniformBetween(0.9, 1.1);
    const vel = new Vector(
      Math.cos(dir) * speed,
      Math.sin(dir) * speed
    );

    const particle = new Particle(
      origin, vel, new Vector(0, -0.05)
    );

    return new Tracer(particle, colour, timer, scene);
  }
}


class Firework {
  /**
   * @param {Particle} particle
   * @param {[number, number, number]} colour
   * @param {number} timer
   * @param {number} tracerTimer
   * @param {FireworksEffect} scene
   */
  constructor(particle, colour, timer, tracerTimer, scene) {
    this.particle = particle;
    this.colour = colour;
    this.timer = timer;
    this.fadeTimer = 50;
    this.popped = false;
    this.tracerTimer = tracerTimer;
    this.scene = scene;
    this.previousPositions = new PreviousPositions();
    this.previousPositions.push(this.particle.pos);
  }

  step() {
    this.timer -= 1;

    if (this.timer < 0) {
      if (!this.popped) {
        const numTracers = uniformBetween(3, 10);

        for (let n = 0; n < numTracers; n++) {
          const tracer = Tracer.newRandom(this.particle.pos, this.colour, this.tracerTimer, this.scene);
          this.scene.addTracer(tracer);
        }
        this.popped = true;
      } else {
        this.fadeTimer -= 1;

        if (this.fadeTimer < 0) {
            this.scene.removeFirework(this);
        }
      }
    } else {
      this.particle.step();
      this.particle.acc.y -= 0.007;
      this.previousPositions.push(this.particle.pos);
    }
  }

  x() { return this.particle.pos.x; }
  y() { return this.particle.pos.y; }

  static fireworkPattern = [
    /* .............. */[0, 2],
    /* ... */[-1, 1], [0, 1], [1, 1],
    [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0],
    /* ... */[-1, -1], [0, -1], [1, -1],
    /* .............. */[0, -2]
  ];

  /**
   * @param {Buffer} buffer
   */
  drawOnto(buffer) {
    let [r, g, b] = this.colour;
    let a = this.fadeTimer / 50;

    const colour = [r, g, b, a]
    this.previousPositions.drawOnto(buffer, colour, 0.9);

    if (this.popped) {
      return;
    }

    // draw the point
    for (const [dx, dy] of Firework.fireworkPattern) {
      buffer.paint(this.x() + dx, this.y() + dy, colour);
    }
  }

  /**
   * @param {FireworksEffect} scene
   */
  static newRandom(scene) {
    const startX = uniformBetween(0 + 5, scene.display.width - 5);
    const startAngle = normalBetween(0.3 * Math.PI, 0.7 * Math.PI);
    const startThrust = normalBetween(0.1, 0.26);

    const startAccel = new Vector(
      Math.cos(startAngle) * startThrust,
      Math.sin(startAngle) * startThrust
    );

    const pos = new Vector(startX, 0);
    const vel = new Vector(0, 0);

    const particle = new Particle(pos, vel, startAccel);

    const colour = hsvToRgb(Math.random(), 1.0, 1.0);

    const lifetime = normalBetween(25, 45);
    const tracerLifetime = normalBetween(15, 25);

    return new Firework(particle, colour, lifetime, tracerLifetime, scene);
  }
}

function* pairwise(iterable) {
  const iterator = iterable[Symbol.iterator]()
  let current = iterator.next()
  let next = iterator.next()
  while (!next.done) {
    yield [current.value, next.value]
    current = next
    next = iterator.next()
  }
}

function ipart(x) {
  const isNeg = (x < 0) ? -1 : 1;
  const intPart = Math.floor(Math.abs(x));

  return intPart * isNeg;
}

function fpart(x) {
  return x - ipart(x);
}

function rfpart(x) {
  return 1 - fpart(x);
}

function round(x) {
  return ipart(x + 0.5);
}

class PreviousPositions {
  constructor() {
    /**
     * @type {Array<Vector>}
     */
    this.positions = new Array();
  }

  /**
   * @param {Vector} position
   */
  push(position) {
    this.positions.push(position);
  }

  /**
   * @param {Buffer} buffer
   * @param {[number, number, number, number]} initialColour
   * @param {number} fadeFactor
   */
  drawOnto(buffer, initialColour, fadeFactor) {
    let [r, g, b, a] = initialColour;

    for (const [prev, curr] of pairwise(this.positions.slice().reverse())) {
      PreviousPositions.drawLine([prev.x, prev.y], [curr.x, curr.y], [r, g, b, a], buffer);

      a *= fadeFactor;
    }
  }

  /**
   * @param {[number, number]} start
   * @param {[number, number]} end
   * @param {[number, number, number, number]} colour
   * @param {Buffer} buffer
   */
  static drawLine(start, end, colour, buffer) {
    let [x0, y0] = start;
    let [x1, y1] = end;
    const [r, g, b, a] = colour;

    const steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);

    if (steep) {
      [y0, x0] = [x0, y0];
      [y1, x1] = [x1, y1];
    }

    if (x0 > x1) {
      [x1, x0] = [x0, x1];
      [y1, y0] = [y0, y1];
    }

    const dx = x1 - x0;
    const dy = y1 - y0;
    let gradient = dy / dx;
    if (dx == 0) {
      gradient = 1;
    }

    let xend = round(x0);
    let yend = y0 + gradient * (xend - x0);
    let xgap = rfpart(x0 + 0.5);
    const xpxl1 = xend;
    const ypxl1 = ipart(yend);

    if (steep) {
      buffer.paint(ypxl1, xpxl1, [r, g, b, Math.sqrt(a * rfpart(yend) * xgap)]);
      buffer.paint(ypxl1 + 1, xpxl1, [r, g, b, Math.sqrt(a * fpart(yend) * xgap)]);
    } else {
      buffer.paint(xpxl1, ypxl1, [r, g, b, Math.sqrt(a * rfpart(yend) * xgap)]);
      buffer.paint(xpxl1, ypxl1 + 1, [r, g, b, Math.sqrt(a * fpart(yend) * xgap)]);
    }

    let intery = yend + gradient;

    xend = round(x1);
    yend = y1 + gradient * (xend - x1);
    xgap = fpart(x1 + 0.5);
    const xpxl2 = xend;
    const ypxl2 = ipart(yend);

    if (steep) {
      buffer.paint(ypxl2, xpxl2, [r, g, b, Math.sqrt(a * rfpart(yend) * xgap)]);
      buffer.paint(ypxl2 + 1, xpxl2, [r, g, b, Math.sqrt(a * fpart(yend) * xgap)]);
    } else {
      buffer.paint(xpxl2, ypxl2, [r, g, b, Math.sqrt(a * rfpart(yend) * xgap)]);
      buffer.paint(xpxl2, ypxl2 + 1, [r, g, b, Math.sqrt(a * fpart(yend) * xgap)]);
    }

    if (steep) {
      for (let x = xpxl1 + 1; x < xpxl2; x++) {
        buffer.paint(intery, x, [r, g, b, Math.sqrt(a * rfpart(intery))]);
        buffer.paint(intery + 1, x, [r, g, b, Math.sqrt(a * fpart(intery))]);
        intery += gradient;
      }
    } else {
      for (let x = xpxl1 + 1; x < xpxl2; x++) {
        buffer.paint(x, intery, [r, g, b, Math.sqrt(a * rfpart(intery))]);
        buffer.paint(x, intery + 1, [r, g, Math.sqrt(b, a * fpart(intery))]);
        intery += gradient;
      }
    }
  }
}

return class FireworksEffect {
  constructor(display) {
    this.display = display;

    /**
     * @type {Set<Firework>}
     */
    this.fireworks = new Set();

    /**
     * @type {Set<Tracer>}
     */
    this.tracers = new Set();

    this.clear();
    this.tick = 0;
  }

  clear() {
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

    if ((this.fireworks.size < 15) && (Math.random() > 0.95)) {
      const firework = Firework.newRandom(this);
      this.fireworks.add(firework);
    }

    const buffer = new Buffer(Array.from(Array(this.display.width), () => Array.from(Array(this.display.height), () => [0, 0, 0, 0])));

    for (const firework of this.fireworks) {
      firework.drawOnto(buffer);
      firework.step();
    }

    for (const tracer of this.tracers) {
      tracer.drawOnto(buffer);
      tracer.step();
    }

    for (let x = 0; x < this.display.width; x++) {
      for (let y = 0; y < this.display.height; y++) {
        const [r, g, b, a] = buffer.buffer[x][y];
        this.display.setPixel(x, (this.display.height - 1) - y, [r * a, g * a, b * a]);
      }
    }

    this.display.flush();

    this.position %= 1;
  }

  removeFirework(obj) {
    this.fireworks.delete(obj);
  }

  removeTracer(obj) {
    this.tracers.delete(obj);
  }

  addTracer(obj) {
    this.tracers.add(obj);
  }
}
