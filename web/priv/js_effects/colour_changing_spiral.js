return class MyEffect 
{   
  add(input, change, dir)
  {
    input+= dir*change;
    return input;
  } 
  constructor(display) 
  {
    this.display = display;
    this.r = 255;
    this.g = 255;
    this.b = 255;
    this.tick = 0;
    this.x=0;
    this.y=0;
    this.rdir=1;
    this.gdir=1;
    this.bdir=1;
    this.layer=0;
    this.ldir=1;
  }
  update()
  {   
    this.tick++;
    this.display.flush();
    //Speed of Change: V
    for (let a = 0;a<  20  ;a++)
    {      
      this.r=this.add(this.r,this.tick%10,this.rdir)
      if (this.r>255||this.r<0)
      {
        this.rdir*=-1;
      }
      this.g=this.add(this.g,(this.tick%100)/10,this.gdir)
      if (this.g>255||this.g<0)
      {
        this.gdir*=-1;
      }
      this.b=this.add(this.b,(this.tick%1000)/100,this.bdir)
      if (this.b>255||this.b<0)
      {
        this.bdir*=-1;
      }      
      this.display.setPixel(this.x, this.y, [this.r, this.g,this.b ]);
      //this.display.setPixel(this.x, this.y, [255,255,255]);
      this.paintspiral();
    }
  }
  paintspiral()
  {     
    if(this.x==40&&this.y==this.display.height/2)
    {
      this.x=0;
      this.y=0;
      this.layer=0;
    }
    if (this.y==this.layer)
    {      
      if (this.x==this.display.width-this.layer-1)
      {
        this.y+=this.ldir;
        if (this.ldir==1)
        {
          this.justarted=false;
        }
        else
        {
          this.juststarted=true;
        }
      }
      else
      {
        this.x+=this.ldir;
      }
    }
    else if (this.x==this.display.width-this.layer-1)
    {
      if (this.y==this.display.height-this.layer-1)
      {
        this.x-=this.ldir;
      }
      else
      {
        this.y+=this.ldir;
      }
    }
    else if (this.y==this.display.height-this.layer-1)
    {      
      if (this.x==this.layer)
      {
        this.y-=this.ldir;
      }
      else
      {
        this.x-=this.ldir;
      }
    }
    else if (this.x==this.layer)
    {      
      if (this.y==this.layer+1)
      {
        this.layer+=this.ldir;
      }
      else
      {
        this.y-=this.ldir;
      }
    }
  }
  paintdown()
  {
      this.x++;
      if (this.x>=this.display.width)
      {
        this.x=0;
        this.y++;
        {
          if (this.y>=this.display.height)
          {
            this.y=0;
          }
        }
      }
  }
}
