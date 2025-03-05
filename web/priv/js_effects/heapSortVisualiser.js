return class heapSortVisualiser {
    constructor(display) {
        this.display = display;

        // Visualization/array setup
        this.arraySize = 20;             // Number of elements to sort
        this.maxValue = 100;             // Max random value for array elements
        this.array = this.#generateArray(this.arraySize, this.maxValue);
        this.heapSize = this.array.length;

        // Start from the last non-leaf for heap construction
        this.buildIndex = Math.floor(this.heapSize / 2) - 1; 

        // Track current sort position
        this.sortIndex = this.array.length - 1;

        // Tracking swaps
        this.swapIndices = [];

        // State management
        this.state = "buildHeap";

        // Flash control
        this.flashOn = true;   // Toggle color in final state
        this.flashCount = 0;   // Count how many flashes
        this.flashDelay = 10;  // Slower delay specifically for flashing

        // Action delay
        this.delay = 5;      // Delay between updates
        this.counter = 0;     // Counter to manage delay

        this.#clear();
        this.#draw();
    }

    #generateArray(size, maxVal) {
        const arr = [];
        for (let i = 0; i < size; i++) {
            arr.push(Math.floor(Math.random() * maxVal));
        }
        return arr;
    }

    #heapify(n, i) {
        let largest = i;
        let left = 2 * i + 1;
        let right = 2 * i + 2;

        if (left < n && this.array[left] > this.array[largest]) {
            largest = left;
        }
        if (right < n && this.array[right] > this.array[largest]) {
            largest = right;
        }

        if (largest !== i) {
            this.#swap(i, largest);
            this.#heapify(n, largest);
        }
    }

    #swap(i, j) {
        [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
        this.swapIndices = [i, j]; // Record indices of the swap
    }

    #clear() {
        for (let x = 0; x < this.display.width; x++) {
            for (let y = 0; y < this.display.height; y++) {
                this.display.setPixel(x, y, [0, 0, 0]);
            }
        }
        this.display.flush();
    }

    #draw() {
        this.#clear();

        const w = this.display.width;
        const h = this.display.height;
        const barWidth = Math.floor(w / this.array.length);

        for (let i = 0; i < this.array.length; i++) {
            const barHeight = Math.floor((this.array[i] / this.maxValue) * h);
            let color = [255, 255, 255]; // default white
            if (this.state === "flash" && i >= this.heapSize) {
                color = this.flashOn ? [0, 255, 0] : [255, 255, 255]; // Flash entire sorted portion
            } else if (i >= this.heapSize) {
                color = [0, 255, 0]; // static green for sorted elements outside flash state
            } else if (this.swapIndices.includes(i)) {
                color = [255, 0, 0]; // red for swapped elements
            }

            const xStart = i * barWidth;
            for (let x = xStart; x < xStart + barWidth; x++) {
                for (let y = h - 1; y >= h - barHeight; y--) {
                    this.display.setPixel(x, y, color);
                }
            }
        }
        this.display.flush();
        this.swapIndices = []; // Clear swap indicators after drawing
    }

    update() {
        if (++this.counter < (this.state === "flash" ? this.flashDelay : this.delay)) return;
        this.counter = 0;

        switch (this.state) {
            case "buildHeap":
                if (this.buildIndex >= 0) {
                    this.#heapify(this.heapSize, this.buildIndex);
                    this.buildIndex--;
                } else {
                    this.state = "sort";
                }
                break;
            case "sort":
                if (this.sortIndex > 0) {
                    this.#swap(0, this.sortIndex);
                    this.heapSize--;
                    this.#heapify(this.heapSize, 0);
                    this.sortIndex--;
                } else {
                    this.state = "flash";
                }
                break;
            case "flash":
                this.flashOn = !this.flashOn;
                this.flashCount++;
                if (this.flashCount > 20) { // Optionally stop after a number of flashes
                    this.state = "done";                
                }
                break;
        }

        this.#draw();
    }
};

