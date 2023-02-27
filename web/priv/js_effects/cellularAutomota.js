// Wolframs Rule 30 feeding into Conways Game of Life
// inspired by https://www.youtube.com/watch?v=IK7nBOLYzdE
// Slowed using code snippet from John Vidlers colorway
// Author: Dexter Latcham

return class MyEffect {
  constructor(display) {
    this.display = display;
    this.dwidth = BigInt(this.display.width);
    this.conwayHeight = Math.floor(this.display.height *2/3)
    this.wolframHeight = this.display.height - this.conwayHeight;
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

  reset(){
    this.buffer = new Array();
    this.conwayBuffer = new Array();
    this.wolframBuffer = new Array()
    for(let y=0;y<this.conwayHeight;y++){
      this.conwayBuffer[y]=0n;
    }
    for(let y=0;y<this.wolframHeight-1;y++){
      this.wolframBuffer[y] = 0n;
    }
    this.wolframBuffer.push(1n<<(this.dwidth>>1n));
    this.#clear();
  }

  wolframTick(row, rule, width){
    let ret = 0n;
    row = row << 1n;
    if ((row&(1n<<(width-1n)))==1n){
      row++;
    }
    if ((row&2n)==2n){
      row = row + (1n<<(width+1n));
    }

    for(let i=0n;i<width+1n;i++){
      let section = (row>>i)&7n;
      if (((rule>>section)&1n)==1n){
        ret = ret + (1n<<i);
      }
    }
    return ret;
  }
  conwayTick(grid,width){
    let ret = new Array();
    for(let i=0;i<grid.length;i++){
      ret.push(0n);
    }
    for(let i=1;i<grid.length-1;i++){
      for(let j=0n;j<width-1n;j++){
        let n=0;
        for(let k=-1;k<2;k++){
          for(let l=-1n;l<2n;l++){
            if(((grid[i+k]>>(width-1n-j+l))&1n)==1n){
              n+=1;
            }
          }
        }
        if ((((grid[i]>>(width-1n-j))&1n)==1n) && (n==3 || n==4)){
          ret[i] = ret[i]+(1n<<(width-1n-j));
        }else if ((((grid[i]>>(width-1n-j))&1n)==0n) && n==3){
          ret[i] = ret[i] + (1n<<(width -1n -j));
        }
      }
    }
    return ret;
  }
  update() {
    this.frameDelay = (this.frameDelay || 0) % 2;
    if( this.frameDelay == 0){
      this.buffer = this.conwayBuffer.concat(this.wolframBuffer);
      for (let y = 0; y < this.display.height; y++) {        for(let x=0n;x<this.dwidth;x++){
          if((((this.buffer[y])>>x)&1n)==1n){
            this.display.setPixel(this.display.width-Number(x)-1,y,[255,255,255]);
          }else{
            this.display.setPixel(this.display.width-Number(x)-1,y,[0,0,0]);
          }
        }
      }
      this.display.flush();
      this.conwayBuffer = this.conwayTick(this.conwayBuffer,this.dwidth);
      this.conwayBuffer.pop();
      this.conwayBuffer.push(this.wolframBuffer[0]);
      let newrow = this.wolframTick(this.wolframBuffer[this.wolframBuffer.length-1],30n,this.dwidth);
      this.wolframBuffer.push(newrow);
      this.wolframBuffer.shift();
    }
    this.frameDelay++;
  }
}
