function World(sizeX, sizeY, canvasId){
  this.sizeX = sizeX;
  this.sizeY = sizeY;
  
  this.canvas = document.getElementById(canvasId);
  this.canvas.setAttribute('width', sizeX);
  this.canvas.setAttribute('height', sizeY);

  this.g = new Vector(0, 0);
  this.friction = 0.0;

  this.clear = function(){
    $(this.canvas).empty();
  }
  this.checkLimits = function(p) {
    this.bounce(p);
  }
  this.gravityForce = function(p) {
    return this.g.scale(p.mass);
  }
  this.mouseDragForce = function(mousePosition, p) {
    var difference = mousePosition.difference(p.position);
    var mag = difference.magnitude();
    if (mag > 0.000001) {
      return difference.scale(1/(mag));
    } else {
      return difference.scale(1000000);
    }
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
}