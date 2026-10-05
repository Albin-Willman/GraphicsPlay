function ParticleFactory(world){
  this.world = world;
  this.build = function(numberOfParticles, massComputer, forces){
    for (var i = 0; i < numberOfParticles; i++) {
      var particle      = this.buildParticle(massComputer.compute());
      particle.color    = this.getRandomColor();
      particle.velocity = this.getRandomVelocity(1);
      particle.forces   = forces;
      this.world.addParticle(particle);
    }
  }
  this.buildParticle = function(mass){
    return new Particle(
        this.random(this.world.sizeX),
        this.random(this.world.sizeY),
        mass,
        this.world);
  }
  this.random = function(max){
    return Math.random() * max;
  }
  this.getRandomVelocity = function(maxSpeed){
    return new Vector(
        (Math.random() * 2 - 1) * maxSpeed,
        (Math.random() * 2 - 1) * maxSpeed);
  }
  this.getRandomColor = function() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}

function RandomMassComputer(maxMass){
  this.maxMass = maxMass;
  this.compute = function(){
    return Math.random() * this.maxMass + 1;
  }
}
