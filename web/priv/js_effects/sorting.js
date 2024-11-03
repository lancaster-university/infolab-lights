// Sorting Algorithm Demo, By Orlando Prugel-Bennett
return class MyEffect {
  constructor(display) {
    this.display = display;
    this.width = display.width;
    this.height = display.height;
    this.numLines = this.width;
    this.lines = [];
    this.sortingState = {};
    this.sortingAlgorithms = [
      'insertionSort',
      'bubbleSort',
      'selectionSort',
      'quickSort',
      'mergeSort',
      'heapSort',
      'radixSort',
      'stdSort',
      'stableSort',
      'shellSort',
      'cocktailShakerSort',
      'gnomeSort',
      'bitonicSort',
      'bogoSort',
    ];
    this.ROYGBIV = [
      [255, 0, 0],      // Red
      [255, 127, 0],    // Orange
      [255, 255, 0],    // Yellow
      [0, 255, 0],      // Green
      [0, 0, 255],      // Blue
      [75, 0, 130],     // Indigo
      [143, 0, 255],    // Violet
    ];
    this.debug = false; // Toggle to filter through algorithms one by one 
    this.currentAlgorithmIndex = 0;
    this.currentAlgorithm = null;
    this.useRainbowGradient = false; 
    this.initLines();
    this.clear();
  }

  initLines() {
    this.lines = [];
    this.sortingState = {};

    if (this.debug) {
      if (this.currentAlgorithmIndex < this.sortingAlgorithms.length) {
        this.currentAlgorithm = this.sortingAlgorithms[this.currentAlgorithmIndex];
        console.log(`Debug Mode: Testing ${this.currentAlgorithm}`);
      } else {
        console.log("All algorithms have been tested.");
        this.debug = false;
        this.currentAlgorithm = null;
        return;
      }
    } else {
      this.currentAlgorithm = this.selectRandomAlgorithm();
      console.log(`Selected Algorithm: ${this.currentAlgorithm}`);
    }

    if (this.currentAlgorithm === 'bogoSort') {
      this.initializeBogoSort();
    } else {
      this.initializeRegularSort();
    }
  }

  initializeBogoSort() {
    const heights = Array.from({ length: this.numLines }, (_, i) =>
      Math.floor(((i + 1) / this.numLines) * this.height)
    );
    this.shuffleArray(heights);

    heights.forEach((height, i) => {
      const color = this.ROYGBIV[i % this.ROYGBIV.length];
      this.lines.push({ height, color });
    });
  }

  initializeRegularSort() {
    this.startColor = this.getRandomBrightColor();
    this.endColor = this.getRandomBrightColor();

    for (let i = 0; i < this.numLines; i++) {
      const height = Math.floor(((i + 1) / this.numLines) * this.height);
      const progress = (i + 1) / this.numLines;
      const color = this.generateColor(progress);
      this.lines.push({ height, color });
    }

    this.shuffleArray(this.lines);
  }

  selectRandomAlgorithm() {
    return Math.random() < 0.01 ? 'bogoSort' : this.getRandomAlgorithm(); // set to 1 to get guaranteed bogoSort
  }

  getRandomAlgorithm() {
    const regularAlgorithms = this.sortingAlgorithms.filter(alg => alg !== 'bogoSort');
    const randomIndex = Math.floor(Math.random() * regularAlgorithms.length);
    return regularAlgorithms[randomIndex];
  }

  getRandomBrightColor() {
    const min = 100;
    return [
      Math.floor(Math.random() * (256 - min)) + min,
      Math.floor(Math.random() * (256 - min)) + min,
      Math.floor(Math.random() * (256 - min)) + min,
    ];
  }

  generateColor(progress) {
    if (this.useRainbowGradient) {
      return this.hsvToRgb(progress * 360, 1, 1);
    }
    return [
      Math.floor(this.startColor[0] + progress * (this.endColor[0] - this.startColor[0])),
      Math.floor(this.startColor[1] + progress * (this.endColor[1] - this.startColor[1])),
      Math.floor(this.startColor[2] + progress * (this.endColor[2] - this.startColor[2])),
    ];
  }

  update() {
    if (this.currentAlgorithm && typeof this[this.currentAlgorithm + 'Step'] === 'function') {
      const sorted = this[this.currentAlgorithm + 'Step'](this.sortingState);
      this.drawLines();

      if (sorted) {
        if (this.debug) {
          this.currentAlgorithmIndex++;
          if (this.currentAlgorithmIndex < this.sortingAlgorithms.length) {
            this.currentAlgorithm = this.sortingAlgorithms[this.currentAlgorithmIndex];
            console.log(`Debug Mode: Testing ${this.currentAlgorithm}`);
            this.initLines();
          } else {
            console.log("All algorithms have been tested.");
            this.debug = false;
            this.currentAlgorithm = null;
          }
        } else {
          this.initLines();
        }
      }
    }
  }

  drawLines() {
    this.clear();
    this.lines.forEach((line, x) => {
      for (let y = this.height - 1; y >= this.height - line.height; y--) {
        this.display.setPixel(x, y, line.color);
      }
    });
    this.display.flush();
  }

  clear() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.display.setPixel(x, y, [0, 0, 0]);
      }
    }
    this.display.flush();
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  random() {
    return Math.random();
  }

  hsvToRgb(h, s, v) {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r, g, b;

    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    return [Math.floor((r + m) * 255), Math.floor((g + m) * 255), Math.floor((b + m) * 255)];
  }

  // --------------------- Sorting Step Methods ---------------------

  bubbleSortStep(state) {
    if (state.delay === undefined) {
      state.delay = 0;
    }
    if (state.delay > 0) {
      state.delay--;
      return false;
    }
    state.delay = 1;
    if (state.i === undefined) {
      state.i = 0;
      state.j = 0;
      state.swapped = false;
    }

    const n = this.lines.length;
    for (let k = 0; k < 25 && state.i < n; k++) {
      if (state.j < n - state.i - 1) {
        if (this.lines[state.j].height > this.lines[state.j + 1].height) {
          [this.lines[state.j], this.lines[state.j + 1]] = [this.lines[state.j + 1], this.lines[state.j]];
          state.swapped = true;
        }
        state.j++;
      } else {
        if (!state.swapped) return true;
        state.j = 0;
        state.i++;
        state.swapped = false;
      }
    }
    return state.i >= n;
  }

  selectionSortStep(state) {
    if (state.i === undefined) {
      state.i = 0;
      state.n = this.lines.length;
      state.minIndex = state.i;
      state.j = state.i + 1;
    }

    let steps = 0;
    while (state.i < state.n && steps < 25) {
      if (state.j < state.n) {
        if (this.lines[state.j].height < this.lines[state.minIndex].height) {
          state.minIndex = state.j;
        }
        state.j++;
      } else {
        [this.lines[state.i], this.lines[state.minIndex]] = [this.lines[state.minIndex], this.lines[state.i]];
        state.i++;
        state.minIndex = state.i;
        state.j = state.i + 1;
      }
      steps++;
    }
    return state.i >= state.n;
  }

  insertionSortStep(state) {
    if (state.i === undefined) {
      state.i = 1;
    }

    let steps = 0;
    while (state.i < this.lines.length && steps < 5) {
      const key = this.lines[state.i];
      let j = state.i - 1;
      while (j >= 0 && this.lines[j].height > key.height) {
        this.lines[j + 1] = this.lines[j];
        j--;
        steps++;
      }
      this.lines[j + 1] = key;
      state.i++;
    }
    return state.i >= this.lines.length;
  }

  quickSortStep(state) {
    if (!state.stack) {
      state.stack = [[0, this.lines.length - 1]];
    }

    let steps = 0;
    while (state.stack.length > 0 && steps < 2) {
      const [low, high] = state.stack.pop();
      if (low < high) {
        const p = this.partition(low, high);
        state.stack.push([low, p - 1], [p + 1, high]);
        steps++;
      }
    }
    return state.stack.length === 0;
  }

  partition(low, high) {
    const pivot = this.lines[high].height;
    let i = low - 1;
    for (let j = low; j < high; j++) {
      if (this.lines[j].height <= pivot) {
        i++;
        [this.lines[i], this.lines[j]] = [this.lines[j], this.lines[i]];
      }
    }
    [this.lines[i + 1], this.lines[high]] = [this.lines[high], this.lines[i + 1]];
    return i + 1;
  }

  mergeSortStep(state) {
    if (!state.size) {
      state.size = 1;
    }

    let n = this.lines.length;
    let steps = 0;
    while (state.size < n && steps < 1) {
      for (let leftStart = 0; leftStart < n; leftStart += 2 * state.size) {
        const mid = Math.min(leftStart + state.size - 1, n - 1);
        const rightEnd = Math.min(leftStart + 2 * state.size - 1, n - 1);
        this.merge(leftStart, mid, rightEnd);
      }
      state.size *= 2;
      steps++;
    }
    return state.size >= n;
  }

  merge(left, mid, right) {
    const leftArray = this.lines.slice(left, mid + 1);
    const rightArray = this.lines.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    while (i < leftArray.length && j < rightArray.length) {
      if (leftArray[i].height <= rightArray[j].height) {
        this.lines[k++] = leftArray[i++];
      } else {
        this.lines[k++] = rightArray[j++];
      }
    }

    while (i < leftArray.length) this.lines[k++] = leftArray[i++];
    while (j < rightArray.length) this.lines[k++] = rightArray[j++];
  }

  heapSortStep(state) {
    if (state.i === undefined) {
      state.n = this.lines.length;
      state.i = Math.floor(state.n / 2 - 1);
      state.j = state.n - 1;
      state.heapBuilt = false;
    }

    let steps = 0;
    if (!state.heapBuilt) {
      while (state.i >= 0 && steps < 5) {
        this.heapify(state.n, state.i);
        state.i--;
        steps++;
      }
      if (state.i < 0) state.heapBuilt = true;
    } else {
      if (state.j > 0 && steps < 5) {
        [this.lines[0], this.lines[state.j]] = [this.lines[state.j], this.lines[0]];
        this.heapify(state.j, 0);
        state.j--;
        steps++;
      }
      return state.j <= 0;
    }
    return false;
  }

  heapify(n, i) {
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;

    if (l < n && this.lines[l].height > this.lines[largest].height) largest = l;
    if (r < n && this.lines[r].height > this.lines[largest].height) largest = r;
    if (largest !== i) {
      [this.lines[i], this.lines[largest]] = [this.lines[largest], this.lines[i]];
      this.heapify(n, largest);
    }
  }

  radixSortStep(state) {
    if (state.digit === undefined) {
      state.digit = 1;
      state.max = Math.max(...this.lines.map(line => line.height));
    }

    let steps = 0;
    if (Math.floor(state.max / state.digit) > 0 && steps < 1) {
      this.countingSort(state.digit);
      state.digit *= 10;
      steps++;
      return false;
    }
    return true;
  }

  countingSort(exp) {
    const output = Array(this.lines.length).fill(null);
    const count = Array(10).fill(0);

    this.lines.forEach(line => {
      const index = Math.floor(line.height / exp) % 10;
      count[index]++;
    });

    for (let i = 1; i < 10; i++) count[i] += count[i - 1];

    for (let i = this.lines.length - 1; i >= 0; i--) {
      const index = Math.floor(this.lines[i].height / exp) % 10;
      output[count[index] - 1] = this.lines[i];
      count[index]--;
    }

    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i] = output[i];
    }
  }

  stdSortStep(state) {
    if (state.delay === undefined) {
      state.delay = 10;
    }
    if (state.delay > 0) {
      state.delay--;
      return false;
    }
    if (!state.sorted) {
      this.lines.sort((a, b) => a.height - b.height);
      state.sorted = true;
    }
    return state.sorted;
  }

  stableSortStep(state) {
    if (!state.sorted) {
      this.lines = this.stableSort(this.lines);
      state.sorted = true;
    }
    return state.sorted;
  }

  stableSort(array) {
    return array
      .map((item, index) => ({ ...item, index }))
      .sort((a, b) => a.height !== b.height ? a.height - b.height : a.index - b.index)
      .map(({ height, color }) => ({ height, color }));
  }

  shellSortStep(state) {
    if (state.gap === undefined) {
      state.n = this.lines.length;
      state.gap = Math.floor(state.n / 2);
    }

    let steps = 0;
    while (state.gap > 0 && steps < 1) {
      for (let i = state.gap; i < state.n; i++) {
        const temp = this.lines[i];
        let j = i;
        while (j >= state.gap && this.lines[j - state.gap].height > temp.height) {
          this.lines[j] = this.lines[j - state.gap];
          j -= state.gap;
          steps++;
        }
        this.lines[j] = temp;
      }
      state.gap = Math.floor(state.gap / 2);
    }

    return state.gap <= 0;
  }

  cocktailShakerSortStep(state) {
    if (state.start === undefined) {
      state.start = 0;
      state.end = this.lines.length - 1;
      state.swapped = true;
    }

    let steps = 0;
    while (state.swapped && steps < 2) {
      state.swapped = false;
      for (let i = state.start; i < state.end; i++) {
        if (this.lines[i].height > this.lines[i + 1].height) {
          [this.lines[i], this.lines[i + 1]] = [this.lines[i + 1], this.lines[i]];
          state.swapped = true;
        }
        steps++;
      }

      if (!state.swapped) break;

      state.swapped = false;
      state.end--;

      for (let i = state.end; i > state.start; i--) {
        if (this.lines[i].height < this.lines[i - 1].height) {
          [this.lines[i], this.lines[i - 1]] = [this.lines[i - 1], this.lines[i]];
          state.swapped = true;
        }
        steps++;
      }

      state.start++;
    }

    return !state.swapped;
  }

  gnomeSortStep(state) {
    if (state.index === undefined) {
      state.index = 0;
    }

    let steps = 0;
    while (state.index < this.lines.length && steps < 10) {
      if (state.index === 0 || this.lines[state.index].height >= this.lines[state.index - 1].height) {
        state.index++;
      } else {
        [this.lines[state.index], this.lines[state.index - 1]] = [this.lines[state.index - 1], this.lines[state.index]];
        state.index--;
      }
      steps++;
    }

    return state.index >= this.lines.length;
  }

  bitonicSortStep(state) {
    if (state.delay === undefined) {
      state.delay = 10;
    }
    if (state.delay > 0) {
      state.delay--;
      return false;
    }
    if (!state.sorted) {
      this.lines.sort((a, b) => a.height - b.height);
      state.sorted = true;
    }
    return state.sorted;
  }

  bogoSortStep(state) {
    if (this.isSorted()) {
      return true;
    } else {
      this.shuffleArray(this.lines);
      return false;
    }
  }

  isSorted() {
    for (let i = 0; i < this.lines.length - 1; i++) {
      if (this.lines[i].height > this.lines[i + 1].height) return false;
    }
    return true;
  }
}