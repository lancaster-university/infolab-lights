// Planets, By Orlando Prugel-Bennett
const planets = [
    {
      name: 'Mercury',
      distance: 0.39,
      period: 0.24,
      size: 3,
      texture: [
        [[169, 169, 169], [128, 128, 128], [169, 169, 169]],
        [[128, 128, 128], [169, 169, 169], [128, 128, 128]],
        [[169, 169, 169], [128, 128, 128], [169, 169, 169]],
      ],
      baseAngle: 75 * (Math.PI / 180),
    },
    {
      name: 'Venus',
      distance: 0.72,
      period: 0.62,
      size: 5,
      texture: [
        [[0, 0, 0], [240, 230, 140], [237, 201, 175], [240, 230, 140], [0, 0, 0]],
        [[240, 230, 140], [255, 228, 181], [255, 215, 0], [255, 228, 181], [240, 230, 140]],
        [[237, 201, 175], [255, 215, 0], [218, 165, 32], [255, 215, 0], [237, 201, 175]],
        [[240, 230, 140], [255, 228, 181], [255, 215, 0], [255, 228, 181], [240, 230, 140]],
        [[0, 0, 0], [240, 230, 140], [237, 201, 175], [240, 230, 140], [0, 0, 0]],
      ],
      baseAngle: 45 * (Math.PI / 180),
    },
    {
      name: 'Earth',
      distance: 1.0,
      period: 1.0,
      size: 5,
      texture: [
        [[0, 0, 0], [0, 128, 0], [255, 255, 255], [0, 0, 255], [0, 0, 0]],
        [[0, 128, 0], [0, 128, 0], [0, 0, 255], [0, 128, 0], [0, 128, 0]],
        [[0, 128, 0], [0, 0, 255], [0, 0, 255], [0, 128, 0], [0, 128, 0]],
        [[0, 0, 255], [0, 128, 0], [0, 0, 255], [0, 128, 0], [0, 0, 255]],
        [[0, 0, 0], [0, 128, 0], [255, 255, 255], [0, 0, 255], [0, 0, 0]],
      ],
      baseAngle: -40 * (Math.PI / 180),
    },
    {
      name: 'Mars',
      distance: 1.52,
      period: 1.88,
      size: 3,
      texture: [
        [[205, 92, 92], [178, 34, 34], [205, 92, 92]],
        [[178, 34, 34], [205, 92, 92], [178, 34, 34]],
        [[205, 92, 92], [178, 34, 34], [205, 92, 92]],
      ],
      baseAngle: -80 * (Math.PI / 180),
    },
    {
      name: 'Jupiter',
      distance: 5.2,
      period: 11.86,
      size: 7,
      texture: [
        [[0, 0, 0], [220, 137, 90], [220, 137, 90], [220, 137, 90], [220, 137, 90], [220, 137, 90], [0, 0, 0]],
        [[185, 138, 135], [185, 138, 135], [185, 138, 135], [185, 138, 135], [185, 138, 135], [185, 138, 135], [185, 138, 135]],
        [[210, 180, 140], [210, 180, 140], [210, 180, 140], [210, 180, 140], [210, 180, 140], [210, 180, 140], [210, 180, 140]],
        [[179, 61, 83], [179, 61, 83], [179, 61, 83], [179, 61, 83], [179, 61, 83], [179, 61, 83], [179, 61, 83]],
        [[233, 235, 208], [165, 46, 78], [165, 46, 78], [233, 235, 208], [233, 235, 208], [233, 235, 208], [233, 235, 208]],
        [[194, 122, 88], [194, 122, 88], [194, 122, 88], [194, 122, 88], [194, 122, 88], [194, 122, 88], [194, 122, 88]],
        [[0, 0, 0], [91, 42, 86], [91, 42, 86], [91, 42, 86], [91, 42, 86], [91, 42, 86], [0, 0, 0]]
      ],
      baseAngle: -72 * (Math.PI / 180),
    },
    {
      name: 'Saturn',
      distance: 9.58,
      period: 29.46,
      size: 9,
      texture: [
        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [225, 162, 122], [239, 172, 130], [225, 162, 122], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0, 0], [0, 0, 0], [233, 168, 124], [239, 172, 130], [233, 168, 124], [239, 172, 130], [233, 168, 124], [211, 210, 177], [229, 226, 191]],
        [[123, 122, 103], [88, 87, 74], [229, 226, 191], [211, 210, 177], [229, 226, 191], [211, 210, 177], [229, 226, 191], [88, 87, 74], [123, 122, 103]],
        [[229, 226, 191], [211, 210, 177], [233, 168, 124], [233, 168, 124], [239, 172, 130], [225, 162, 122], [239, 172, 130], [0, 0, 0], [0, 0, 0]],
        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [225, 162, 122], [225, 162, 122], [225, 162, 122], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
      ],
      baseAngle: 12 * (Math.PI / 180),
    },
    {
      name: 'Uranus',
      distance: 19.2,
      period: 84.02,
      size: 5,
      texture: [
        [[0, 0, 0], [173, 216, 230], [176, 224, 230], [173, 216, 230], [0, 0, 0]],
        [[173, 216, 230], [224, 255, 255], [176, 196, 222], [224, 255, 255], [173, 216, 230]],
        [[176, 224, 230], [176, 196, 222], [135, 206, 235], [176, 196, 222], [176, 224, 230]],
        [[173, 216, 230], [224, 255, 255], [176, 196, 222], [224, 255, 255], [173, 216, 230]],
        [[0, 0, 0], [173, 216, 230], [176, 224, 230], [173, 216, 230], [0, 0, 0]],
      ],
      baseAngle: -54 * (Math.PI / 180),
    },
    {
      name: 'Neptune',
      distance: 30.1,
      period: 164.79,
      size: 5,
      texture: [
        [[0, 0, 0], [0, 0, 205], [65, 105, 225], [0, 0, 205], [0, 0, 0]],
        [[0, 0, 205], [65, 105, 225], [100, 149, 237], [65, 105, 225], [0, 0, 205]],
        [[65, 105, 225], [100, 149, 237], [70, 130, 180], [100, 149, 237], [65, 105, 225]],
        [[0, 0, 205], [65, 105, 225], [100, 149, 237], [65, 105, 225], [0, 0, 205]],
        [[0, 0, 0], [0, 0, 205], [65, 105, 225], [0, 0, 205], [0, 0, 0]],
      ],
      baseAngle: 0 * (Math.PI / 180),
    },
  ];
  
  return class SolarSystemEffect {
    constructor(display) {
      this.display = display;
      this.centerX = Math.floor(display.width / 2);
      this.centerY = Math.floor(display.height / 2);
  
      // Adjusted scale factor to fit all planets
      this.scaleFactor = Math.min(this.centerX, this.centerY) / (Math.log(planets[planets.length - 1].distance + 1) + 0.5);
  
      this.referenceDate = new Date().getTime(); // Current date and time
      this.millisecondsPerYear = 1000 * 60 * 60 * 24 * 365.25;
  
      // Animation phases
      this.animationPhase = 0;
      this.totalFramesInitialAnimation = 200; // Frames for initial animation (slowed down)
      this.totalFramesHoldToday = 600; // Frames to hold 'TODAY' display (slowed down)
      this.animationFrame = 0;
      this.animationStartDate = this.referenceDate - 10 * this.millisecondsPerYear;
  
      // Forward animation parameters
      this.forwardAnimationStartDate = this.referenceDate;
      this.forwardAnimationEndDate = new Date('2099-12-31').getTime();
      this.forwardAnimationRate = this.millisecondsPerYear / 2; // 0.5 years per second (slowed down)
  
      // Loop parameters
      this.loopStartDate = new Date('2000-01-01').getTime();
  
      // Sun's texture with rounded corners
      this.sunSize = 9;
      this.sunTexture = [
        [[0, 0, 0], [0, 0, 0], [255, 180, 0], [255, 160, 0], [255, 140, 0], [255, 160, 0], [255, 180, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0, 0], [255, 200, 0], [255, 180, 0], [255, 160, 0], [255, 140, 0], [255, 160, 0], [255, 180, 0], [255, 200, 0], [0, 0, 0]],
        [[255, 223, 0], [255, 200, 0], [255, 180, 0], [255, 160, 0], [255, 140, 0], [255, 160, 0], [255, 180, 0], [255, 200, 0], [255, 223, 0]],
        [[255, 200, 0], [255, 180, 0], [255, 160, 0], [255, 140, 0], [255, 120, 0], [255, 140, 0], [255, 160, 0], [255, 180, 0], [255, 200, 0]],
        [[255, 180, 0], [255, 160, 0], [255, 140, 0], [255, 120, 0], [255, 100, 0], [255, 120, 0], [255, 140, 0], [255, 160, 0], [255, 180, 0]],
        [[255, 200, 0], [255, 180, 0], [255, 160, 0], [255, 140, 0], [255, 120, 0], [255, 140, 0], [255, 160, 0], [255, 180, 0], [255, 200, 0]],
        [[255, 223, 0], [255, 200, 0], [255, 180, 0], [255, 160, 0], [255, 140, 0], [255, 160, 0], [255, 180, 0], [255, 200, 0], [255, 223, 0]],
        [[0, 0, 0], [255, 200, 0], [255, 180, 0], [255, 160, 0], [255, 140, 0], [255, 160, 0], [255, 180, 0], [255, 200, 0], [0, 0, 0]],
        [[0, 0, 0], [0, 0, 0], [255, 180, 0], [255, 160, 0], [255, 140, 0], [255, 160, 0], [255, 180, 0], [0, 0, 0], [0, 0, 0]],
      ];
  
      // Digit bitmaps for numbers 0-9, '.', and 'TODAY' (7 pixels tall)
      this.digits = {
        '0': [
          ' ### ',
          '#   #',
          '#  ##',
          '# # #',
          '##  #',
          '#   #',
          ' ### ',
        ],
        '1': [
          '  #  ',
          ' ##  ',
          '# #  ',
          '  #  ',
          '  #  ',
          '  #  ',
          '#####',
        ],
        '2': [
          ' ### ',
          '#   #',
          '    #',
          '   # ',
          '  #  ',
          ' #   ',
          '#####',
        ],
        '3': [
          ' ### ',
          '#   #',
          '    #',
          '  ## ',
          '    #',
          '#   #',
          ' ### ',
        ],
        '4': [
          '   # ',
          '  ## ',
          ' # # ',
          '#  # ',
          '#####',
          '   # ',
          '   # ',
        ],
        '5': [
          '#####',
          '#    ',
          '#### ',
          '    #',
          '    #',
          '#   #',
          ' ### ',
        ],
        '6': [
          ' ### ',
          '#   #',
          '#    ',
          '#### ',
          '#   #',
          '#   #',
          ' ### ',
        ],
        '7': [
          '#####',
          '    #',
          '   # ',
          '  #  ',
          '  #  ',
          '  #  ',
          '  #  ',
        ],
        '8': [
          ' ### ',
          '#   #',
          '#   #',
          ' ### ',
          '#   #',
          '#   #',
          ' ### ',
        ],
        '9': [
          ' ### ',
          '#   #',
          '#   #',
          ' ####',
          '    #',
          '#   #',
          ' ### ',
        ],
        '.': [
          '     ',
          '     ',
          '     ',
          '     ',
          '     ',
          '  ## ',
          '  ## ',
        ],
        'T': [
          '#####',
          '  #  ',
          '  #  ',
          '  #  ',
          '  #  ',
          '  #  ',
          '  #  ',
        ],
        'O': [
          ' ### ',
          '#   #',
          '#   #',
          '#   #',
          '#   #',
          '#   #',
          ' ### ',
        ],
        'D': [
          '#### ',
          '#   #',
          '#   #',
          '#   #',
          '#   #',
          '#   #',
          '#### ',
        ],
        'A': [
          ' ### ',
          '#   #',
          '#   #',
          '#####',
          '#   #',
          '#   #',
          '#   #',
        ],
        'Y': [
          '#   #',
          '#   #',
          ' # # ',
          '  #  ',
          '  #  ',
          '  #  ',
          '  #  ',
        ],
      };
  
      this.digitWidth = 5;
      this.digitHeight = 7;
  
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
  
    #drawPlanetTexture(x, y, texture) {
      const height = texture.length;
      const width = texture[0].length;
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          const color = texture[i][j];
          const px = x + j - Math.floor(width / 2);
          const py = y + i - Math.floor(height / 2);
          if (color[0] !== 0 || color[1] !== 0 || color[2] !== 0) {
            if (
              px >= 0 &&
              px < this.display.width &&
              py >= 0 &&
              py < this.display.height
            ) {
              this.display.setPixel(px, py, color);
            }
          }
        }
      }
    }
  
    #getAngle(planet, now) {
      const yearsSinceRef =
        (now - this.referenceDate) / this.millisecondsPerYear; // Years since reference date
      return (
        planet.baseAngle +
        ((2 * Math.PI * (yearsSinceRef % planet.period)) / planet.period)
      ); // Updated angle in radians
    }
  
    #drawText(text) {
      const xStart = 1; // Moved right by 1 pixel
      const yStart = this.display.height - this.digitHeight - 1; // Moved up by 1 pixel
      let xOffset = xStart;
  
      for (const char of text) {
        if (char in this.digits) {
          const bitmap = this.digits[char];
          for (let y = 0; y < this.digitHeight; y++) {
            const row = bitmap[y];
            for (let x = 0; x < this.digitWidth; x++) {
              if (row[x] === '#') {
                const px = xOffset + x;
                const py = yStart + y;
                if (
                  px >= 0 &&
                  px < this.display.width &&
                  py >= 0 &&
                  py < this.display.height
                ) {
                  this.display.setPixel(px, py, [255, 255, 255]); // White color for text
                }
              }
            }
          }
          xOffset += this.digitWidth + 1; // Move to the next character position
        } else if (char === ' ') {
          xOffset += this.digitWidth + 1; // Space between words
        }
      }
    }
  
    update() {
      this.#clear();
  
      let now;
  
      if (this.animationPhase === 0) {
        // Phase 0: Initial animation from 10 years ago to current date
        now =
          this.animationStartDate +
          (this.animationFrame / this.totalFramesInitialAnimation) *
            10 *
            this.millisecondsPerYear;
  
        this.animationFrame++;
  
        if (this.animationFrame >= this.totalFramesInitialAnimation) {
          this.animationPhase = 1;
          this.animationFrame = 0; // Reset frame counter for the next phase
        }
      } else if (this.animationPhase === 1) {
        // Phase 1: Hold at current date ('TODAY') for 30 seconds
        now = this.referenceDate; // Keep the current date
  
        this.animationFrame++;
  
        if (this.animationFrame >= this.totalFramesHoldToday) {
          this.animationPhase = 2;
          this.animationFrame = 0; // Reset frame counter for the next phase
          this.forwardAnimationStartTime = new Date().getTime(); // Record the start time
          this.forwardAnimationStartDate = this.referenceDate;
        }
      } else if (this.animationPhase === 2) {
        // Phase 2: Animate forward in time until 2099
        const elapsedTime = new Date().getTime() - this.forwardAnimationStartTime;
        now = this.forwardAnimationStartDate + elapsedTime * (this.forwardAnimationRate / 1000);
  
        // Check if we've reached or passed the end date
        if (now >= this.forwardAnimationEndDate) {
          now = this.forwardAnimationEndDate;
          this.animationPhase = 3; // Move to the looping phase
          this.loopStartTime = new Date().getTime();
          this.loopAnimationStartDate = this.loopStartDate;
          this.forwardAnimationStartTime = new Date().getTime();
          this.pausedAtToday = false; // Ensure pause flag is reset
        }
      } else if (this.animationPhase === 3) {
        // Phase 3: Looping from 2000 to 2099
        const elapsedTime = new Date().getTime() - this.forwardAnimationStartTime;
        now = this.loopAnimationStartDate + elapsedTime * (this.forwardAnimationRate / 1000);
  
        // Check if we've reached or passed the current date
        if (now >= this.referenceDate && !this.pausedAtToday) {
          now = this.referenceDate;
          this.pausedAtToday = true;
          this.pauseStartTime = new Date().getTime();
        }
  
        // If paused at 'TODAY', check if pause duration has passed
        if (this.pausedAtToday) {
          const pauseElapsed = new Date().getTime() - this.pauseStartTime;
          if (pauseElapsed >= 30000) {
            // 30 seconds have passed
            this.pausedAtToday = false;
            this.forwardAnimationStartTime = new Date().getTime();
            this.loopAnimationStartDate = this.referenceDate;
          } else {
            now = this.referenceDate; // Keep displaying 'TODAY'
          }
        }
  
        // Loop back to the year 2000 after reaching 2099
        if (now >= this.forwardAnimationEndDate) {
          this.loopAnimationStartDate = this.loopStartDate;
          this.forwardAnimationStartTime = new Date().getTime();
          this.pausedAtToday = false; // Reset pause flag
        }
      }
  
      // Draw the Sun at the center using the texture
      this.#drawPlanetTexture(this.centerX, this.centerY, this.sunTexture);
  
      // Draw each planet
      planets.forEach((planet) => {
        // Apply logarithmic scaling to the distance and adjust for the Sun's size
        const logDistance =
          Math.log(planet.distance + 1) * this.scaleFactor + this.sunSize / 2;
  
        const angle = this.#getAngle(planet, now);
  
        // Calculate position based on angle and scaled distance
        const x = this.centerX + Math.round(logDistance * Math.cos(angle));
        const y = this.centerY + Math.round(logDistance * Math.sin(angle));
  
        // Draw the planet using its texture
        this.#drawPlanetTexture(x, y, planet.texture);
      });
  
      // Display 'TODAY' when the current date is reached
      if (
        (this.animationPhase === 1) ||
        (this.animationPhase === 3 && this.pausedAtToday)
      ) {
        this.#drawText('TODAY');
      } else {
        // Otherwise, display the date as DD.MM.YY
        const date = new Date(now);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = String(date.getFullYear() % 100).padStart(2, '0');
        const dateString = `${day}.${month}.${year}`;
  
        // Draw the date on the display
        this.#drawText(dateString);
      }
  
      this.display.flush();
    }
  }
  