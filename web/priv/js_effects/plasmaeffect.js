return class MyEffect {
  constructor(display) {
    this.display = display;
    this.#clear();
    
    // Time and animation parameters
    this.time = 0;
    this.speed = 0.03;
    
    // Display dimensions
    this.width = display.width;
    this.height = display.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.maxDistance = Math.sqrt(this.centerX * this.centerX + this.centerY * this.centerY);
    
    // Color parameters
    this.colorCycle = 20;
    this.colorShift = 2.0;
    
    // Pattern parameters
    this.waveScale = 15;
    this.waveSpeed = 2;
    
    // No particles in this version
  }
  
  #clear() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.display.setPixel(x, y, [0, 0, 0]);
      }
    }
    this.display.flush();
  }
  
  // Particle system removed
  
  update() {
    // Update time
    this.time += this.speed;
    
    // No particle updates needed
    
    // Pre-calculate time-based values
    const timeVal1 = this.time;
    const timeVal2 = this.time * 0.8;
    const timeVal3 = this.time * this.waveSpeed;
    const timeVal4 = this.time * 0.5;
    const colorTimeBase = this.time / this.colorCycle;
    
    // Render each pixel
    for (let x = 0; x < this.width; x++) {
      // Pre-calculate x-dependent values
      const xWave = Math.sin(x / this.waveScale + timeVal1) * 0.5;
      
      for (let y = 0; y < this.height; y++) {
        // Calculate relative position from center
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Calculate vignette effect (darker at edges)
        const vignette = 1 - (distance / this.maxDistance) * 0.3;
        
        // Base pattern value - flowing plasma effect
        const yWave = Math.sin(y / this.waveScale + timeVal2) * 0.5;
        const distanceWave = Math.sin(distance / this.waveScale - timeVal3) * 0.5;
        const angleWave = Math.sin(angle * 5 + timeVal4) * 0.5;
        
        let value = xWave + yWave + distanceWave + angleWave;
        
        // Add fractal-like detail
        value += Math.sin((x * y) / (this.waveScale * 10) + timeVal1) * 0.2;
        
        // Particle influence removed
        
        // Add oscillating ring effect
        const ringEffect = Math.sin(distance / 10 - this.time * 1.5) * 0.2 * 
                           Math.exp(-Math.abs(distance - 50 * (1 + Math.sin(this.time * 0.2))) / 20);
        value += ringEffect;
        
        // Normalize value to 0-1 range
        value = (value + 2.5) / 5;
        
        // Calculate color with shifting phase
        const r = Math.sin(value * Math.PI * 2 + colorTimeBase) * 0.5 + 0.5;
        const g = Math.sin(value * Math.PI * 2 + colorTimeBase + this.colorShift) * 0.5 + 0.5;
        const b = Math.sin(value * Math.PI * 2 + colorTimeBase + this.colorShift * 2) * 0.5 + 0.5;
        
        // Apply color power for more vibrant colors and vignette effect
        const color = [
          Math.floor(r * r * 255 * vignette),
          Math.floor(g * g * 255 * vignette),
          Math.floor(b * b * 255 * vignette)
        ];
        
        // Set pixel
        this.display.setPixel(x, y, color);
      }
    }
    
    // Particle cores removed
    
    // Flush the display
    this.display.flush();
  }
}
