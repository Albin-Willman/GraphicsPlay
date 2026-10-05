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

  this.addParticle = function(p){
    this.particles.push(p);
  }
  this.clear = function(){
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].remove();
    }
    this.particles = [];
  }
  this.checkLimits = function(p){
    this.limits.check(p);
  }
  this.update = function(){
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].update();
    }
  }
  this.draw = function(){
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].draw();
    }
  }
  this.initiated = true;
}
