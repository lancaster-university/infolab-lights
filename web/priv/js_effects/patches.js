// Config
const MAX_PATCHES = 35;
const USE_SPEED_RANDOM = false;
const MIN_SPEED = 5;
const MAX_SPEED = 10;
const MIN_COLOUR_RANGE_VAL = 128;
const MS_PERIOD_BEFORE_ADDING_NEW_PATCH = 100;
const BRIGHTNESS_DISTANCE_RANGE = 15;

return class PatchesEffect {
    patches = [];

    constructor(display) {
        this.display = display;
        this.#clear();
        this.#initPatches(1);
    }

    #clear() {
        for (let x = 0; x < this.display.width; x++) {
            for (let y = 0; y < this.display.height; y++) {
                this.display.setPixel(x, y, [0, 0, 0]);
            }
        }

        this.display.flush();
    }

    #randomColor() {
        return [
            Math.floor(Math.random() * MIN_COLOUR_RANGE_VAL) + (255 - MIN_COLOUR_RANGE_VAL),
            Math.floor(Math.random() * MIN_COLOUR_RANGE_VAL) + (255 - MIN_COLOUR_RANGE_VAL),
            Math.floor(Math.random() * MIN_COLOUR_RANGE_VAL) + (255 - MIN_COLOUR_RANGE_VAL)
        ];
    }

    #initPatches(count) {
        for (let i = 0; i < count; i++) {
            this.patches.push({
                x: Math.random() * this.display.width,
                y: Math.random() * this.display.height,
                color: this.#randomColor(),
                directionX: (Math.random() - 0.5) * 2,
                directionY: (Math.random() - 0.5) * 2,
                speed: USE_SPEED_RANDOM ? Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED : 5
            });
        }
    }

    #movePatch(patch) {
        patch.x += patch.directionX * patch.speed;
        patch.y += patch.directionY * patch.speed;

        if (patch.x <= 0 || patch.x >= this.display.width) {
            patch.directionX *= -1;
        }
        if (patch.y <= 0 || patch.y >= this.display.height) {
            patch.directionY *= -1;
        }
    }

    #blendColor(baseColor, blendColor, blendFactor) {
        return [
            Math.min(255, baseColor[0] + blendColor[0] * blendFactor),
            Math.min(255, baseColor[1] + blendColor[1] * blendFactor),
            Math.min(255, baseColor[2] + blendColor[2] * blendFactor)
        ];
    }

    lastPatchTime = Date.now();

    update() {
        const now = Date.now();

        if (now - this.lastPatchTime > MS_PERIOD_BEFORE_ADDING_NEW_PATCH && this.patches.length <= MAX_PATCHES) {
            this.lastPatchTime = now;
            this.patches.push({
                x: Math.random() * this.display.width,
                y: Math.random() * this.display.height,
                color: this.#randomColor(),
                directionX: (Math.random() - 0.5) * 2,
                directionY: (Math.random() - 0.5) * 2,
                speed: USE_SPEED_RANDOM ? Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED : 5
            });
        }

        let pixelBuffer = [];
        for (let x = 0; x < this.display.width; x++) {
            pixelBuffer[x] = [];
            for (let y = 0; y < this.display.height; y++) {
                pixelBuffer[x][y] = [0, 0, 0];
            }
        }

        const total = this.display.width * this.display.height;

        for (let patch of this.patches) {
            this.#movePatch(patch);

            for (let i = 0; i < total; i++) {
                const x = i % this.display.width;
                const y = Math.floor(i / this.display.width);

                const distance = Math.sqrt(
                    Math.pow(x - patch.x, 2) + Math.pow(y - patch.y, 2)
                );

                const brightness = Math.max(0, 1 - distance / BRIGHTNESS_DISTANCE_RANGE);

                pixelBuffer[x][y] = this.#blendColor(
                    pixelBuffer[x][y],
                    patch.color,
                    brightness
                );
            }
        }

        // Incredibly laggy to flush when iterating the patches for some reason, so using a buffer to record changes.
        for (let x = 0; x < this.display.width; x++) {
            for (let y = 0; y < this.display.height; y++) {
                this.display.setPixel(x, y, pixelBuffer[x][y]);
            }
        }

        this.display.flush();
    }
}
