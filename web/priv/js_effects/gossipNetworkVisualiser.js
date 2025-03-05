return class GossipNetwork {

  /**
   * @param {object} display  The display object (with setPixel, flush, width, height).
   * @param {object} options  Configuration options:
   *    - numNodes           (default 100)
   *    - nodeSize           (default 1x1)
   *    - minConnections     (default 2)
   *    - maxConnections     (default 6)
   *    - packetSpeed        (default 0.03)
   *    - connectionStrategy (default "random")   // can be "random" or "closest"
   *    - maxDistance        (default Infinity)   // used if connectionStrategy = "closest"
   */
  constructor(display, options = {}) {
    this.display = display;

    // Basic config
    this.numNodes = options.numNodes ?? 200;
    this.nodeSize = options.nodeSize ?? 1;
    this.minConnections = options.minConnections ?? 2;
    this.maxConnections = options.maxConnections ?? 6;
    this.packetSpeed = options.packetSpeed ?? 0.03;
    this.connectionStrategy = options.connectionStrategy ?? "closest";
    this.maxDistance = (options.maxDistance === 100) ? Infinity : options.maxDistance;

    this.nodes = [];
    this.packets = [];

    this.#initNodes();
    this.#initLinks();

    // Start gossip at node 0
    if (this.nodes.length > 0) {
      this.nodes[0].received = true;
      this.nodes[0].color = [0, 255, 0]; // green
      // Create initial packets from node 0 to its neighbors
      this.nodes[0].neighbors.forEach((neighborIdx) => {
        this.packets.push({
          from: 0,
          to: neighborIdx,
          fraction: 0,
          speed: this.packetSpeed,
        });
      });
    }

    // Render the initial state
    this.#draw();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  Initialization
  // ─────────────────────────────────────────────────────────────────────────────

  #initNodes() {
    // For nodeSize > 1, you may want to subtract nodeSize instead of 2
    const maxX = this.display.width - 2;
    const maxY = this.display.height - 2;

    for (let i = 0; i < this.numNodes; i++) {
      const x = Math.floor(Math.random() * maxX);
      const y = Math.floor(Math.random() * maxY);
      this.nodes.push({
        x,
        y,
        received: false,
        color: [255, 0, 0], // red
        neighbors: [],
      });
    }
  }

  #initLinks() {
    if (this.connectionStrategy === "closest") {
      this.#initClosestLinks();
    } else {
      this.#initRandomLinks();
    }
  }


  #initRandomLinks() {
    const n = this.nodes.length;

    for (let i = 0; i < n; i++) {
      const deg = this.minConnections + Math.floor(
        Math.random() * (this.maxConnections - this.minConnections + 1)
      );

      while (this.nodes[i].neighbors.length < deg) {
        const candidate = Math.floor(Math.random() * n);

        // Avoid self-loops and duplicates
        if (candidate !== i && !this.nodes[i].neighbors.includes(candidate)) {
          this.nodes[i].neighbors.push(candidate);
          this.nodes[candidate].neighbors.push(i);
        }

        if (this.nodes[i].neighbors.length >= n - 1) {
          break;
        }
      }
    }
  }


  #initClosestLinks() {
    const n = this.nodes.length;

    for (let i = 0; i < n; i++) {
      // Pick a degree in [minConnections->maxConnections]
      const deg = this.minConnections + Math.floor(
        Math.random() * (this.maxConnections - this.minConnections + 1)
      );

      // gather distances
      const distances = [];
      for (let j = 0; j < n; j++) {
        if (j !== i) {
          const dx = this.nodes[i].x - this.nodes[j].x;
          const dy = this.nodes[i].y - this.nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          distances.push({ index: j, dist });
        }
      }

      // sort ascending by distance
      distances.sort((a, b) => a.dist - b.dist);

      // pick those within maxDistance
      let withinThreshold = distances.filter(d => d.dist <= this.maxDistance);

      // if we can't meet minConnections, revert to the entire sorted array
      if (withinThreshold.length < this.minConnections) {
        withinThreshold = distances;
      }

      // pick up to deg from withinThreshold
      const selected = withinThreshold.slice(0, deg);

      // link them
      for (const obj of selected) {
        const neighborIdx = obj.index;
        if (!this.nodes[i].neighbors.includes(neighborIdx)) {
          this.nodes[i].neighbors.push(neighborIdx);
        }
        if (!this.nodes[neighborIdx].neighbors.includes(i)) {
          this.nodes[neighborIdx].neighbors.push(i);
        }
      }
    }
  }


  update() {
    // Package each packet
    const arrivedPackets = [];
    for (const packet of this.packets) {
      packet.fraction += packet.speed;
      if (packet.fraction >= 1) {
        arrivedPackets.push(packet);
      }
    }

    // Process arrivals
    for (const packet of arrivedPackets) {
      // Remove from active list
      const idx = this.packets.indexOf(packet);
      if (idx !== -1) {
        this.packets.splice(idx, 1);
      }

      // Infect the destination node if needed
      const destinationNode = this.nodes[packet.to];
      if (!destinationNode.received) {
        destinationNode.received = true;
        destinationNode.color = [0, 255, 0]; // green

        // Spread to neighbors, skipping the one we came from
        destinationNode.neighbors.forEach((neighborIdx) => {
          // Skip the node that just infected me
          if (neighborIdx === packet.from) return;

          // Also skip if neighbor is already infected
          if (this.nodes[neighborIdx].received) return;

          // Create new packet
          this.packets.push({
            from: packet.to,
            to: neighborIdx,
            fraction: 0,
            speed: this.packetSpeed,
          });
        });
      }
    }

    // Redraw after updating
    this.#draw();
  }

  #draw() {
    this.#clear();

    // Draw adjacency lines
    /*
    this.nodes.forEach((nodeA, i) => {
      nodeA.neighbors.forEach((j) => {
        if (j > i) {
          const nodeB = this.nodes[j];
          // draw from center of each node if nodeSize > 1
          const ax = nodeA.x + Math.floor(this.nodeSize / 2);
          const ay = nodeA.y + Math.floor(this.nodeSize / 2);
          const bx = nodeB.x + Math.floor(this.nodeSize / 2);
          const by = nodeB.y + Math.floor(this.nodeSize / 2);

          this.#drawLine(ax, ay, bx, by, [255, 255, 255]);
        }
      });
    });
    */

    // Draw nodes
    for (const node of this.nodes) {
      for (let dx = 0; dx < this.nodeSize; dx++) {
        for (let dy = 0; dy < this.nodeSize; dy++) {
          this.display.setPixel(node.x + dx, node.y + dy, node.color);
        }
      }
    }

    // Draw traveling packets (yellow)
    for (const packet of this.packets) {
      const nodeA = this.nodes[packet.from];
      const nodeB = this.nodes[packet.to];

      // If nodeSize > 1, we draw from center
      const ax = nodeA.x + Math.floor(this.nodeSize / 2);
      const ay = nodeA.y + Math.floor(this.nodeSize / 2);
      const bx = nodeB.x + Math.floor(this.nodeSize / 2);
      const by = nodeB.y + Math.floor(this.nodeSize / 2);

      // Interpolate
      const x = ax + packet.fraction * (bx - ax);
      const y = ay + packet.fraction * (by - ay);
      const px = Math.floor(x);
      const py = Math.floor(y);

      // packet color = yellow
      this.display.setPixel(px, py, [255, 255, 0]);
    }

    this.display.flush();
  }

  #clear() {
    for (let x = 0; x < this.display.width; x++) {
      for (let y = 0; y < this.display.height; y++) {
        this.display.setPixel(x, y, [0, 0, 0]);
      }
    }
  }

  /**
   * Bresenham line if want to draw adjacency links between node.
   */
  #drawLine(x1, y1, x2, y2, color) {
    let dx = Math.abs(x2 - x1);
    let sx = x1 < x2 ? 1 : -1;
    let dy = -Math.abs(y2 - y1);
    let sy = y1 < y2 ? 1 : -1;
    let err = dx + dy;

    while (true) {
      this.display.setPixel(x1, y1, color);
      if (x1 === x2 && y1 === y2) break;

      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x1 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y1 += sy;
      }
    }
  }
}

