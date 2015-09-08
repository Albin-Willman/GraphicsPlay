function ParticleFactory(world, maxMass){
  this.maxMass = maxMass;
  this.world = world;
  this.build = function(numberOfParticles){
    var particles = new Array();
    for (var i = 0; i < numberOfParticles; i++) {
      var particle = this.buildParticle();
      particle.color = this.getRandomColor();
      particles.push(particle);  
    }
    return particles;
  }
  this.buildParticle = function(){
    return new Particle(
        this.randomInteger(this.world.sizeX),
        this.randomInteger(this.world.sizeY),
        this.randomInteger(this.maxMass) + 1,
        world);
  }
  this.randomInteger = function(max){
    return Math.floor(Math.random() * max);
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
