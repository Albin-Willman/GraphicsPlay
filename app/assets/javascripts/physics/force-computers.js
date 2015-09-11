function ForceComputer(center, world, strength){
  this.call = function(p, direction){
    return direction.normalize().scale(this.magnitudeComputer.compute(p, direction));
  }
}

function DragForce(center, world, strength){
  this.center   = center;
  this.strength = strength;
  this.world    = world;
  this.magnitudeComputer = new GravityMagnitudeComputer(strength);
  this.compute  = function(p){
    var center = this.center(this.world);
    if(!center)
      return new Vector(0, 0);
    var direction = center.difference(p.position);
    return this.call(p, direction);
  }
}
DragForce.prototype = new ForceComputer();

function RubberForce(center, world, strength){
  this.center   = center;
  this.world    = world;
  this.magnitudeComputer = new RubberbandMagnitudeComputer(strength);
  this.compute  = function(p){
    var center = this.center(this.world);
    if(!center)
      return new Vector(0, 0);
    var direction = center.difference(p.position);
    return this.call(p, direction);
  }
}
RubberForce.prototype = new ForceComputer();

function GravityForce(direction, world, strength){
  this.direction = direction;
  this.world     = world;
  this.magnitudeComputer = new GravityMagnitudeComputer(strength);
  this.compute = function(p) {
    var direction = this.direction(this.world);
    return this.call(p, direction);
  }
}
GravityForce.prototype = new ForceComputer();

function PushForce(direction, world, strength){
  this.direction = direction;
  this.world     = world;
  this.magnitudeComputer = new ConstantMagnitudeComputer(strength);
  this.compute = function(p) {
    var direction = this.direction(this.world);
    return this.call(p, direction);
  }
}
PushForce.prototype = new ForceComputer();

function NoiseForce(strength){
  this.magnitudeComputer = new RandomMagnitudeComputer(strength);
  this.compute = function(p){
    var direction = new Vector(Math.random() - 0.5, Math.random() - 0.5);
    return this.call(p, direction);
  }
}
NoiseForce.prototype = new ForceComputer();

function FrictionForce(strength){
  this.magnitudeComputer = new RubberbandMagnitudeComputer(-1 * strength);
  this.compute = function(p){
    return this.call(p, p.velocity);
  }
}
FrictionForce.prototype = new ForceComputer();

// Magnitude computers

function GravityMagnitudeComputer(strength){
  this.strength = strength;
  this.compute = function(p, direction){
    return this.strength * p.mass / direction.magnitude();
  }
}

function RandomMagnitudeComputer(strength){
  this.strength = strength;
  this.compute = function(_, _){
    return Math.random()*this.strength;
  }
}

function ConstantMagnitudeComputer(strength){
  this.strength = strength;
  this.compute = function(p, _){
    return this.strength;
  } 
}

function RubberbandMagnitudeComputer(strength){
  this.strength = strength;
  this.compute = function(p, direction){
    return this.strength * direction.magnitude();
  } 
}

