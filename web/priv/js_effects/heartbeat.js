return class MyEffect {
  constructor(display) {
    this.display = display;
    this.frame = 0;
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

  heartSmall(scale = 3, brightness = 255) {
    const smallHeart = [
      [0,1,1,0,1,1,0],
      [1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1],
      [0,1,1,1,1,1,0],
      [0,0,1,1,1,0,0],
      [0,0,0,1,0,0,0]
    ];

    const color = [brightness, 0, 0];
    const heartWidth = smallHeart[0].length * scale;
    const heartHeight = smallHeart.length * scale;

    //use offset to keep heart centered
    const offsetX = Math.floor((this.display.width - heartWidth) / 2);
    const offsetY = Math.floor((this.display.height - heartHeight) / 2);

    //draw pixels according to grid and scale of heart passed to function
    for (let y = 0; y < smallHeart.length; y++) {
      for (let x = 0; x < smallHeart[y].length; x++) {
        if (smallHeart[y][x] === 1) {
          for (let dy = 0; dy < scale; dy++) {
            for (let dx = 0; dx < scale; dx++) {
              this.display.setPixel(
                offsetX + x * scale + dx,
                offsetY + y * scale + dy,
                color
              );
            }
          }
        }
      }
    }

    this.display.flush();
  }

  update() {
    this.#clear();

    // Smooth sine wave between 0 and 1
    const pulse = (Math.sin(this.frame / 10) + 1) / 2;

    // Clamp scale between 4 and 8
    const minScale = 4;
    const maxScale = 8;
    const scale = minScale + pulse * (maxScale - minScale);

    // smooth brightness between 100 and 255
    const brightness = Math.floor(100 + pulse * 155);

    this.heartSmall(Math.round(scale), brightness);

    this.frame++;
  }
}
