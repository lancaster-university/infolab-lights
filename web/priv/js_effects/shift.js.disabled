// Writing effects:
//  Effects are written as a class with an 'update' method that is
//  called to render each frame.
//
// The class you write will be initialized with the backing display for you to manipulate:
//
// display:
//   an object that has a 'setPixel' method, and a 'flush' method,
//    it also has 'width' and 'height' attributes:
//
//   setPixel: function(x: number, y: number, v: [number, number, number])
//     Use this to set the colour of a pixel on the screen
//     v is a 3-tuple of RGB values in the range 0-255
//
//   flush: function()
//     Use this to flush the display buffer to the system.
//     Make sure to call this, otherwise you'll not see anything!
//
//   width: number
//   height: number
//     The size of the display in pixels. 0,0 is the top left corner
//
//

return class MyEffect {
    constructor(display) {
        this.display = display;
        this.#clear();
        this.varLeft = this.display.width;
        this.varRight = 3*this.display.width;
        this.length = 0.1*this.display.width
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
        this.varLeft = this.varLeft - this.length;
        this.varRight = this.varRight - this.length;
        for (let x = 0; x < this.display.width; x++) {
            for (let y = 0; y < this.display.height; y++) {
                if(x>=this.varLeft && x<=this.varRight){
                    this.display.setPixel(x, y, [0, 30, 255]);
                }
                else{
                    this.display.setPixel(x, y, [0, 0, 0]);
                    }
                    
            }
        }
        if (this.varRight == 0){
            this.varLeft = this.display.width;
            this.varRight = 3*this.display.width;
        }
        this.display.flush();
/*
        if(this.varLeft>0){
            this.varleft = this.varLeft - 1
        }else if(this.varRight>0){
            this.varRight = this.varRight -1
        }else{
            this.varLeft = this.display.width
            this.varRight = this.display.width
        }
        this.display.flush();
*/
    }
}