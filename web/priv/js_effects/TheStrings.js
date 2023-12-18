
let t = 0;

function make_eq() {
	const elements = ["Math.sin(i)","Math.cos(i)"];
	const symbols = [" + ", " - "];
	let eq = "";
	for (let i = 0; i < 1+parseInt(Math.random()*3); i++) {
		let tr = "(i/" + (1+parseInt(Math.random()*3)) + ")";
		eq += elements[parseInt(Math.random()*elements.length)].replace("(i)",tr);
		eq += symbols[parseInt(Math.random()*symbols.length)];
	}
	return eq.substring(0,eq.length-3);
}

let eqx = make_eq();
let eqy = make_eq();

return class TheStrings {
  constructor(display) {
    this.display = display;

    this.#clear();
  }

  #clear() {
    this.display.flush();
  }

  dist(a,b) {
    return (((this.display.width/2)-a)**2 + ((this.display.height/2)-b)**2);
  }

  update() {
    t+=0.1;
    let length = 3;
    for (let i = t; i < t+length; i+=0.005) {
      let tx = (this.display.width /2)+(parseInt(eval(eqx)*(this.display.width )/4));
      let ty = (this.display.height/2)+(parseInt(eval(eqy)*(this.display.height)/4));
      if (tx > 0 && tx < this.display.width && ty > 0 && ty < this.display.width) {
        let val = ((i/10)*255)%(255*2);
		if (val > 255) {
			val = 255-(val-255);
		}
        let val2 = ((i/15)*255)%(255*2);
		if (val2 > 255) {
			val2 = 255-(val2-255);
		}
        this.display.setPixel(tx, ty, [val,val2,255-val]);
      }
    }
    this.display.flush();
  }
}