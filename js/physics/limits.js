function RoundLimits(world){
  this.world = world;
  this.check = function(p){
    if (p.x() < 0) {
      p.position.x = this.world.sizeX + p.x();
    } else if(p.x() > this.world.sizeX) {
      p.position.x = p.x() - this.world.sizeX;
    }
    if (p.y() < 0) {
      p.position.y = this.world.sizeY + p.y();
    } else if(p.y() > this.world.sizeY) {
      p.position.y = p.y() - this.world.sizeY;
    }
  }
}

// A wall on one axis. The particle is kept inside; if it's moving outwards it bounces,
// unless it's slower than its resting speed, in which case it stops against the wall
// (so a ball can sit on the floor). Particles within half a pixel count as touching,
// so collision passes can also stop a pile from pressing into the floor.
// Walls only ever send a particle inwards, so one pushed outside while already
// heading back in (e.g. by a collision) isn't bounced the wrong way.
function wall(p, axis, size){
  var low = p.mass, high = size - p.mass, slop = 0.5;
  var outwardSpeed;
  if (p.position[axis] <= low + slop) {
    p.position[axis] = Math.max(p.position[axis], low);
    outwardSpeed = -p.velocity[axis];
  } else if (p.position[axis] >= high - slop) {
    p.position[axis] = Math.min(p.position[axis], high);
    outwardSpeed = p.velocity[axis];
  } else {
    return;
  }
  if (outwardSpeed <= 0) { return; }
  p.velocity[axis] = outwardSpeed > p.restingSpeed ? -p.elasticity * p.velocity[axis] : 0;
}

function HardLimits(world){
  this.world = world;
  this.check = function(p){
    wall(p, 'x', this.world.sizeX);
    wall(p, 'y', this.world.sizeY);
  }
}

function TunnelLimits(world){
  this.world = world;
  this.check = function(p){
    wall(p, 'x', this.world.sizeX);
    if (p.y() < 0) {
      p.position.y = this.world.sizeY + p.y();
    } else if(p.y() > this.world.sizeY) {
      p.position.y = p.y() - this.world.sizeY;
    }
  }
}

function NoLimits(_){ this.check = function(p){}; }