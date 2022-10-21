return class MatrixEffect {
  
  constructor(display) {
    this.display = display;

    this.letters = [];
    this.frame = 0;

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

    for (let i = 0; i < 100; i++) {
      if (Math.floor(Math.random() * Math.max((500 - (Math.pow(this.frame, 1)/4)),20)) == 0) {
        this.letters.push([
          Math.floor(Math.random() * this.display.width), //Random X
          0, //Y
          Math.max(
            (0.2 - (this.frame / 12000)) *    //Starting amount of delta opacity 
            1 + ((Math.random() - 0.5)*0), 0
          ), 
          [
            Math.floor(Math.random() * 0),   //Starting color
            Math.floor(Math.random() * 255), 
            Math.floor(Math.random() * 0), 
          ]
        ]);
      }
    }

    for (let i = 0; i < this.letters.length; i++) {
      let letter = this.letters[i];

      //Trail
      let opacity = 1;
      for (let y = letter[1]; y > 0; y--) {
        this.display.setPixel(letter[0], y, [Math.round(letter[3][0] * opacity), Math.round(letter[3][1] * opacity), Math.round(letter[3][2] * opacity)]);
        opacity -= letter[2];
      }

      //Move down
      this.letters[i] = [letter[0], letter[1] + 1, letter[2], letter[3]];
      /*if (this.letters[i][1] >= 1000) {
        this.letters.splice(i, 1);
        i--;
      }*/  
    }

    while (this.letters.length > 1000) {
      this.letters.splice(0,1);
    }

    this.frame++;
    this.display.flush();
  }
}
