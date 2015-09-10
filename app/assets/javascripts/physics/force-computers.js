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
    return difference.normalize().scale(p.mass*this.strength/mag);
  }
}

function RubberForce(center, world, strength){
  this.center   = center;
  this.strength = strength;
  this.world    = world;
  this.compute  = function(p){
    var center = this.center(this.world);
    if(!center)
      return new Vector(0, 0);
    var difference = center.difference(p.position);
    return difference.scale(p.mass*this.strength);
  }
}

function GravityForce(direction, world, strength){
  this.direction = direction;
  this.strength  = strength;
  this.world     = world;
  this.compute = function(p) {
    var direction = this.direction(this.world);
    return direction.normalize().scale(p.mass*this.strength);
  }
}

function PushForce(direction, world, strength){
  this.direction = direction;
  this.strength  = strength;
  this.world     = world;
  this.compute = function(_) {
    var direction = this.direction(this.world);
    return direction.normalize().scale(this.strength);
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