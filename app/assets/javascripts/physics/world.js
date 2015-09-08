function World(sizeX, sizeY, canvasId){
  this.sizeX = sizeX;
  this.sizeY = sizeY;
  
  this.canvas = document.getElementById(canvasId);
  this.canvas.setAttribute('width', sizeX);
  this.canvas.setAttribute('height', sizeY);

  this.clear = function(){
    $(this.canvas).empty();
  }
  this.bounce = function(p) {
    if (p.x() - p.mass < 0) {
      p.position.x = 2*p.mass - p.x();
      p.velocity.x = -1*p.elasticity*p.velocity.x;
    } else if(p.x() + p.mass > this.sizeX) {
      p.velocity.x = -1*p.elasticity*p.velocity.x;
      p.position.x = 2*this.sizeX - p.x() - 2*p.mass;
    }
    if (p.y() - p.mass < 0) {
      p.position.y = 2*p.mass - p.y();
      p.velocity.y = -1*p.elasticity*p.velocity.y;
    } else if(p.y() + p.mass > this.sizeY) {
      p.velocity.y = -1*p.elasticity*p.velocity.y;
      p.position.y = 2*this.sizeY - p.y() - 2*p.mass;
    }
  }
  this.fallThrough = function(p) {
    if (p.x() < 0) {
      p.position.x = this.sizeX - p.x();
    } else if(p.x() > this.sizeX) {
      p.position.x = p.x() - this.sizeX;
    }
    if (p.y() < 0) {
      p.position.y = this.sizeY - p.y();
    } else if(p.y() > this.sizeY) {
      p.position.y = p.y() - this.sizeY;
    }
  }
  this.checkLimits = this.fallThrough;
}