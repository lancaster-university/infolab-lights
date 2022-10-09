class Node {
  constructor(x, y, parent, target){
    this.x = x;
    this.y = y;
    this.parent = parent;
    this.h = Math.sqrt((x - target.x) ** 2 + (y - target.y) ** 2);
    this.open = true;
  }
  getF(){
    let g = this.getG();
    return this.h + g;
  }
  getG(){
    let parent_g = 0;
    if(this.parent != null){
      return this.parent.getG() + Math.sqrt(((this.x - this.parent.x) ** 2) + ((this.y - this.parent.y) ** 2));
    }
    return 0
  }
}

class LittleLad {
  constructor(x, y){
    this.x = x;
    this.y = y;
  }
}

class Room {
  constructor(display) {
    this.top_x = Math.floor(Math.random() * (display.width - 11));
    this.top_y = Math.floor(Math.random() * (display.height - 11));
    this.width = Math.floor((Math.random() / 2 + 0.5) * Math.min((display.width - this.top_x), 20));
    this.height = Math.floor((Math.random() / 2 + 0.5) * Math.min((display.height - this.top_y), 20));
  }
  
}
return class MyEffect {
  constructor(display) {
    this.display = display;
    this.#resetEverything();
    this.#clear();
  }

  #resetEverything(){
    this.#initiateWorld();
    this.#initiateLads();
    this.#initiateNodes();
    this.reset_everything = false;
  }

  #initiateNodes(){
    this.open_nodes = [];
    this.closed_nodes = [];
    this.#createNode(null, [this.lad.x, this.lad.y]);
    this.pathFinding = true;
    this.path = [];
    this.current_best_node = this.world[this.lad.x][this.lad.y];
    this.heighest_f = 1;
  }

  #initiateLads(){
    while(true){
      this.lad = this.#initiateLad();
      this.prey = this.#initiateLad();
      let distance_sqrd = ((this.lad.x - this.prey.x) ** 2) + ((this.lad.y - this.prey.y) ** 2)
      if(distance_sqrd > 6400){
        break
      }
    }
  }

  #initiateLad(){
    let x;
    let y;
    while(true){
      x = Math.floor(Math.random() * (this.display.width - 1));
      y = Math.floor(Math.random() * (this.display.height - 1));
      if(this.world[x][y] == null){
        break;
      }
    }
    return new LittleLad(x, y)
  }

  #closeNode(node){
    node.open = false;
    this.open_nodes.splice(this.open_nodes.indexOf(node), 1);
    this.closed_nodes.push(node);
  }

  #createNode(parent, pos){
    let new_node = new Node(pos[0], pos[1], parent, this.prey);
    this.open_nodes.push(new_node);
    this.world[pos[0]][pos[1]] = new_node;
    if(new_node.getF() > this.heighest_f){
      this.heighest_f = new_node.getF();
    }
  }

  #initiateWorld(){
    this.world = new Array();
    for (var i = 0; i < this.display.width; i++) {
      this.world.push(new Array(this.display.height));
    }
    
    this.rooms = new Array();
    for(let i = 0; i < 65; i++){
      this.rooms.push(new Room(this.display));
    }
    
    for(const room of this.rooms){
      this.#placeRoom(room);
    }
  }

  #clear() {
    for (let x = 0; x < this.display.width; x++) {
      for (let y = 0; y < this.display.height; y++) {
        this.display.setPixel(x, y, [0, 0, 0]);
      }
    }
  }

  update() {
    if(this.reset_everything){
      this.#resetEverything();
    }
    for(let i = 0; i < 10; i++){
      if (this.pathFinding){
        this.#tickPathFinding();
      }
      else{
        break;
      }
    }
    if (this.pathFinding == false){
      
      for(let i = 0; i < 3; i++){
        if(this.path.length > 0){
          let next_step = this.path.pop();
          this.lad.x = next_step.x;
          this.lad.y = next_step.y;
        }
        else{
          this.reset_everything = true;
          break;
        }
      }
    }
    this.#draw();
    this.#clear();
  }

  #tickPathFinding() {
    this.#findNextNode();
    if(this.current_best_node.x == this.prey.x && this.current_best_node.y == this.prey.y){
      this.pathFinding = false;
      this.#generatePath();
    }
    this.#closeNode(this.current_best_node);
    for (const child_pos of this.#getChildrenPosSquare(this.current_best_node)){
      this.#considerChild(child_pos);
    }
    if(this.open_nodes.length == 0){
      this.pathFinding = false;
      this.#getClosestNode();
    }
    this.#generatePath();
  }

  #considerChild(child_pos){
      if(child_pos[0] >= this.display.width || child_pos[1] >= this.display.height){
        return;
      }
      if(child_pos[0] < 0 || child_pos[1] < 0){
        return;
      }
      let node_at_pos = this.world[child_pos[0]][child_pos[1]];
      if(node_at_pos == true){
        return;
      }
      if(node_at_pos == null){
        this.#createNode(this.current_best_node, child_pos);
        return;
      }
      let test_node = new Node(child_pos[0], child_pos[1], this.current_best_node, this.prey)
      if(node_at_pos.getG() > test_node.getG()){
        node_at_pos.parent = this.current_best_node;
      }
  }

  #generatePath(){
    this.path = []
    let node = this.current_best_node;
    while(true){
      this.path.push(node)
      node = node.parent;
      if(node == null){
        break;
      }
    }
  }

  #getClosestNode(){
    let best_node = this.closed_nodes[0]
    for(const node of this.closed_nodes){
      if (best_node.h > node.h){
        best_node = node;
      }
    }
    this.current_best_node = best_node;
  }

  #getChildrenPosSquare(node) {
    return [[node.x+1, node.y+1],
            [node.x+1, node.y],
            [node.x+1, node.y-1],
            [node.x, node.y+1],
            [node.x, node.y-1],
            [node.x-1, node.y+1],
            [node.x-1, node.y],
            [node.x-1, node.y-1],]
  }

  #findNextNode(){
    let best_node = this.open_nodes[0]
    for(const node of this.open_nodes){
      if(node.getF() < best_node.getF()){
        best_node = node
      }
    }
    this.current_best_node = best_node;
  }

  #draw() {
    this.#drawWorld();
    this.#drawBestPath();
    this.#drawDotAt(this.prey, [0, 255, 0])
    this.#drawDotAt(this.lad, [60, 60, 60])
    this.display.flush();
  }

  #drawDotAt(point, colour){
    let directions = [
      [1, 1],
      [1, 0],
      [1, -1],
      [0, 1],
      [0, -1],
      [-1, 1],
      [-1, 0],
      [-1, -1]
    ]
    for(const dir of directions){
      let pos = [dir[0] + point.x, dir[1] + point.y]
      if(pos[0] >= this.display.width || pos[1] >= this.display.height){
          continue;
      }
      if(pos[0] < 0 || pos[1] < 0){
        continue;
      }
      this.display.setPixel(pos[0], pos[1], colour)
    }
  }

  #drawBestPath(){
    for (const node of this.path) {
      this.display.setPixel(node.x, node.y, [40, 40, 40])
    }
    this.display.setPixel(this.current_best_node.x, this.current_best_node.y, [255, 255, 255])
  }
  
  #drawWorld() {
    for (let x = 0; x < this.display.width; x++) {
      for (let y = 0; y < this.display.height; y++) {
        let position = this.world[x][y]
        if(position == null){
          continue;
        }
        if(position == true){
          this.display.setPixel(x, y, [200, 200, 200]);
        }
        else{
          this.display.setPixel(x, y, this.#getGradient(position.getF()))
        }
      }
    }
  }

  #getGradient(f){
    let x = (f / this.heighest_f) ** 17;
    let b = Math.max((-2295 * ((x - (1/3)) ** 2)) + 255, 0);
    let g = Math.max((-2295 * ((x - (2/3)) ** 2)) + 255, 0);
    let r = Math.max((-2295 * ((x) ** 2)) + 255, 0);
    return [r, g, b];
  }

  #placeRoom(room) {
      let top_x = room.top_x;
      let top_y = room.top_y;
      let bottom_x = room.top_x + room.width - 1;
      let bottom_y = room.top_y + room.height - 1;
      this.#placeLine(top_y, bottom_y, false, top_x, true);
      this.#placeLine(top_x, bottom_x, true, top_y, true);
      this.#placeLine(top_y, bottom_y, false, bottom_x, true);
      this.#placeLine(top_x, bottom_x, true, bottom_y, true);
      for(let i = top_x + 1; i < bottom_x; i++){
        this.#placeLine(top_y + 1, bottom_y - 1, false, i, false);
      }
  }

  #placeLine(a, b, horizontal, axis_pos, wall) {
    let place;
    if(wall){
      place = true;
    }
    else{
      place = null;
    }
    let door = a + 1 + Math.floor(Math.random() * (b - a - 2));
    for(let i = a; i <= b; i++){
      if(i != door || wall == false){
        if(horizontal){
          this.world[i][axis_pos] = place;
        }
        else{
          this.world[axis_pos][i] = place;
        }
      }
    }
  }
}
