// Conway's Game of Life
//
// https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
//
// A second CGoL sim, this time with green, fading, coloured trails :)
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
        this.setCell( x, y, Math.random() > 0.90 );
      }
    }

    this.#clear();
  }

  getCell( x, y ) {
    if( x < 0 )
      x += this.display.width;
    if( y < 0 )
      y += this.display.height;
    return this.buffer[y%this.display.height][x%this.display.width] === 255 || 0;
  }

  setCell( x, y, state ) {
    if( x < 0 )
      x += this.display.width;
    if( y < 0 )
      y += this.display.height;
    let curr = this.frame[y%this.display.height][x%this.display.width];
    if( state )
      this.frame[y%this.display.height][x%this.display.width] = 255;
    else
      if( curr === 255 )
        this.frame[y%this.display.height][x%this.display.width] = 254;
      
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
    let shift = Date.now() / 100;
      
    if( this.frameDelay == 0 ) {
      let alive = this.process();
      
      for (let x = 0; x < this.display.width; x++) {
        for (let y = 0; y < this.display.height; y++) {
          let color = this.frame[y][x];
          if( color === 255 )
            this.display.setPixel( x, y, [255,255,255] );
          else
            this.display.setPixel(
              x, y,
              [ 0, color, 0 ]
            );
          
          if( color === 255 )
            this.buffer[y][x] = 255;
          
          if( color < 255 ) {
            if( color > 0 ) {
              this.buffer[y][x] = Math.floor(color * 0.85);
              this.frame[y][x] = Math.floor(color * 0.85);
            } else {
              this.buffer[y][x] = 0;
              this.frame[y][x] = 0;
            }
          }
        }
      }
      this.display.flush();
    }
    
    this.frameDelay++;
  }
}
