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

// Keeps a particle inside a wall whose outward normal is (nx, ny). `gap` is the space
// between the particle's edge and the wall, negative when it's poking through.
// Moving outwards it bounces, unless it's slower than its resting speed, in which case
// it stops against the wall (so a ball can sit on the floor). Within half a pixel
// counts as touching, so collision passes can also stop a pile pressing into the wall.
// Walls only ever send a particle inwards, so one pushed outside while already
// heading back in (e.g. by a collision) isn't bounced the wrong way.
var WALL_SLOP = 0.5;
function wallContact(p, nx, ny, gap){
  if (gap > WALL_SLOP) { return; }
  if (gap < 0) {
    p.position.x += nx * gap;
    p.position.y += ny * gap;
  }
  var outwardSpeed = p.velocity.x * nx + p.velocity.y * ny;
  if (outwardSpeed <= 0) { return; }
  var keep = outwardSpeed > p.restingSpeed ? p.elasticity : 0;
  p.velocity.x -= (1 + keep) * outwardSpeed * nx;
  p.velocity.y -= (1 + keep) * outwardSpeed * ny;
}

function HardLimits(world){
  this.world = world;
  // Runs many times per step with collisions on, so it only calls wallContact near a wall.
  this.check = function(p){
    var left = p.position.x - p.mass, right = this.world.sizeX - p.position.x - p.mass;
    var top = p.position.y - p.mass, bottom = this.world.sizeY - p.position.y - p.mass;
    if (left <= WALL_SLOP)   { wallContact(p, -1, 0, left); }
    if (right <= WALL_SLOP)  { wallContact(p, 1, 0, right); }
    if (top <= WALL_SLOP)    { wallContact(p, 0, -1, top); }
    if (bottom <= WALL_SLOP) { wallContact(p, 0, 1, bottom); }
  }
}

// Walls along the boundary of the world's shape (see shapes.js).
function ShapeLimits(world){
  this.world = world;
  this.check = function(p){
    var nearest = this.world.shape.nearest(p.x(), p.y(), p.mass + WALL_SLOP);
    if (nearest) {
      wallContact(p, nearest.nx, nearest.ny, nearest.depth - p.mass);
    }
  }
}

function TunnelLimits(world){
  this.world = world;
  this.check = function(p){
    wallContact(p, -1, 0, p.x() - p.mass);
    wallContact(p, 1, 0, this.world.sizeX - p.x() - p.mass);
    if (p.y() < 0) {
      p.position.y = this.world.sizeY + p.y();
    } else if(p.y() > this.world.sizeY) {
      p.position.y = p.y() - this.world.sizeY;
    }
  }
}

function NoLimits(_){ this.check = function(p){}; }