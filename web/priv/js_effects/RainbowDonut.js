return class MyEffect {
    constructor(display) {
      this.display = display;
      this.angleA = 0;
      this.angleB = 0;
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
      const R1 = 5;
      const R2 = 10;
      const K1 = 75;
      const K2 = 5;
      const width = this.display.width;
      const height = this.display.height;
      const A = this.angleA;
      const B = this.angleB;
  
      for (let theta = 0; theta < 2 * Math.PI; theta += 0.07) {
        for (let phi = 0; phi < 2 * Math.PI; phi += 0.02) {
          const cosA = Math.cos(A);
          const sinA = Math.sin(A);
          const cosB = Math.cos(B);
          const sinB = Math.sin(B);
          const cosTheta = Math.cos(theta);
          const sinTheta = Math.sin(theta);
          const cosPhi = Math.cos(phi);
          const sinPhi = Math.sin(phi);
  
          const circleX = R2 + R1 * cosTheta;
          const circleY = R1 * sinTheta;
  
          const x = circleX * (cosB * cosPhi + sinA * sinB * sinPhi) - circleY * cosA * sinB;
          const y = circleX * (sinB * cosPhi - sinA * cosB * sinPhi) + circleY * cosA * cosB;
          const z = K2 + cosA * circleX * sinPhi + circleY * sinA;
          const ooz = 1 / z;
  
          const xp = Math.floor(width / 2 + K1 * ooz * x);
          const yp = Math.floor(height / 2 - K1 * ooz * y);
  
          if (xp >= 0 && xp < width && yp >= 0 && yp < height) {
            const luminance = Math.floor(8 * ((sinB * (sinTheta * cosPhi - cosTheta * sinPhi * sinA) - cosA * cosTheta * sinPhi - cosB * (cosTheta * cosPhi + sinTheta * sinPhi * sinA))));
            if (luminance > 0) {
              const red = Math.floor(128 + 127 * Math.sin(theta));
              const green = Math.floor(128 + 127 * Math.sin(phi));
              const blue = Math.floor(128 + 127 * Math.sin(theta + phi));
              this.display.setPixel(xp, yp, [red, green, blue]);
            }
          }
        }
      }
  
      this.display.flush();
      this.angleA += 0.04;
      this.angleB += 0.02;
    }
  }