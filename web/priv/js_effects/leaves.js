const LEAF_DENSITY = 400;
const LEAF_COLOURS = [
    [214, 60, 22],
    [236, 110, 20],
    [250, 160, 28],
    [245, 200, 50],
    [176, 40, 24],
    [150, 82, 30],
    [198, 132, 40],
    [120, 110, 30]
];
const MIN_DEPTH = 0.45;
const MIN_LEAF_LENGTH = 1.5;
const MIN_FALL_SPEED = 0.44;
const MAX_FALL_SPEED = 0.66;
const MIN_REST_FRAMES = 120;
const MAX_REST_FRAMES = 280;
const GUST_STRENGTH = 1.4;
const OFFSCREEN_MARGIN = 25;
const SAMPLES = 10;

return class LeavesEffect {
    leaves = [];
    frame = 0;

    constructor(display) {
        this.display = display;
        this.width = display.width;
        this.height = display.height;
        this.pixelBuffer = new Float32Array(this.width * this.height * 3);
        this.background = new Float32Array(this.width * this.height * 3);

        this.#initBackground();
        this.#initLeaves(Math.round((this.width * this.height) / LEAF_DENSITY));
    }

    #random(min, max) {
        return min + Math.random() * (max - min);
    }

    #initBackground() {
        for (let y = 0; y < this.height; y++) {
            const depth = y / (this.height - 1);
            const isGround = y >= this.height - 2;
            const colour = isGround
                ? [30, 17, 9]
                : [5 + 40 * depth * depth, 7 + 18 * depth * depth, 20 + 8 * depth];

            for (let x = 0; x < this.width; x++) {
                const i = (y * this.width + x) * 3;
                this.background[i] = colour[0];
                this.background[i + 1] = colour[1];
                this.background[i + 2] = colour[2];
            }
        }
    }

    #initLeaves(count) {
        for (let i = 0; i < count; i++) {
            const leaf = { depth: this.#random(MIN_DEPTH, 1) };
            this.#resetLeaf(leaf);
            leaf.y = Math.random() * this.height;
            this.leaves.push(leaf);
        }

        this.leaves.sort((a, b) => a.depth - b.depth);
    }

    #randomColour() {
        const base = LEAF_COLOURS[Math.floor(Math.random() * LEAF_COLOURS.length)];
        const variation = this.#random(0.85, 1.15);
        return base.map((channel) => Math.min(255, channel * variation));
    }

    #resetLeaf(leaf) {
        const length = Math.max(MIN_LEAF_LENGTH, this.#random(1.6, 4) * leaf.depth);

        leaf.x = this.#random(-20, this.width + 20);
        leaf.y = this.#random(-31, -6);
        leaf.colour = this.#randomColour();
        leaf.length = length;
        leaf.breadth = length * this.#random(0.5, 0.7);
        leaf.fallSpeed = this.#random(MIN_FALL_SPEED, MAX_FALL_SPEED) * leaf.depth;
        leaf.swayAmount = this.#random(0.25, 0.75) * leaf.depth;
        leaf.swaySpeed = this.#random(0.04, 0.09);
        leaf.swayPhase = this.#random(0, Math.PI * 2);
        leaf.tilt = this.#random(0, Math.PI);
        leaf.spin = this.#random(-0.015, 0.015);
        leaf.angle = leaf.tilt;
        leaf.flip = this.#random(0, Math.PI * 2);
        leaf.flipSpeed = this.#random(0.05, 0.15);
        leaf.groundY = this.height - 1.5 - this.#random(0, 2.5) * leaf.depth;
        leaf.restFrames = 0;
        leaf.maxRestFrames = this.#random(MIN_REST_FRAMES, MAX_REST_FRAMES);
    }

    #getWind() {
        const gust = Math.pow(Math.max(0, Math.sin(this.frame * 0.0045 + 2)), 6);

        return 0.14 * Math.sin(this.frame * 0.007)
            + 0.08 * Math.sin(this.frame * 0.023 + 1)
            + GUST_STRENGTH * gust * Math.sin(this.frame * 0.0011);
    }

    #moveLeaf(leaf, wind) {
        if (leaf.restFrames > 0) {
            leaf.restFrames++;
            if (leaf.restFrames > leaf.maxRestFrames) {
                this.#resetLeaf(leaf);
            }
            return;
        }

        leaf.swayPhase += leaf.swaySpeed;
        const sway = Math.sin(leaf.swayPhase);

        leaf.x += wind * leaf.depth + sway * leaf.swayAmount;
        leaf.y += leaf.fallSpeed * (0.55 + 0.9 * Math.abs(sway));
        leaf.tilt += leaf.spin + wind * 0.02;
        leaf.angle = leaf.tilt + sway * 0.8;
        leaf.flip += leaf.flipSpeed;

        const wrapWidth = this.width + OFFSCREEN_MARGIN * 2;
        if (leaf.x < -OFFSCREEN_MARGIN) {
            leaf.x += wrapWidth;
        }
        if (leaf.x > this.width + OFFSCREEN_MARGIN) {
            leaf.x -= wrapWidth;
        }

        if (leaf.y >= leaf.groundY) {
            leaf.y = leaf.groundY;
            leaf.restFrames = 1;
            leaf.angle = this.#random(-0.25, 0.25);
            leaf.flip = 1.1;
        }
    }

    #getCoverage(leaf, x, y, breadth, cos, sin) {
        let hits = 0;

        for (let sampleY = 0; sampleY < SAMPLES; sampleY++) {
            for (let sampleX = 0; sampleX < SAMPLES; sampleX++) {
                const dx = x + (sampleX + 0.5) / SAMPLES - 0.5 - leaf.x;
                const dy = y + (sampleY + 0.5) / SAMPLES - 0.5 - leaf.y;
                const along = (dx * cos + dy * sin) / leaf.length;
                const across = (dy * cos - dx * sin) / breadth;

                if (Math.abs(along) < 1 && Math.abs(across) <= 1 - along * along) {
                    hits++;
                }
            }
        }

        return hits / (SAMPLES * SAMPLES);
    }

    #drawLeaf(leaf) {
        const facing = Math.abs(Math.cos(leaf.flip));
        const breadth = Math.max(0.45, leaf.breadth * (0.25 + 0.75 * facing));
        const brightness = (0.6 + 0.4 * facing) * (0.5 + 0.5 * leaf.depth);
        const opacity = leaf.restFrames > 0
            ? Math.max(0, 1 - leaf.restFrames / leaf.maxRestFrames)
            : 1;
        const cos = Math.cos(leaf.angle);
        const sin = Math.sin(leaf.angle);

        const radius = Math.ceil(leaf.length) + 1;
        const minX = Math.max(0, Math.floor(leaf.x - radius));
        const maxX = Math.min(this.width - 1, Math.ceil(leaf.x + radius));
        const minY = Math.max(0, Math.floor(leaf.y - radius));
        const maxY = Math.min(this.height - 1, Math.ceil(leaf.y + radius));

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const blend = this.#getCoverage(leaf, x, y, breadth, cos, sin) * opacity;
                if (blend === 0) {
                    continue;
                }

                const i = (y * this.width + x) * 3;
                for (let channel = 0; channel < 3; channel++) {
                    const target = leaf.colour[channel] * brightness;
                    this.pixelBuffer[i + channel] += (target - this.pixelBuffer[i + channel]) * blend;
                }
            }
        }
    }

    update() {
        this.frame++;
        this.pixelBuffer.set(this.background);

        const wind = this.#getWind();
        for (let leaf of this.leaves) {
            this.#moveLeaf(leaf, wind);
            this.#drawLeaf(leaf);
        }

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const i = (y * this.width + x) * 3;
                this.display.setPixel(x, y, [
                    Math.floor(this.pixelBuffer[i]),
                    Math.floor(this.pixelBuffer[i + 1]),
                    Math.floor(this.pixelBuffer[i + 2])
                ]);
            }
        }

        this.display.flush();
    }
}
