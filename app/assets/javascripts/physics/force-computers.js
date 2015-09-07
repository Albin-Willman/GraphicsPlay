function DragForce(center, strength){
  this.center   = center;
  this.strength = strength;
  this.compute  = function(p){
    if(!center)
      return new Vector(0, 0);
    var difference = this.center.difference(p.position);
    var mag = difference.magnitude();
    if (mag > 0.000001) {
      return difference.scale(p.mass*this.strength/(mag*mag));
    } else {
      return difference.scale(1000000);
    }
  }
}
function GravityForce(direction, strength){
  this.acceleration = direction.scale(strength*direction.magnitude());
  this.compute = function(p) {
    return this.acceleration.scale(p.mass);
  }
}

function PushForce(direction, strength){
  this.force = direction.scale(strength*direction.magnitude());
  this.compute = function(_) {
    return this.force;
  }
}

function FrictionForce(strength) {
  this.strength = strength;
  this.compute = function(p){
    return p.velocity.scale(-1 * this.strength);
  }
}