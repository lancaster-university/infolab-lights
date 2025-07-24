// Writing effects:
//  Effects are written as a class with an 'update' method that is
//  called to render each frame.
//
// The class you write will be initialized with the backing display for you to manipulate:
//
// display:
//   an object that has a 'setPixel' method, and a 'flush' method,
//    it also has 'width' and 'height' attributes:
//
//   setPixel: function(x: number, y: number, v: [number, number, number])
//     Use this to set the colour of a pixel on the screen
//     v is a 3-tuple of RGB values in the range 0-255
//
//   flush: function()
//     Use this to flush the display buffer to the system.
//     Make sure to call this, otherwise you'll not see anything!
//
//   width: number
//   height: number
//     The size of the display in pixels. 0,0 is the top left corner
//
//
 
return class MyEffect {
  constructor(display) {
    this.pupil  = [   0,   0,   0 ];
    this.iris   = [   0, 127, 255 ];
    this.sclera = [ 255, 255, 255 ];
    
    this.display = display;
    this.xoffset = Math.floor(this.display.width/2);
    this.yoffset = Math.floor(this.display.height/2);
 
    this.lrad = Math.floor(this.display.width/4);
    this.srad = Math.floor(this.lrad/2);
    this.xmin = this.lrad-10;
    this.xmax = this.lrad+10;
 
    this.blinking=false;
    this.eyelid = 0;
    this.blinkMove = 4;     // Tune for blink speed
    this.blinkLimit = 50;   // Don't close eyelid all the way
    this.blinkProb = 0.005; // Blink if Math.random() < this value
    
    this.count = 0; // Tune for gaze speed
    
    this.gaze = this.xmin;
    this.gazeMove = 1;
 
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
 
  //
  // Native function does no bounds checking
  //
  setPixel(x,y,colour) {
    if (x<0 || x>=this.display.width)
      return;
    if (y<0 || y>=this.display.height)
      return;
    this.display.setPixel(x, y, colour);
  }
  
  circle(rad, Xorig, Yorig, colour) {
    for(let y=-rad; y<=rad; y++) {
      for(let x=-rad; x<=rad; x++) {
        if(Yorig+y>this.eyelid && x*x+y*y <= rad*rad)
            this.setPixel(Xorig+x, Yorig+y, colour);
      }
    }
  }
 
  eyeballs(gaze) {
    // left
    this.circle(this.lrad, this.lrad, this.yoffset, this.sclera);
    this.circle(this.srad, gaze, this.yoffset+this.srad-5, this.iris);
    this.circle(this.srad-4, gaze, this.yoffset+this.srad-5, this.pupil);
 
    // right
    this.circle(this.lrad, this.lrad+this.xoffset, this.yoffset, this.sclera);
    this.circle(this.srad, gaze+this.xoffset, this.yoffset+this.srad-5, this.iris);
    this.circle(this.srad-4, gaze+this.xoffset, this.yoffset+this.srad-5, this.pupil);
  }
 
  update() {
 
    this.#clear();
    this.eyeballs(this.gaze)
    this.display.flush();
    
    if (this.blinking==false && (Math.random()<this.blinkProb))
      this.blinking=true;
    if (this.blinking) {
      this.eyelid=this.eyelid+this.blinkMove
      if (this.eyelid<=0 || this.eyelid>=this.blinkLimit)
        this.blinkMove=this.blinkMove*-1;
      if (this.eyelid<this.blinkMove)
        this.blinking=false;
    }
    
    this.count=(this.count+1)%2;
    if (this.count==0) {
      this.gaze=this.gaze+this.gazeMove
      if (this.gaze<=this.xmin || this.gaze>=this.xmax)
        this.gazeMove=this.gazeMove*-1;
    }
  }
}