// A simple animation of pacman eating a matrix of dots
//
// ᗧ···ᗣ···ᗣ··
// ···········
// ···········
// ···········
//
// (ghosts may be introduced in the future)
//
// Author: saragarcia6123

return class Pacman {
  constructor(display) {
    this.display = display;

    // Pacman animation frames
    const pac0 = [ // closed mouth
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    ];

    const pac1 = [ // small mouth
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    ];

    const pac2 = [ // medium mouth
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    ];

    const pac3 = [ // fully open mouth
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    ];

    // Constants
    this.tick = 0;
    this.current_frame = 0;
    this.animation_delay = 1;  // Tick interval between animation frames
    this.pac_speed = 2;        // How fast pacman travels
    this.dot_size = 2;
    this.yellow = [255, 230, 0];
    this.white = [255, 255, 255];

    const pac_right = [pac0, pac1, pac2, pac3, pac3, pac2, pac1, pac0];

    // mirror every row left-right -> mouth now points left
    function flipHorizontal(frame) {
      return frame.map(row => [...row].reverse());
    }

    // rotate the grid 90° clockwise -> mouth points down
    function rotate90CW(frame) {
      const n = frame.length;
      const out = [];
      for (let y = 0; y < n; y++) {
        const row = [];
        for (let x = 0; x < n; x++) {
          row.push(frame[n - 1 - x][y]);
        }
        out.push(row);
      }
      return out;
    }

    // rotate the grid 90° counter-clockwise -> mouth points up
    function rotate90CCW(frame) {
      const n = frame.length;
      const out = [];
      for (let y = 0; y < n; y++) {
        const row = [];
        for (let x = 0; x < n; x++) {
          row.push(frame[x][n - 1 - y]);
        }
        out.push(row);
      }
      return out;
    }

    const pac_left = pac_right.map(flipHorizontal);
    const pac_up = pac_right.map(rotate90CCW);
    const pac_down = pac_right.map(rotate90CW);

    this.pac_frames = {
      'R': pac_right,
      'L': pac_left,
      'U': pac_up,
      'D': pac_down,
    };

    this.pac_size = pac0.length;

    this.x_offset = 5;
    this.y_offset = 2;

    // Start position (off screen initially)
    this.pac_x = -this.pac_size;
    this.pac_y = 0;

    this.pac_dir = "R";
    this.state = "move";

    this.n_rows = Math.floor(this.display.width / this.pac_size);
    this.n_cols = Math.floor(this.display.height / this.pac_size);

    this.dots = [];
    for (let i = 0; i < this.n_rows; i++) {
      this.dots[i] = [];
      for (let j = 0; j < this.n_cols; j++) {
        this.dots[i][j] = 1;
      }
    }

    this.#clear();
  }

  draw_shape(pixels, offsetX, offsetY, color) {
    for (let y = 0; y < pixels.length; y++) {
      for (let x = 0; x < pixels[y].length; x++) {
        if (!pixels[y][x]) continue;

        let px = offsetX + x;
        let py = offsetY + y;

        if (px < 0 || px >= this.display.width) continue;
        if (py < 0 || py >= this.display.height) continue;

        this.display.setPixel(px, py, color);
      }
    }
  }

  #clear() {
    for (let x = 0; x < this.display.width; x++) {
      for (let y = 0; y < this.display.height; y++) {
        this.display.setPixel(x, y, [0, 0, 0]);
      }
    }
    this.display.flush();
  }

    #handleRowEnd(nextDir) {
      const targetY = this.pac_y + this.pac_size;
  
      if (targetY + this.pac_size > this.display.height) {
        // final row carries on off border
        this.pac_dir = "R";
        this.state = "exit";
        return;
      }
  
      this.turn_target_y = targetY;
      this.next_dir = nextDir;
      this.state = "turn";
    }
  
    #reset() {
      this.pac_x = -this.pac_size;
      this.pac_y = 0;
      this.pac_dir = "R";
      this.state = "move";

      // Gradually speed up
      this.pac_speed += 1;

      // Limit max speed then reset
      if (this.pac_speed == 8) {
        this.pac_speed = 2;
      }
  
      for (let i = 0; i < this.n_rows; i++) {
        for (let j = 0; j < this.n_cols; j++) {
          this.dots[i][j] = 1;
        }
      }
    }

  #pac_col() {
    return Math.floor((this.pac_x + this.pac_size / 2) / this.pac_size);
  }

  #pac_row() {
    return Math.floor((this.pac_y + this.pac_size / 2) / this.pac_size);
  }

  update() {
    // Tick
    this.tick += 1;

    // Extra animation delay for speed control
    if (this.tick < this.animation_delay) {
      this.display.flush();
      return;
    }
    this.tick = 0;

    // ---

    // Render
    this.#clear();

    // Draw dots
    for (let row = 0; row < this.dots.length; row++) {
      for (let col = 0; col < this.dots[0].length; col++) {
        if (!this.dots[row][col]) continue;

        let dx = (row * this.pac_size) + Math.floor(this.pac_size / 2) + this.x_offset;
        let dy = (col * this.pac_size) + Math.floor(this.pac_size / 2) + this.y_offset;

        for (let i = 0; i < this.dot_size; i++) {
          for (let j = 0; j < this.dot_size; j++) {
            this.display.setPixel(dx + j, dy + i, this.white);
          }
        }
      }
    }

    // Draw pacman
    this.draw_shape(
      this.pac_frames[this.pac_dir][this.current_frame],
      this.pac_x + this.x_offset,
      this.pac_y + this.y_offset,
      this.yellow
    );

    this.current_frame += 1;
    this.current_frame %= 8;

    // ---

    // Movement
    if (this.state === "move") {
      if (this.pac_dir === "R") {
        this.pac_x += this.pac_speed;
        if (this.pac_x + Math.floor(this.pac_size * 1.5) + this.x_offset >= this.display.width) {
          this.pac_x = this.display.width - Math.floor(this.pac_size * 1.5) - this.x_offset;
          this.#handleRowEnd("L");
        }

      } else if (this.pac_dir === "L") {
        this.pac_x -= this.pac_speed;
        if (this.pac_x <= 0) {
          this.pac_x = 0;
          this.#handleRowEnd("R");
        }
      }
    } else if (this.state === "turn") {
      this.pac_dir = "D";
      this.pac_y += this.pac_speed;
      if (this.pac_y >= this.turn_target_y) {
        this.pac_y = this.turn_target_y;
        this.pac_dir = this.next_dir;
        this.state = "move";
      }
    } else if (this.state === "exit") {
      this.pac_x += this.pac_speed;
      if (this.pac_x > this.display.width) {
        this.#reset();
      }
    }

    // Eat the dot under pacman's current cell

    if (
      this.#pac_col() >= 0 && this.#pac_col() < this.n_rows &&
      this.#pac_row() >= 0 && this.#pac_row() < this.n_cols
    ) {
      this.dots[this.#pac_col()][this.#pac_row()] = 0;
    }

    this.display.flush();
  }
}
