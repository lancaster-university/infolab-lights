class ComplexNumber {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  squared() {
    return new ComplexNumber((Math.pow(this.a, 2) - Math.pow(this.b, 2)), 2 * this.a * this.b);
  }

  magnitude() {
    return Math.sqrt(Math.pow(this.a, 2) + Math.pow(this.b, 2));
  }

  add(number) {
    return new ComplexNumber(this.a + number.a, this.b + number.b);
  }
}

const iterations = 32;
const max = 8;

return class SandEffect {
  constructor(display) {
    this.display = display;

    for (let y = 0; y < this.display.height; y++) {
      for (let x = 0; x < this.display.width; x++) {
        let c = new ComplexNumber(((x - this.display.width / 2) - 16) / 30, (y - this.display.height / 2) / 30);

        let i = this.#mandelbrot(c);
        let colour;

        if (i < iterations) {
          colour = [i / iterations * 255, i / iterations * 255, i / iterations * 255];
        } else {
          colour = [0, 0, 0];
        }
        
        this.display.setPixel(x, y, colour);
      }
    }
    
    this.display.flush();
  }

  update() {}
  
  #mandelbrot(c) {
    let i = 0;
    let z = new ComplexNumber(0, 0);

    for (let i = 0; i < iterations; i++) {
      z = z.squared().add(c)
      i++;

      if (z.magnitude() > max) {
        return i;
      }
    }

    return iterations;
  }
}
