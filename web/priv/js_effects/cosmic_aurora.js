return class CosmicNebulaCinematic {
  constructor(display) {
    this.display = display;
    this.w = display.width;
    this.h = display.height;

    this.t = 0;
    this.frame = 0;

    const area = this.w * this.h;
    const baseCount = Math.floor(area * 0.18);

    this.starsNear = this.makeStars(Math.floor(baseCount * 0.55), 1, 0.9);
    this.starsMid = this.makeStars(Math.floor(baseCount * 0.35), 2, 0.65);
    this.starsFar = this.makeStars(Math.floor(baseCount * 0.25), 3, 0.4);

    this.shooters = [];
    this.maxShooters = 3;

    this.palette = [];
    for (let i = 0; i < 256; i++) {
      const h = (210 + i * 0.9) % 360;
      this.palette.push(this.hsv(h, 0.95, 1.0));
    }
  }

  rand(seed) {
    const s = Math.sin(seed) * 43758.54;
    return s - Math.floor(s);
  }

  clamp01(x) {
    return x < 0 ? 0 : (x > 1 ? 1 : x);
  }

  smooth(a, b, x) {
    const t = this.clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  }

  hsv(h, s, v) {
    h = ((h % 360) + 360) % 360;
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255),
    ];
  }

  addRGB(a, b) {
    return [
      Math.min(255, a[0] + b[0]),
      Math.min(255, a[1] + b[1]),
      Math.min(255, a[2] + b[2]),
    ];
  }

  mulRGB(a, k) {
    return [
      Math.min(255, Math.max(0, Math.floor(a[0] * k))),
      Math.min(255, Math.max(0, Math.floor(a[1] * k))),
      Math.min(255, Math.max(0, Math.floor(a[2] * k))),
    ];
  }

  makeStars(count, layer, sparkleBias) {
    const stars = [];
    for (let i = 0; i < count; i++) {
      const s = i * (91.7 + layer * 17.3);
      const x = this.rand(s + 11.1) * this.w;
      const y = this.rand(s + 22.2) * this.h;
      const phase = this.rand(s + 33.3) * Math.PI * 2;
      const speed = (1.8 + this.rand(s + 44.4) * 2.8) * (0.6 + layer * 0.25);
      const base = 0.35 + this.rand(s + 55.5) * 0.65;
      const size = this.rand(s + 66.6) < (0.07 + 0.03 * (3 - layer)) ? 2 : 1;
      const hueShift = this.rand(s + 77.7) < sparkleBias ? (200 + this.rand(s + 88.8) * 80) : 0;
      stars.push({ x, y, phase, speed, base, size, layer, hueShift });
    }
    return stars;
  }

  nebulaField(nx, ny, t, driftX, driftY) {
    let v = 0;
    let amp = 1.0;
    let freq = 1.1;

    for (let i = 0; i < 5; i++) {
      const px = nx * freq + driftX * (0.35 + i * 0.06) + Math.sin(t * (0.12 + i * 0.03) + i * 1.7) * 0.18;
      const py = ny * freq + driftY * (0.30 + i * 0.05) + Math.cos(t * (0.10 + i * 0.02) + i * 2.3) * 0.18;

      const n =
        Math.sin((px + t * (0.08 + i * 0.02)) * 6.283 + i * 1.1) *
        Math.cos((py - t * (0.06 + i * 0.02)) * 6.283 + i * 2.0);

      v += n * amp;
      amp *= 0.55;
      freq *= 1.85;
    }

    v = v * 0.5 + 0.5;
    return this.clamp01(v);
  }

  spawnShooter() {
    if (this.shooters.length >= this.maxShooters) return;

    const fromLeft = this.rand(this.t * 31.7 + this.frame * 0.01) < 0.5;
    const x = fromLeft ? -4 : this.w + 4;
    const y = Math.floor(this.rand(this.t * 77.3 + this.frame * 0.02) * (this.h * 0.75));
    const vx = (fromLeft ? 1 : -1) * (1.8 + this.rand(this.t * 9.1 + this.frame * 0.03) * 2.6);
    const vy = 0.35 + this.rand(this.t * 12.9 + this.frame * 0.04) * 0.9;
    const life = 14 + Math.floor(this.rand(this.t * 55.5 + this.frame * 0.05) * 14);
    const tail = 12 + Math.floor(this.rand(this.t * 18.2 + this.frame * 0.06) * 10);
    const glow = 220 + Math.floor(this.rand(this.t * 63.9 + this.frame * 0.07) * 35);
    this.shooters.push({ x, y, vx, vy, life, age: 0, tail, glow });
  }

  stepShooters(buffer) {
    for (let si = this.shooters.length - 1; si >= 0; si--) {
      const s = this.shooters[si];
      s.x += s.vx;
      s.y += s.vy;
      s.age++;

      for (let i = 0; i < s.tail; i++) {
        const tx = Math.round(s.x - s.vx * i);
        const ty = Math.round(s.y - s.vy * i);
        if (tx < 0 || tx >= this.w || ty < 0 || ty >= this.h) continue;

        const fade = 1 - i / s.tail;
        const bright = Math.floor(s.glow * fade);
        const idx = ty * this.w + tx;

        buffer[idx] = this.addRGB(buffer[idx], [bright, bright, Math.min(255, bright + 40)]);
      }

      if (s.age > s.life || s.x < -s.tail - 6 || s.x > this.w + s.tail + 6 || s.y > this.h + s.tail + 6) {
        this.shooters.splice(si, 1);
      }
    }
  }

  drawStars(buffer, stars, parallaxSpeed, tMul) {
    const twBase = this.t * tMul;
    for (const s of stars) {
      let x = s.x + Math.cos(this.t * 0.55 + s.phase) * (0.15 * s.layer);
      let y = s.y + Math.sin(this.t * 0.50 + s.phase) * (0.12 * s.layer);

      x = (x + twBase * parallaxSpeed) % this.w;
      if (x < 0) x += this.w;

      const xi = x | 0;
      const yi = y | 0;
      if (yi < 0 || yi >= this.h) continue;

      const tw = s.base * (0.55 + 0.45 * Math.sin(this.t * s.speed + s.phase));
      const b = Math.floor(210 * tw + 35);

      let star;
      if (s.hueShift) {
        const rgb = this.hsv(s.hueShift + 40 * Math.sin(this.t * 0.7 + s.phase), 0.35, 1.0);
        star = [
          Math.min(255, Math.floor(rgb[0] * (b / 255))),
          Math.min(255, Math.floor(rgb[1] * (b / 255))),
          Math.min(255, Math.floor(rgb[2] * (b / 255))),
        ];
      } else {
        star = [Math.min(255, b), Math.min(255, b), Math.min(255, b + 35)];
      }

      const coords = s.size === 1
        ? [[xi, yi]]
        : [[xi, yi], [xi - 1, yi], [xi + 1, yi], [xi, yi - 1], [xi, yi + 1]];

      for (const [px, py] of coords) {
        if (px < 0 || px >= this.w || py < 0 || py >= this.h) continue;
        const idx = py * this.w + px;
        buffer[idx] = this.addRGB(buffer[idx], star);
      }
    }
  }

  update() {
    this.frame++;
    this.t += 0.075;

    const buffer = new Array(this.w * this.h);
    for (let i = 0; i < buffer.length; i++) buffer[i] = [0, 0, 0];

    const driftX = this.t * 0.22;
    const driftY = this.t * 0.10;

    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const nx = x / this.w;
        const ny = y / this.h;

        const n1 = this.nebulaField(nx, ny, this.t, driftX, driftY);
        const n2 = this.nebulaField(nx, ny, this.t + 12.3, driftX * 0.65, driftY * 0.55);
        const n3 = this.nebulaField(nx, ny, this.t + 27.7, driftX * 0.40, driftY * 0.35);

        const cloudA = this.smooth(0.34, 0.86, n1);
        const cloudB = this.smooth(0.40, 0.90, n2);
        const cloudC = this.smooth(0.46, 0.92, n3);

        const energy = this.clamp01(0.62 * cloudA + 0.42 * cloudB + 0.28 * cloudC);

        const hue =
          235 +
          80 * Math.sin(this.t * 0.14 + x * 0.08) +
          30 * Math.sin(this.t * 0.10 + y * 0.11) +
          20 * Math.sin(this.t * 0.06 + (x + y) * 0.05);

        const v = 0.10 + energy * 0.88;

        const base = this.hsv(hue, 0.98, v);

        const dx = (x / (this.w - 1)) - 0.5;
        const dy = (y / (this.h - 1)) - 0.5;
        const r2 = dx * dx + dy * dy;

        const vignette = 1 - this.smooth(0.12, 0.45, r2);
        const pop = 0.85 + 0.15 * Math.sin(this.t * 0.65 + x * 0.9);

        buffer[y * this.w + x] = this.mulRGB(base, vignette * pop);
      }
    }

    this.drawStars(buffer, this.starsFar, 0.7, 0.30);
    this.drawStars(buffer, this.starsMid, 1.2, 0.55);
    this.drawStars(buffer, this.starsNear, 1.9, 0.85);

    if (this.rand(Math.floor(this.t * 12) + 1234) < 0.08) this.spawnShooter();
    if (this.rand(Math.floor(this.t * 12) + 4321) < 0.05) this.spawnShooter();

    this.stepShooters(buffer);

    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        this.display.setPixel(x, y, buffer[y * this.w + x]);
      }
    }

    this.display.flush();
  }
}