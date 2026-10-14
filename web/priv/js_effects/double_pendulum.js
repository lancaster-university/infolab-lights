return class DoublePendulum {
  constructor(display) {
    this.display = display;

    // physical parameters
    this.m1 = 1;
    this.m2 = 1;
    this.l1 = 1;
    this.l2 = 1;
    this.gravity = 10.0;

    // initial angles measured from the downward vertical
    this.theta1 = 2.2;
    this.theta2 = 1.8;
    this.omega1 = 0;
    this.omega2 = 0;

    // lower pendulum trail
    this.trail = [];
    this.maxTrail = 120;

    this.timeStep = 0.0125;

    // scale to fit display
    const size = Math.min(display.width, display.height);
    this.length1 = size * 0.2;
    this.length2 = this.length1 * 0.9;
  }

  // calculate angular acceleration
  derivatives(state) {
    const [t1, t2, w1, w2] = state;

    const delta = t1 - t2;
    const sinDelta = Math.sin(delta);
    const denominator =
      2 * this.m1 + this.m2 -
      this.m2 * Math.cos(2 * delta);

    const a1 = (
      -this.gravity * (2 * this.m1 + this.m2) * Math.sin(t1)
      - this.m2 * this.gravity * Math.sin(t1 - 2 * t2)
      - 2 * sinDelta * this.m2 * (
        w2 * w2 * this.l2 +
        w1 * w1 * this.l1 * Math.cos(delta)
      )
    ) / (this.l1 * denominator);

    const a2 = (
      2 * sinDelta * (
        w1 * w1 * this.l1 * (this.m1 + this.m2) +
        this.gravity * (this.m1 + this.m2) * Math.cos(t1) +
        w2 * w2 * this.l2 * Math.cos(delta) * this.m2
      )
    ) / (this.l2 * denominator);

    return [w1, w2, a1, a2];
  }

  integrate(dt) {
    const state = [
      this.theta1,
      this.theta2,
      this.omega1,
      this.omega2
    ];

    const add = (a, b, scale) =>
      a.map((value, i) => value + b[i] * scale);

    const k1 = this.derivatives(state);
    const k2 = this.derivatives(add(state, k1, dt / 2));
    const k3 = this.derivatives(add(state, k2, dt / 2));
    const k4 = this.derivatives(add(state, k3, dt));

    const next = state.map((value, i) =>
      value + dt / 6 * (
        k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]
      )
    );

    this.theta1 = next[0];
    this.theta2 = next[1];
    this.omega1 = next[2];
    this.omega2 = next[3];
  }

  plot(x, y, colour) {
    x = Math.round(x);
    y = Math.round(y);

    if (
      x >= 0 && x < this.display.width &&
      y >= 0 && y < this.display.height
    ) {
      this.display.setPixel(x, y, colour);
    }
  }

  drawLine(x0, y0, x1, y1, colour) {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;

    let error = dx - dy;

    while (true) {
      this.plot(x0, y0, colour);

      if (x0 === x1 && y0 === y1) break;

      const e2 = 2 * error;

      if (e2 > -dy) {
        error -= dy;
        x0 += sx;
      }

      if (e2 < dx) {
        error += dx;
        y0 += sy;
      }
    }
  }

  update() {
    const { width, height } = this.display;

    // Clear the previous frame.
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        this.display.setPixel(x, y, [0, 0, 0]);
      }
    }

    this.integrate(this.timeStep);
    this.integrate(this.timeStep);

    // calculate pivot and bob position
    const pivotX = (width - 1) / 2;
    const pivotY = height * 0.4;

    const x1 = pivotX +
      this.length1 * Math.sin(this.theta1);
    const y1 = pivotY +
      this.length1 * Math.cos(this.theta1);

    const x2 = x1 +
      this.length2 * Math.sin(this.theta2);
    const y2 = y1 +
      this.length2 * Math.cos(this.theta2);

    // lower bob trail stuff
    this.trail.push({ x: x2, y: y2 });

    if (this.trail.length > this.maxTrail) {
      this.trail.shift();
    }

    // fading trajectory
    for (let i = 1; i < this.trail.length; i++) {
      const p = this.trail[i - 1];
      const q = this.trail[i];

      const t = i / (this.trail.length - 1);
      const colour = [0, 0, Math.floor(255 * t)];

      this.drawLine(p.x, p.y, q.x, q.y, colour);
    }

    // draw arms and pivots and bobs
    this.drawLine(pivotX, pivotY, x1, y1, [255, 0, 0]);
    this.drawLine(x1, y1, x2, y2, [0, 255, 0]);

    this.plot(pivotX, pivotY, [255, 255, 255]);
    this.plot(x1, y1, [255, 255, 255]);
    this.plot(x2, y2, [255, 255, 255]);

    this.display.flush();
  }
};