function World(sizeX, sizeY, canvasId){
  this.sizeX = sizeX;
  this.sizeY = sizeY;

  this.canvas = document.getElementById(canvasId);
  if (!this.canvas) {
    this.initiated = false;
    return false;
  }
  this.canvas.setAttribute('width', sizeX);
  this.canvas.setAttribute('height', sizeY);
  this.particles = [];
  this.limits = new NoLimits(this);
  this.collisions = null; // null when off, otherwise { restitution: 0..1 }

  this.addParticle = function(p){
    this.particles.push(p);
  }
  this.clear = function(){
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].remove();
    }
    this.particles = [];
  }
  // Positions scale with the world, so particles keep their layout and stay inside.
  this.resize = function(sizeX, sizeY){
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].position.x *= sizeX / this.sizeX;
      this.particles[i].position.y *= sizeY / this.sizeY;
    }
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.canvas.setAttribute('width', sizeX);
    this.canvas.setAttribute('height', sizeY);
    this.draw();
  }
  this.checkLimits = function(p){
    this.limits.check(p);
  }
  // Move everything, then separate overlapping particles, then apply the edges,
  // so a collision can't leave a particle outside the walls.
  this.update = function(){
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].update();
    }
    if (this.collisions) {
      resolveCollisions(this.particles, this.collisions.restitution);
    }
    for (var i = 0; i < this.particles.length; i++) {
      this.checkLimits(this.particles[i]);
    }
  }
  this.draw = function(){
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].draw();
    }
  }
  this.initiated = true;
}
