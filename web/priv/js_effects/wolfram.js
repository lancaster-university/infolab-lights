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

  reset(){
    this.buffer = new Array();
    for(let y=0;y<this.display.height;y++){
      this.buffer[y] = new Array();
      for(let x = 0; x< this.display.width; x++){
        this.buffer[y][x] = 0;
      }
    }
    this.buffer[this.buffer.length-1][Math.floor(this.display.width/2)]=1;
    this.#clear();
  }

  wolframTick(grid){
    // grid.pop();
    let newRow = new Array();
    let oldRow = grid[grid.length-1];
    oldRow.push(oldRow[0]);
    oldRow = [oldRow[oldRow.length-2]].concat(oldRow);
    const rules = ["0,0,1","0,1,0","0,1,1","1,0,0"];
    for(let i=0;i<oldRow.length-2;i++){
      let section = oldRow.slice(i,i+3);
      if (rules.includes(section.toString())){
        newRow.push(1);
      }else{
        newRow.push(0);
      }
    }
    return grid.slice(1,grid.length).concat([newRow]);
  }
  update() {
    this.frameDelay = (this.frameDelay || 0) % 2;
    if( this.frameDelay ==0){
      this.buffer= this.wolframTick(this.buffer);
      for (let y = 0; y < this.display.height; y++) {
        for (let x = 0; x < this.display.width; x++) {
          if(this.buffer[y][x]==1){
            this.display.setPixel(x,y,[255,255,255]);
          }else{
            this.display.setPixel(x,y,[0,0,0]);
          }
        }
      }
      this.display.flush();
    }
    this.frameDelay++;
  }
}

