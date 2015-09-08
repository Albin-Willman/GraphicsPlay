function World(sizeX, sizeY, canvasId){
  this.sizeX = sizeX;
  this.sizeY = sizeY;
  
  this.canvas = document.getElementById(canvasId);
  this.canvas.setAttribute('width', sizeX);
  this.canvas.setAttribute('height', sizeY);

  this.clear = function(){
    $(this.canvas).empty();
  }
  // this.limits = new RoundLimits(this);
  this.limits = new HardLimits(this);
  // this.limits = new NoLimits(this);
  this.checkLimits = function(p){
    this.limits.check(p)
  }
}
