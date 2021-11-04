// Conway's Game of Life
//
// https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
//
// Intentionally slowed down the framerate, otherwise certain elements
// can become a bit strobe-y...
//
// Author: John Vidler

return class MyEffect {
  constructor(display) {
    this.display = display;
    this.reset();
  }

  #clear() {
    for (let x = 0; x < this.display.width; x++) {
      for (let y = 0; y < this.display.height; y++) {
        this.display.setPixel(x, y, [0, 0, 0]);
      }
    }

    this.display.flush();
  }

  reset() {
    this.buffer = new Array();
    this.frame = new Array();

    for (let y = 0; y < this.display.height; y++) {
      this.buffer[y] = new Array();
      this.frame[y] = new Array();
      for (let x = 0; x < this.display.width; x++) {
        this.buffer[y][x] = false;
        this.frame[y][x] = Math.random() > 0.93;
      }
    }

    this.#clear();
  }

  getCell( x, y ) {
    if( x < 0 )
      x += this.display.width;
    if( y < 0 )
      y += this.display.height;
    return this.buffer[y%this.display.height][x%this.display.width] || false;
  }

  setCell( x, y, state ) {
    if( x < 0 )
      x += this.display.width;
    if( y < 0 )
      y += this.display.height;
    this.frame[y%this.display.height][x%this.display.width] = state;
  }

  process() {
    let count = 0;
    for (let x = 0; x < this.display.width; x++) {
      for (let y = 0; y < this.display.height; y++) {
        let near =
          this.getCell( x+1, y-1 ) +
          this.getCell( x+1, y ) +
          this.getCell( x+1, y+1 ) +
          this.getCell( x, y-1 ) +
          this.getCell( x, y+1 ) +
          this.getCell( x-1, y-1 ) +
          this.getCell( x-1, y ) +
          this.getCell( x-1, y+1 );
          
        let state = this.getCell( x, y );

        if( state ) {
          if( near > 3 )
            this.setCell( x, y, false ); // Overpopulation
  
          if( near < 3 )
            this.setCell( x, y, false ); // Underpopulation
        }
        
        if( near === 3 )
          this.setCell( x, y, true ); // Reproduction
        
        if( near === 2 )
          this.setCell( x, y, state ); // Persist
        
        count = (state?count+1:count)
      }
    }
    return count;
  }

  update() {
    this.frameDelay = (this.frameDelay || 0) % 2;
    
    if( this.frameDelay == 0 ) {
      let alive = this.process();
      
      let color = [255, 255, 255];
      
      for (let x = 0; x < this.display.width; x++) {
        for (let y = 0; y < this.display.height; y++) {
          if( this.frame[y][x] || false )
            this.display.setPixel(x, y, color);
          else
            this.display.setPixel(x, y, [0,0,0]);
          this.buffer[y][x] = this.frame[y][x] || false;
        }
      }
      this.display.flush();
    }
    
    this.frameDelay++;
  }
}
