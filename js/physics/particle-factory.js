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
  // Somewhere inside the world's shape.
  this.buildParticle = function(mass){
    var x, y;
    do {
      x = this.random(this.world.sizeX);
      y = this.random(this.world.sizeY);
    } while (!this.world.contains(x, y));
    return new Particle(x, y, mass, this.world);
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

function RandomMassComputer(minMass, maxMass){
  this.minMass = minMass;
  this.maxMass = maxMass;
  this.compute = function(){
    return this.minMass + Math.random() * (this.maxMass - this.minMass);
  }
}
