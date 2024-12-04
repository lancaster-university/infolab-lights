return class MyEffect {
    constructor(display) {
      this.display = display;
  
      //initialize main flower parameters
      this.growthStage = 0;      //start at 0
      this.maxGrowth = 50;      //maximum growth stage
      this.petalRadius = 0;     //start small and grow
      this.centerRadius = 2;    //initial center size
      this.stemHeight = 0;      //stem starts at 0 height
      this.centerX = Math.floor(this.display.width / 2);
      this.centerY = Math.floor(this.display.height * 0.75); //base of the flower

      this.maxStemHeight = Math.min(Math.floor(this.display.height * 0.25), this.centerY);    //maximum stem height is 25% of the display height
  
      //initialize grass blades
      this.grassHeights = Array.from({ length: this.display.width }, () => 0); //grass starts at height 0
      this.grassMaxHeights = Array.from({ length: this.display.width }, () => Math.floor(Math.random() * Math.floor(this.display.height * 0.25)) + 1); //random max height for each blade

      this.randomFlowers = Array.from({ length: 10 }, () => this.#generateRandomFlower());      //create 10 random flowers
    }
  
    #generateRandomFlower() {
      //create a random flower with random properties
      return {
        x: Math.floor(Math.random() * this.display.width), //random x-position within the display
        stemHeight: 0,
        maxStemHeight: Math.floor(Math.random() * 10) + 5, //random max height between 5 and 15
        petalRadius: Math.floor(Math.random() * 3) + 1, //random petal size (1 to 3)
        color: [
          Math.floor(Math.random() * 256), //random red
          Math.floor(Math.random() * 256), //random green
          Math.floor(Math.random() * 256), //random blue
        ], //random petal color
      };
    }
  
    #drawBackground() {
      //fully redraw the sky and grass
      for (let x = 0; x < this.display.width; x++) {
        for (let y = 0; y < this.display.height; y++) { 
          if (y >= Math.floor(this.display.height * 0.75)) {        //if the pixel is below 75% of the display height (grass area)
            this.display.setPixel(x, y, [0, 255, 0]); //grass green background
          } else {
            this.display.setPixel(x, y, [135, 206, 235]); //sky blue
          }
        }
      }
    }
  
    #drawGrass() {
      //draw growing grass blades from the bottom of the display
      for (let x = 0; x < this.display.width; x++) {
        const grassHeight = this.grassHeights[x];       //get the current height of the grass blade
        for (let y = this.display.height - 1; y > this.display.height - 1 - grassHeight; y--) {     //draw the grass blade from the bottom up
          if (y >= 0) {
            this.display.setPixel(x, y, [0, 200, 0]); //darker green for grass blades
          }
        }
      }
    }
  
    #updateGrass() {
      //update grass blades growth randomly
      for (let x = 0; x < this.display.width; x++) {    //for each blade
        if (
          this.grassHeights[x] < this.grassMaxHeights[x] && //stop at random max height
          Math.random() < 0.1                               //random chance to grow
        ) {
          this.grassHeights[x] += 1; //grass grows randomly
        }
      }
    }
  
    #drawRandomFlowers() {
      //draw all random flowers
      for (const flower of this.randomFlowers) {
        //draw the stem 
        for (
          let y = this.display.height - 1;
          y > this.display.height - 1 - flower.stemHeight;
          y--
        ) {
          if (y >= 0 && y < this.display.height) {          //if the stem is within the display area
            this.display.setPixel(flower.x, y, [0, 100, 0]); //stem green 
          }
        }
  

        if (flower.stemHeight === flower.maxStemHeight) {                               //if the stem is fully grown        
          const flowerCenterY = this.display.height - 1 - flower.stemHeight;            //calculate the flower center
          this.drawFilledCircle(flower.x, flowerCenterY, flower.petalRadius, flower.color); //draw flower petals 
        }
      }
    }
  
    #updateRandomFlowers() {
      //grow random flowers
      for (const flower of this.randomFlowers) {    //for each flower
        if (flower.stemHeight < flower.maxStemHeight && Math.random() < 0.05) { //random chance to grow
          flower.stemHeight += 1; //flower stem grows slowly
        }
      }
    }
  
    drawFilledCircle(cx, cy, r, color) {
      for (let x = -r; x <= r; x++) {        //draw a square around the circle
        for (let y = -r; y <= r; y++) {     //draw a square around the circle
          if (x * x + y * y <= r * r) {     //if the point is within the circle
            const px = Math.round(cx + x); //ensure integer
            const py = Math.round(cy + y); //ensure integer
            //boundary check
            if (px >= 0 && px < this.display.width && py >= 0 && py < this.display.height) {
              this.display.setPixel(px, py, color);
            }
          }
        }
      }
    }
  
    drawStem() {
      const growthFactor = this.stemHeight / this.maxStemHeight; //proportional growth
      const stemThickness = Math.max(1, Math.round(growthFactor * 3)); //dynamic thickness (1 to 3)
  
      for (let y = this.centerY; y > this.centerY - this.stemHeight; y--) {     //draw the stem from the bottom up
        if (y >= 0 && y < this.display.height) {
          for (let x = -Math.floor(stemThickness / 2); x <= Math.floor(stemThickness / 2); x++) {       //adjust horizontal thickness
            const px = this.centerX + x;                //adjust horizontal thickness
            if (px >= 0 && px < this.display.width) {
              this.display.setPixel(px, y, [0, 100, 0]); //stem green
            }
          }
        }
      }
    }
  
    drawFlower() {
      const flowerCenterY = Math.round(this.centerY - this.stemHeight); //ensure integer values
      const petalCount = 6; //number of petals per layer
      const layerCount = 2; //reduced to 2 layers for proportionality
      const layerSpacing = 1.5; //slightly less spacing between layers
  
      if (flowerCenterY >= 0 && flowerCenterY < this.display.height) {    //if the flower is within the display area
        //draw multiple petal layers
        for (let layer = 0; layer < layerCount; layer++) {      
          const currentPetalRadius = Math.round(this.petalRadius + layer * layerSpacing);       //calculate the petal radius  

          //calculate the petal color
          const petalColor = [  
            Math.max(255 - layer * 40, 100), //red decreases slightly with each layer
            Math.min(50 + layer * 20, 255), //green increases slightly with each layer
            Math.min(50 + layer * 20, 255), //blue increases slightly with each layer
          ];        
  
          //draw the petals
          for (let i = 0; i < petalCount; i++) {    
            const angle = (i * 360) / petalCount;                  //calculate the angle of the petal
            const rad = (angle * Math.PI) / 180;                             //convert degrees to radians
            const petalX = Math.round(this.centerX + currentPetalRadius * Math.cos(rad));       //calculate the petal x position
            const petalY = Math.round(flowerCenterY + currentPetalRadius * Math.sin(rad));      //calculate the petal y position
  
            if (petalX >= 0 && petalX < this.display.width && petalY >= 0 && petalY < this.display.height) {     //if the petal is within the display area
              this.drawFilledCircle(petalX, petalY, this.petalRadius / 1.5, petalColor); //smaller petals
            }
          }
        }

        this.drawFilledCircle(this.centerX, flowerCenterY, this.centerRadius, [255, 255, 0]); //yellow center
      }
    }
  
    update() {
      this.#drawBackground();       //draw the background
    
      //update and draw the growing grass
      this.#updateGrass();
      this.#drawGrass();
    
      //update and draw random flowers
      this.#updateRandomFlowers();
      this.#drawRandomFlowers();

      if (this.stemHeight < this.maxStemHeight) {
        this.stemHeight = Math.min(this.stemHeight + 0.5, this.maxStemHeight);      //grow the stem
      }

      const targetPetalRadius = 6;      //maximum petal radius
      const targetCenterRadius = 3;     //adjusted center size for balance
      const growthRate = 0.1;           //smooth increment
    
      //incrementally grow toward the target size
      if (this.petalRadius < targetPetalRadius) {
        this.petalRadius = Math.min(this.petalRadius + growthRate, targetPetalRadius);  //grow the petals
      }
    
      if (this.centerRadius < targetCenterRadius) {
        this.centerRadius = Math.min(this.centerRadius + growthRate / 2, targetCenterRadius);   //grow the center            
      }
      this.drawStem();      //draw the stem
      this.drawFlower();    //draw the flower

      this.display.flush();     //display the changes
    }
  };
