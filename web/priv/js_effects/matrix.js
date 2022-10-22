return class MartixEffect {
  
  constructor(display) {
    this.display = display;
    this.frame = 0;

    //Choose a random color mode each time it's started
    let colorModes = [
      [0,255,0],   //Matrix
      [0,255,255], //Cyan
      [255,0,255], //Purple
    ]

    this.colorMode = colorModes[Math.floor(Math.random() * colorModes.length)];
    
    //Create buffer
    this.buffer = [];
    for (let y = 0; y < this.display.height; y++) {
      let line = [];
      for (let x = 0; x < this.display.width; x++) {
        line.push([0,0,0]);
      }
      this.buffer.push(line);
    }
  }

  //Fade out all the pixels in a row by a percentage
  #fade(row, fadeAmount) {
    fadeAmount = (1 - fadeAmount);
    for (let i = 0; i < row.length; i++) {
      row[i] = [
        row[i][0] * fadeAmount, 
        row[i][1] * fadeAmount, 
        row[i][2] * fadeAmount
      ];
    }
    return row;
  }
  
  //Called 25 times a second
  update() {
    //Decrease percentage to fade out each new top row (longer trails)
    let fadeAmount = 0.2 - (this.frame / 12000);

    //Duplicate the top row and fade it out, move everything down
    this.buffer.pop();
    let newRow = this.#fade(this.buffer[0], fadeAmount);
    this.buffer.unshift(JSON.parse(JSON.stringify(newRow))); //Pass by reference = cringe

    //Randomly place green pixels in the top row
    for (let i = 0; i < 100; i++) {
      if (Math.floor(Math.random() * Math.max(500 - (this.frame / 4),20)) == 0) { //Increase placement chance each frame
        let randomX = Math.floor(Math.random() * this.buffer[0].length);
        this.buffer[0][randomX] = [
            Math.floor(Math.random() * this.colorMode[0]),   //Starting color
            Math.floor(Math.random() * this.colorMode[1]), 
            Math.floor(Math.random() * this.colorMode[2]), 
        ];
      }
    }

    //Update display
    for (let y = 0; y < this.buffer.length; y++) {
      let row = this.buffer[y];
      for (let x = 0; x < row.length; x++) {
        this.display.setPixel(x, y, row[x]);
      }
    }

    this.frame++;
    this.display.flush();
  }
}
