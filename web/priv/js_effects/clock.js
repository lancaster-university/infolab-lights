return class MyEffect {
  constructor(display) {
    this.black = [   0,   0,   0 ];
    this.white = [ 255, 255, 255 ];
    
    this.colours = [
      [ 255,   0,   0 ], // Red
      [ 255, 165,   0 ], // Orange
      [ 255, 255,   0 ], // Yellow
      [   0, 255,   0 ], // Green
      [   0, 255, 255 ], // Cyan
      [   0,   0, 255 ], // Blue
      [ 127,   0, 255 ], // Indigo
      [ 255,   0, 255 ], // Magenta
      [   0, 165, 165 ], // Teal
      [ 255, 255, 255 ]  // White
    ];
    
    // Rounded digits
    this.charSet1 = [
      0x69, 0x90, 0x99, 0x60, // 0
      0x26, 0x22, 0x22, 0x70, // 1
      0x69, 0x12, 0x48, 0xf0, // 2
      0x69, 0x16, 0x19, 0x60, // 3
      0x13, 0x59, 0xf1, 0x10, // 4
      0xf8, 0x86, 0x19, 0x60, // 5
      0x69, 0x86, 0x99, 0x60, // 6
      0xf1, 0x12, 0x44, 0x40, // 7
      0x69, 0x96, 0x99, 0x60, // 8
      0x69, 0x96, 0x19, 0x60, // 9
      0x11, 0x22, 0x44, 0x80  // /
    ];

    // 7-Seg like digits
    this.charSet2 = [
      0xf9, 0x99, 0x99, 0xf0, // 0
      0x11, 0x11, 0x11, 0x10, // 1
      0xf1, 0x1f, 0x88, 0xf0, // 2
      0xf1, 0x1f, 0x11, 0xf0, // 3
      0x99, 0x9f, 0x11, 0x10, // 4
      0xf8, 0x8f, 0x11, 0xf0, // 5
      0xf8, 0x8f, 0x99, 0xf0, // 6
      0xf1, 0x11, 0x11, 0x10, // 7
      0xf9, 0x9f, 0x99, 0xf0, // 8
      0xf9, 0x9f, 0x11, 0xf0, // 9
      0x11, 0x22, 0x44, 0x80  // /
    ];

    this.charSet = (Math.random( ) < 0.5) ? this.charSet1 : this.charSet2;
    
    this.timePxlWidth  =  6;
    this.timePxlHeight =  6;
    this.datePxlWidth  =  2;
    this.datePxlHeight =  2;
    this.dateOffset    = 60;
    
    this.display = display;
    
    this.#clear( );
  }

  #clear( ) {
    for ( let x = 0; x < this.display.width; x++ )
      for ( let y = 0; y < this.display.height; y++ )
        this.display.setPixel( x, y, this.black );

    this.display.flush();
  }

  row( val, x, y, width, offset, colour ) {
    for( let i = 16; i > 0; i >>= 1 ) {
      let pxl = ( val & i >> 1 ) > 0;
      for ( let span = 0; span < width; span++ )
        this.display.setPixel( x++, y + offset, pxl ? colour : this.black )
    }
  }

  digit( xPos, n, width, height, offset, colour ) {
    xPos *= width * 5;
    let index = n * 4;
    for ( let y = 1; y < 5; y++ ) {
      let bitmap = this.charSet[ index++ ];
      for ( let dy = 0; dy < height * 2; dy++ )
        this.row( ( dy < height ) ? bitmap >> 4 : bitmap & 15,
                 xPos, y * height * 2 + dy, width, offset, colour );
    }
  }

  tdigit( xPos, n, colour ) {
    this.digit( xPos, n, this.timePxlWidth, this.timePxlHeight, 0, colour );
  }

  ddigit( xPos, n ) {
    this.digit( xPos, n,
               this.datePxlWidth, this.datePxlHeight,
               this.dateOffset, this.white );
  }
  
  update( ) {
    let date    = new Date( );
    let hours   = date.getHours( );
    let mins    = date.getMinutes( );
    let secs    = date.getSeconds( );
    let hcolour = this.colours[ Math.floor(secs / 10) ];
    let lcolour = this.colours[ secs % 10 ];
    
    this.tdigit( 0, Math.floor(hours / 10), this.white );
    this.tdigit( 1, hours % 10, this.white );
    this.tdigit( 2, Math.floor(mins / 10), hcolour );
    this.tdigit( 3, mins % 10, lcolour );

    let day   = date.getDay( );
    let month = date.getMonth( ) + 1;
    let year  = date.getFullYear( );
    
    this.ddigit( 1, Math.floor(day / 10) );
    this.ddigit( 2, day % 10 );
    this.ddigit( 3, 10 );
    this.ddigit( 4, Math.floor(month / 10) );
    this.ddigit( 5, month % 10 );
    this.ddigit( 6, 10 );
    this.ddigit( 7, Math.floor(year / 1000) % 10 );
    this.ddigit( 8, Math.floor(year / 100) % 10 );
    this.ddigit( 9, Math.floor(year / 10) % 10 );
    this.ddigit(10, year % 10 );
    
    this.display.flush( );
  }
}
