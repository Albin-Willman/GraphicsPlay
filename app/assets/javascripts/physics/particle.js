var svgns = "http://www.w3.org/2000/svg";
function Particle(x, y, mass, world){
  this.position = new Vector(x, y);
  this.velocity = new Vector(0.01, 0.01);
  this.force    = new Vector(0, 0);
  this.mass = mass;
  this.world = world;
  this.color = 'black';
  this.elasticity = 0.95;
  this.x = function() {
    return this.position.x;
  }
  this.y = function() {
    return this.position.y;
  }
  this.update = function(forces){
    this.position = this.position.add(this.velocity);
    for (i in forces) {
      this.nudge(forces[i]);  
    }
    this.velocity = this.velocity.add(this.acceleration());
    this.force    = new Vector(0, 0)
    this.world.checkLimits(this);
    this.to_svg();
  }
  this.acceleration = function() {
    return this.force.scale(1/this.mass);
  }
  this.nudge = function(force) {
    this.force = this.force.add(force);
  }
  this.to_svg = function(){
    var svg = document.createElementNS(svgns, "circle");
    svg.setAttributeNS(null, 'cx', this.x());
    svg.setAttributeNS(null, 'cy', this.y());
    svg.setAttributeNS(null, 'r', this.mass);
    svg.setAttributeNS(null, 'fill', this.color);
    this.world.canvas.appendChild(svg);
  }
}

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
