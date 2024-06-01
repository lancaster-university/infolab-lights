return class MyEffect {
  constructor(display) {
    this.display = display;
    this.frame = 0;
    this.speed = 3; // speed
    this.#clear();
  }

  #clear() {
    for (let x = 0; x < this.display.width; x++) {
      for (let y = 0; y < this.display.height; y++) {
        if (y >= Math.floor(this.display.height * 0.75)) {
          // grass
          this.display.setPixel(x, y, [0, 255, 0]);
        } else {
          // sky
          this.display.setPixel(x, y, [135, 206, 235]);
        }
      }
    }

    const sunRadius = 5;
    const sunCenterX = this.display.width - sunRadius - 1;
    const sunCenterY = sunRadius + 1;

    // sun
    for (let i = -sunRadius; i <= sunRadius; i++) {
      for (let j = -sunRadius; j <= sunRadius; j++) {
        if (i * i + j * j <= sunRadius * sunRadius) {
          const targetX = sunCenterX + i;
          const targetY = sunCenterY + j;
          if (targetX >= 0 && targetX < this.display.width && targetY >= 0 && targetY < this.display.height) {
            this.display.setPixel(targetX, targetY, [255, 233, 81]);
          }
        }
      }
    }

    // Drawing the clouds
    this.#drawCloud(10, 5);
    this.#drawCloud(34, 15);
    this.#drawCloud(70, 6);
    this.#drawCloud(90, 18);
  }

  #drawCloud(x, y) {
    const CLOUD_PIXEL_MAP = [
      [0, 0, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 0, 0]
    ];

    const CLOUD_COLOR = [255, 255, 255]; // cloud

    for (let i = 0; i < CLOUD_PIXEL_MAP.length; i++) {
      for (let j = 0; j < CLOUD_PIXEL_MAP[i].length; j++) {
        if (CLOUD_PIXEL_MAP[i][j]) {
          const targetX = x + j;
          const targetY = y + i;

          if (targetX >= 0 && targetX < this.display.width && targetY >= 0 && targetY < this.display.height) {
            this.display.setPixel(targetX, targetY, CLOUD_COLOR);
          }
        }
      }
    }
  }

  #drawCoco(x, y) {
    const COCO_PIXEL_MAP_16 = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0]
    ]; 

    const COCO_COLOR = [232, 190, 73]; 

    for (let i = 0; i < COCO_PIXEL_MAP_16.length; i++) {
      for (let j = 0; j < COCO_PIXEL_MAP_16[i].length; j++) {
        if (COCO_PIXEL_MAP_16[i][j]) {
          const targetX = x + j;
          const targetY = y + i;

          if (targetX >= 0 && targetX < this.display.width && targetY >= 0 && targetY < this.display.height) {
            this.display.setPixel(targetX, targetY, COCO_COLOR);
          }
        }
      }
    }
  }

  update() {
    this.#clear();
    
    const y = Math.floor(this.display.height * 0.75) - 16; // dogheight = 16
    const x = ((Math.floor(this.frame / this.speed)) % (this.display.width + 16)) - 16; // check head on screen whilst running

    this.#drawCoco(x, y);

    this.display.flush();
    this.frame++;
  }
}
