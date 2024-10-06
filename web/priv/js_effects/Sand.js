const Pixel = {
  Sand: [194, 178, 128],
  Empty: [0, 0, 0],
};

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

return class SandEffect {
  constructor(display) {
    this.display = display;
    this.frame = 0;
    this.pixels = [];

    for (let y = 0; y < this.display.height; y++) {
      let row = [];
      
      for (let x = 0; x < this.display.width; x++) {
        row.push(Pixel.Empty);
      }

      this.pixels.push(row);
    }
  }

  #get_pixel(x, y) {
    return this.pixels[y][x];
  }

  #set_pixel(x, y, pixel) {
    this.pixels[y][x] = pixel;
  }

  update() {
    for (let i = 0; i < 2; i++) {
      let new_sand_pos = [random(50, this.display.width - 51), random(0, this.display.height - 1)];
  
      this.#set_pixel(new_sand_pos[0], new_sand_pos[1], Pixel.Sand);
    }
    
    if (this.frame % 1 == 0) {
      for (let y = this.display.height - 2; y >= 0; y--) {
        for (let x = 0; x < this.display.width; x++) {
          if (this.#get_pixel(x, y) == Pixel.Sand) {
            let bottom_left_empty = this.#get_pixel(x - 1, y + 1) == Pixel.Empty;
            let bottom_empty = this.#get_pixel(x, y + 1) == Pixel.Empty;
            let bottom_right_empty = this.#get_pixel(x + 1, y + 1) == Pixel.Empty;
            
            if (bottom_empty) {
              this.#set_pixel(x, y, Pixel.Empty);
              this.#set_pixel(x, y + 1, Pixel.Sand);
            }

            else {
              let move_direction = random(0, 1);
              
              if (bottom_left_empty && (!bottom_right_empty || move_direction == 0)) {
                this.#set_pixel(x, y, Pixel.Empty);
                this.#set_pixel(x - 1, y + 1, Pixel.Sand);
              }

              else if (bottom_right_empty && (!bottom_left_empty || move_direction == 1)) {
                this.#set_pixel(x, y, Pixel.Empty);
                this.#set_pixel(x + 1, y + 1, Pixel.Sand);
              }
            }
          }
        }
      }
      
      this.#draw();
    }

    this.frame++;
  }
  
  #draw() {
    for (let y = 0; y < this.display.height; y++) {
      for (let x = 0; x < this.display.width; x++) {
        this.display.setPixel(x, y, this.#get_pixel(x, y));
      }
    }
    
    this.display.flush();
  }
}
