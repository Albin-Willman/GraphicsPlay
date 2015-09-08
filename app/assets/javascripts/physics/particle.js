var svgns = "http://www.w3.org/2000/svg";
function Particle(x, y, mass, world){
  this.position = new Vector(x, y);
  this.velocity = new Vector(1, 1);
  this.force    = new Vector(0, 0);
  this.mass = mass;
  this.world = world;
  this.color = 'black';
  this.elasticity = 0.95;
  this.forces = []
  this.x = function() {
    return this.position.x;
  }
  this.y = function() {
    return this.position.y;
  }
  this.update = function(){
    this.position = this.position.add(this.velocity);
    for (i in this.forces) {
      this.nudge(this.forces[i].compute(this));  
    }
    this.velocity = this.velocity.add(this.acceleration());
    this.force    = new Vector(0, 0)
    this.world.checkLimits(this);
    return this;
  }
  this.acceleration = function() {
    return this.force.scale(1/this.mass);
  }
  this.nudge = function(force) {
    this.force = this.force.add(force);
  }
  this.draw = function(){
    var svg = document.createElementNS(svgns, "circle");
    svg.setAttributeNS(null, 'cx', this.x());
    svg.setAttributeNS(null, 'cy', this.y());
    svg.setAttributeNS(null, 'r', this.mass);
    svg.setAttributeNS(null, 'fill', this.color);
    this.world.canvas.appendChild(svg);
  }
}
