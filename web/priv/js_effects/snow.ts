function uniformBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// https://stackoverflow.com/a/49434653
function normalBetween(min: number, max: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) {
    num = normalBetween(min, max); // resample between 0 and 1 if out of range
  } else {
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
  }
  return num;
}

interface VectorProps {
  x: number;
  y: number;
}

class BaseVector implements VectorProps {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  copyFrom<T extends VectorProps>(other: T) {
    this.x = other.x;
    this.y = other.y;
  }
}

class ScaledVector<T extends VectorProps = Vector> implements VectorProps {
  inner: T;
  scale: number;

  constructor(inner: T, scale: number) {
    this.inner = inner;
    this.scale = scale;
  }

  get x() {
    return this.inner.x * this.scale;
  }

  get y() {
    return this.inner.y * this.scale;
  }
}

class Vector<T extends VectorProps = BaseVector> {
  inner: T;

  constructor(inner: T) {
    this.inner = inner;
  }

  add<U extends VectorProps>(other: U) {
    return new Vector(
      new BaseVector(
        this.x + other.x,
        this.y + other.y,
      ),
    );
  }

  inv() {
    return new Vector(
      new BaseVector(
        -this.x,
        -this.y,
      ),
    );
  }

  scale(by: number) {
    return new Vector(
      new BaseVector(
        this.x * by,
        this.y * by,
      ),
    );
  }

  mul<U extends VectorProps>(other: U) {
    return new Vector(
      new BaseVector(
        this.x * other.x,
        this.y * other.y,
      ),
    );
  }

  norm(): Vector {
    const mag = this.mag();
    return new Vector(
      new BaseVector(
        this.x / mag,
        this.y / mag,
      ),
    );
  }

  magSquared() {
    return (this.x * this.x) + (this.y * this.y);
  }

  mag() {
    return Math.sqrt(this.magSquared());
  }

  tuple(): [number, number] {
    return [this.x, this.y];
  }

  static randomNormal(xrange: [number, number], yrange?: [number, number]) {
    if (yrange === undefined) {
      yrange = xrange;
    }

    return new Vector(
      new BaseVector(
        normalBetween(...xrange),
        normalBetween(...yrange),
      ),
    );
  }

  get x() {
    return this.inner.x;
  }

  get y() {
    return this.inner.y;
  }
}

class Particle<Acc extends VectorProps = BaseVector> {
  pos: Vector;
  vel: Vector;
  acc: Vector<Acc>;

  constructor(pos: Vector, vel: Vector, acc: Vector<Acc>) {
    this.pos = pos;
    this.vel = vel;
    this.acc = acc;
  }

  step() {
    this.pos = this.pos.add(this.vel);
    this.vel = this.vel.add(this.acc);
  }
}

class Snowflake {
  particle: Particle<ScaledVector>;
  length: number;
  colour: [number, number, number, number];
  scene: SnowEffect;

  constructor(
    particle: Particle<ScaledVector>,
    depth: number,
    scene: SnowEffect,
  ) {
    this.particle = particle;
    this.length = 1 + 3 * depth;
    this.colour = [255, 255, 255, 0.5 + 0.5 * depth];
    this.scene = scene;
  }

  step() {
    this.particle.step();

    if (this.particle.pos.y < -(this.length + 2)) {
      this.scene.removeSnowflake(this);
    }

    if (
      this.particle.pos.x < (-this.scene.display.width) ||
      this.particle.pos.x > (2 * this.scene.display.width)
    ) {
      this.scene.removeSnowflake(this);
    }
  }

  static newRandom(
    scene: SnowEffect,
    windVector: Vector,
  ) {
    const startX = uniformBetween(
      -0.5 * scene.display.width,
      1.5 * scene.display.width,
    );
    const origin = new Vector(new BaseVector(startX, scene.display.height));

    const depth = uniformBetween(0, 1);
    const scaleFactor = 0.3 + depth;

    const dir = normalBetween(0.8, 1.2) * Math.PI;
    const speed = -uniformBetween(0.1, 0.15) * scaleFactor;

    const vel = new Vector(
      new BaseVector(
        Math.cos(dir) * speed,
        Math.sin(dir) * speed,
      ),
    );

    const acc = new Vector(new ScaledVector(windVector, scaleFactor));

    const particle = new Particle(
      origin,
      vel,
      acc,
    );

    return new Snowflake(
      particle,
      depth,
      scene,
    );
  }

  drawOnto(buffer: Buffer) {
    const tailPoint = this.particle.pos.add(
      this.particle.vel.norm().scale(this.length).inv(),
    );

    // drawLine(tailPoint.tuple(), this.particle.pos.tuple(), this.colour, buffer);
    buffer.paint(tailPoint.x, tailPoint.y, this.colour);
  }
}

function mergeColours(
  x: [number, number, number, number],
  y: [number, number, number, number],
): [number, number, number, number] {
  if (x[3] < 0.001) {
    return y;
  }

  if (y[3] < 0.001) {
    return x;
  }

  const z = (1 - x[3]) * y[3];
  const a = z + x[3];

  const r = (z * y[0] + x[0] * x[3]) / a;
  const g = (z * y[1] + x[1] * x[3]) / a;
  const b = (z * y[2] + x[2] * x[3]) / a;

  return [r, g, b, a];
}

class Buffer {
  buffer: Array<Array<[number, number, number, number]>>;

  constructor(buffer: Array<Array<[number, number, number, number]>>) {
    this.buffer = buffer;
  }

  paint(x: number, y: number, v: [number, number, number, number]) {
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

  paintOver(x: number, y: number, v: [number, number, number, number]) {
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

    this.buffer[x][y] = v;
  }
}

function ipart(x: number): number {
  const isNeg = (x < 0) ? -1 : 1;
  const intPart = Math.floor(Math.abs(x));

  return intPart * isNeg;
}

function fpart(x: number): number {
  return x - ipart(x);
}

function rfpart(x: number) {
  return 1 - fpart(x);
}

function round(x: number) {
  return ipart(x + 0.5);
}

function drawCircle(
  origin: [number, number],
  radius: number,
  colour: [number, number, number, number],
  buffer: Buffer,
) {
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      if (x * x + y * y < radius * radius + radius) {
        buffer.paintOver(origin[0] + x, origin[1] + y, colour);
      }
    }
  }
}

function drawSquare(
  [x0, y0]: [number, number],
  [x1, y1]: [number, number],
  colour: [number, number, number, number],
  buffer: Buffer,
) {
  if (x1 < x0) {
    [x0, x1] = [x1, x0];
  }

  if (y1 < y0) {
    [y0, y1] = [y1, y0];
  }

  for (let x = x0; x <= x1; x++) {
    for (let y = y0; y <= y1; y++) {
      buffer.paintOver(x, y, colour);
    }
  }
}

function drawLine(
  start: [number, number],
  end: [number, number],
  colour: [number, number, number, number],
  buffer: Buffer,
) {
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
    buffer.paint(ypxl1 + 1, xpxl1, [
      r,
      g,
      b,
      Math.sqrt(a * fpart(yend) * xgap),
    ]);
  } else {
    buffer.paint(xpxl1, ypxl1, [r, g, b, Math.sqrt(a * rfpart(yend) * xgap)]);
    buffer.paint(xpxl1, ypxl1 + 1, [
      r,
      g,
      b,
      Math.sqrt(a * fpart(yend) * xgap),
    ]);
  }

  let intery = yend + gradient;

  xend = round(x1);
  yend = y1 + gradient * (xend - x1);
  xgap = fpart(x1 + 0.5);
  const xpxl2 = xend;
  const ypxl2 = ipart(yend);

  if (steep) {
    buffer.paint(ypxl2, xpxl2, [r, g, b, Math.sqrt(a * rfpart(yend) * xgap)]);
    buffer.paint(ypxl2 + 1, xpxl2, [
      r,
      g,
      b,
      Math.sqrt(a * fpart(yend) * xgap),
    ]);
  } else {
    buffer.paint(xpxl2, ypxl2, [r, g, b, Math.sqrt(a * rfpart(yend) * xgap)]);
    buffer.paint(xpxl2, ypxl2 + 1, [
      r,
      g,
      b,
      Math.sqrt(a * fpart(yend) * xgap),
    ]);
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
      buffer.paint(x, intery + 1, [r, g, b, Math.sqrt(a * fpart(intery))]);
      intery += gradient;
    }
  }
}

function snowman(buffer: Buffer, width: number) {
  const midX = Math.floor(width / 2.0);

  // body
  drawCircle([midX, 10], 15, [255, 255, 255, 1], buffer);
  drawCircle([midX, 31], 10, [255, 255, 255, 1], buffer);
  drawCircle([midX, 45], 8, [255, 255, 255, 1], buffer);

  // eyes
  drawCircle([midX - 3, 48], 1.5, [0, 0, 0, 1], buffer);
  drawCircle([midX + 4, 48], 1.5, [0, 0, 0, 1], buffer);

  // nose
  drawCircle([midX, 46], 1.3, [237, 145, 33, 1], buffer);

  function mouthPiece(x: number, y: number, colour: [number, number, number, number], buffer: Buffer) {
    drawSquare([x, y], [x + 1, y - 1], colour, buffer);
  }

  // mouth
  mouthPiece(midX - 5, 43, [0, 0, 0, 1], buffer);
  mouthPiece(midX - 2, 41, [0, 0, 0, 1], buffer);
  mouthPiece(midX + 1, 41, [0, 0, 0, 1], buffer);
  mouthPiece(midX + 4, 43, [0, 0, 0, 1], buffer);

  // buttons
  const buttonStart = 32;
  drawCircle([midX, buttonStart], 1.5, [0, 0, 0, 1], buffer);
  drawCircle([midX, buttonStart - 6], 1.5, [0, 0, 0, 1], buffer);
  drawCircle([midX, buttonStart - 12], 1.5, [0, 0, 0, 1], buffer);
  drawCircle([midX, buttonStart - 18], 1.5, [0, 0, 0, 1], buffer);

  // arms
  drawLine([midX + 7, 32], [midX + 7 + 20, 32 + 6], [150, 70, 0, 1], buffer);
  drawLine([midX + 7, 33], [midX + 7 + 20, 32 + 6], [150, 70, 0, 1], buffer);

  drawLine([midX - 7, 31], [midX - 7 - 20, 32 + 5], [150, 70, 0, 1], buffer);
  drawLine([midX - 7, 32], [midX - 7 - 20, 32 + 5], [150, 70, 0, 1], buffer);
}

interface Display {
  setPixel(x: number, y: number, v: [number, number, number]): null;
  flush(): null;

  width: number;
  height: number;
}

export class SnowEffect {
  display: Display;
  snowflakes: Set<Snowflake>;
  windVector: Vector;
  windJitter: Vector;
  tick: number;

  constructor(display: Display) {
    this.display = display;

    this.windVector = Vector.randomNormal([-0.01, 0.01], [-0.01, -0.013]);
    this.windJitter = Vector.randomNormal([-0.0002, 0.0002], [
      -0.000001,
      0.000001,
    ]);
    this.snowflakes = new Set();

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

    this.windVector.inner.copyFrom(this.windVector.add(this.windJitter));
    this.windJitter = Vector.randomNormal([-0.002, 0.002], [-0.00001, 0.00001]);

    if (this.snowflakes.size < 300) {
      const snowflake = Snowflake.newRandom(this, this.windVector);
      this.snowflakes.add(snowflake);
    }

    const buffer = new Buffer(
      Array.from(
        Array(this.display.width),
        () => Array.from(Array(this.display.height), () => [0, 0, 0, 0]),
      ),
    );

    snowman(buffer, this.display.width);

    for (const snowflake of this.snowflakes) {
      snowflake.drawOnto(buffer);
      snowflake.step();
    }

    for (let x = 0; x < this.display.width; x++) {
      for (let y = 0; y < this.display.height; y++) {
        const [r, g, b, a] = buffer.buffer[x][y];
        this.display.setPixel(x, (this.display.height - 1) - y, [
          r * a,
          g * a,
          b * a,
        ]);
      }
    }

    this.display.flush();
  }

  removeSnowflake(obj: Snowflake) {
    this.snowflakes.delete(obj);
  }
}
