function DragForce(center, world, strength){
  this.center   = center;
  this.strength = strength;
  this.world    = world;
  this.compute  = function(p){
    var center = this.center(this.world);
    if(!center)
      return new Vector(0, 0);
    var difference = center.difference(p.position);
    var mag = difference.magnitude();
    if (mag > 0.000001) {
      return difference.scale(p.mass*this.strength/(mag*mag));
    } else {
      return difference.scale(1000000);
    }
  }
}
function GravityForce(direction, world, strength){
  this.direction = direction;
  this.strength  = strength;
  this.world     = world;
  this.compute = function(p) {
    var direction = this.direction(this.world);
    if (direction.x == 0 && direction.y == 0)
      return direction;
    return direction.scale(p.mass*this.strength/direction.magnitude());
  }
}

function PushForce(direction, world, strength){
  this.direction = direction;
  this.strength  = strength;
  this.world     = world;
  this.compute = function(_) {
    var direction = this.direction(this.world);
    if (direction.x == 0 && direction.y == 0)
      return direction;
    return direction.scale(this.strength/direction.magnitude());
  }
}

function NoiseForce(strength){
  this.strength = strength;
  this.compute = function(_){
    var direction = new Vector(Math.random() - 0.5, Math.random() - 0.5);
    return direction.scale(this.strength);
  }
}
function FrictionForce(strength){
  this.strength = strength;
  this.compute = function(p){
    return p.velocity.scale(-1 * this.strength);
  }
}