function RoundLimits(world){
  this.world = world;
  this.check = function(p){
    if (p.x() < 0) {
      p.position.x = this.world.sizeX - p.x();
    } else if(p.x() > this.world.sizeX) {
      p.position.x = p.x() - this.world.sizeX;
    }
    if (p.y() < 0) {
      p.position.y = this.world.sizeY - p.y();
    } else if(p.y() > this.world.sizeY) {
      p.position.y = p.y() - this.world.sizeY;
    }
  }
}

function HardLimits(world){
  this.world = world;
  this.check = function(p){
    if (p.x() - p.mass < 0) {
      p.position.x = 2*p.mass - p.x();
      p.velocity.x = -1*p.elasticity*p.velocity.x;
    } else if(p.x() + p.mass > this.world.sizeX) {
      p.velocity.x = -1*p.elasticity*p.velocity.x;
      p.position.x = 2*this.world.sizeX - p.x() - 2*p.mass;
    }
    if (p.y() - p.mass < 0) {
      p.position.y = 2*p.mass - p.y();
      p.velocity.y = -1*p.elasticity*p.velocity.y;
    } else if(p.y() + p.mass > this.world.sizeY) {
      p.velocity.y = -1*p.elasticity*p.velocity.y;
      p.position.y = 2*this.world.sizeY - p.y() - 2*p.mass;
    }
  }
}

function TunnelLimits(world){
  this.world = world;
  this.check = function(p){
    if (p.x() - p.mass < 0) {
      p.position.x = 2*p.mass - p.x();
      p.velocity.x = -1*p.elasticity*p.velocity.x;
    } else if(p.x() + p.mass > this.world.sizeX) {
      p.velocity.x = -1*p.elasticity*p.velocity.x;
      p.position.x = 2*this.world.sizeX - p.x() - 2*p.mass;
    }
    if (p.y() < 0) {
      p.position.y = this.world.sizeY - p.y();
    } else if(p.y() > this.world.sizeY) {
      p.position.y = p.y() - this.world.sizeY;
    }
  }
}



function NoLimits(_){ this.check = function(p){}; }