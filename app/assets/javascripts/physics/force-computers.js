function ForceComputer(center, world, strength){
  this.compute  = function(p){
    var direction = this.directionComputer.call(p);
    return this.call(p, direction);
  }
  this.call = function(p, direction){
    if(!direction)
      return new Vector(0, 0);
    return direction.normalize().scale(this.magnitudeComputer.compute(p, direction));
  }
}

DragForce.prototype = new ForceComputer();
function DragForce(center, world, strength){
  this.magnitudeComputer = new GravityMagnitudeComputer(strength);
  this.directionComputer = new PointDirectionComputer(center, world);
}

RubberForce.prototype = new ForceComputer();
function RubberForce(center, world, strength){
  this.magnitudeComputer = new RubberbandMagnitudeComputer(strength);
  this.directionComputer = new PointDirectionComputer(center, world);
}

GravityForce.prototype = new ForceComputer();
function GravityForce(direction, world, strength){
  this.magnitudeComputer = new GravityMagnitudeComputer(strength);
  this.directionComputer = new FixDirectionComputer(direction, world);
}

PushForce.prototype = new ForceComputer();
function PushForce(direction, world, strength){
  this.magnitudeComputer = new ConstantMagnitudeComputer(strength);
  this.directionComputer = new FixDirectionComputer(direction, world);
}

NoiseForce.prototype = new ForceComputer();
function NoiseForce(strength){
  this.magnitudeComputer = new RandomMagnitudeComputer(strength);
  this.directionComputer = new RandomDirectionComputer(null, null);
}

FrictionForce.prototype = new ForceComputer();
function FrictionForce(strength){
  this.magnitudeComputer = new RubberbandMagnitudeComputer(-1 * strength);
  this.directionComputer = new TravelDirectionComputer(null, null);
}

// Direction computers
function PointDirectionComputer(center, world){
  this.center = center;
  this.world  = world;
  this.call = function(p){
    var center = this.center(this.world);
    if(!center)
      return false;
    return center.difference(p.position);
  }
}

function FixDirectionComputer(direction, world){
  this.direction = direction;
  this.world     = world;
  this.call = function(p){
    return this.direction(this.world);
  }
}

function RandomDirectionComputer(_, _){
  this.call = function(_){
    return new Vector(Math.random() - 0.5, Math.random() - 0.5);
  }
}

function TravelDirectionComputer(_, _){
  this.call = function(p){
    return p.velocity;
  }
}

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
  this.compute = function(_, _){
    return this.strength;
  } 
}

function RubberbandMagnitudeComputer(strength){
  this.strength = strength;
  this.compute = function(p, direction){
    return this.strength * direction.magnitude();
  } 
}
