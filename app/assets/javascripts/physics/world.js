function World(sizeX, sizeY, canvasId){
  this.sizeX = sizeX;
  this.sizeY = sizeY;

  this.canvas = document.getElementById(canvasId);
  if (!this.canvas) {
    this.initated = false;
    return false;
  }
  this.canvas.setAttribute('width', sizeX);
  this.canvas.setAttribute('height', sizeY);
  this.particles = [];

  this.addParticle = function(p){
    this.particles.push(p);
  }
  this.clear = function(){
    $(this.canvas).empty();
  }
  // this.limits = new RoundLimits(this);
  this.limits = new HardLimits(this);
  // this.limits = new NoLimits(this);
  this.checkLimits = function(p){
    this.limits.check(p)
  }
  this.update = function(){
    this.clear();
    for (i in this.particles) {
      this.particles[i].update().draw();
    }
  }
  this.initated = true;
}
