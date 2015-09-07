function World(sizeX, sizeY, canvasId){
  this.sizeX = sizeX;
  this.sizeY = sizeY;
  this.friction = 0.01;
  this.canvas = document.getElementById(canvasId);
  this.canvas.setAttribute('width', sizeX);
  this.canvas.setAttribute('height', sizeY);
  this.g = new Vector(0, 0.1);
  this.drawParticle = function(particle){
    particle.to_svg();
  }
  this.clear = function(){
    $(this.canvas).empty();
  }
  this.checkLimits = function(p) {
    this.bounce(p);
  }
  this.bounce = function(p) {
    if (p.x() < 0) {
      p.position.x = -1*p.x();
      p.velocity.x = -1*p.velocity.x;
    } else if(p.x() > this.sizeX) {
      p.velocity.x = -1*p.velocity.x;
      p.position.x = 2*this.sizeX -1*p.x();
    }
    if (p.y() < 0) {
      p.position.y = -1*p.y();
      p.velocity.y = -1*p.velocity.y;
    } else if(p.y() > this.sizeY) {
      p.velocity.y = -1*p.velocity.y;
      p.position.y = 2*this.sizeY -1*p.y();
    }
  }
}