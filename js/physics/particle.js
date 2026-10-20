var svgns = "http://www.w3.org/2000/svg";
function Particle(x, y, mass, world){
  this.position = new Vector(x, y);
  this.velocity = new Vector(0, 0);
  this.force    = new Vector(0, 0);
  this.mass = mass;
  this.world = world;
  this.color = 'black';
  this.elasticity = 0.95;
  this.restingSpeed = 0;
  this.forces = [];
  this.el = null;
  this.x = function() {
    return this.position.x;
  }
  this.y = function() {
    return this.position.y;
  }
  this.update = function(){
    this.previousPosition = this.position;
    this.position = this.position.add(this.velocity);
    for (var i = 0; i < this.forces.length; i++) {
      this.nudge(this.forces[i].compute(this));
    }
    var acceleration = this.acceleration();
    this.velocity = this.velocity.add(acceleration);
    // Hits slower than about two steps of this particle's own acceleration are resting
    // contacts (e.g. sitting on the floor under gravity) rather than bounces.
    this.restingSpeed = 2 * acceleration.magnitude();
    this.force    = new Vector(0, 0);
    return this;
  }
  // How fast it visibly moves, in px per step. Its velocity alone overstates this for a
  // particle at rest in a pile (the velocity keeps the gravity the collisions cancel),
  // and the distance moved overstates it in the step it wraps around the edge.
  this.speed = function() {
    var moved = this.previousPosition ? this.position.difference(this.previousPosition).magnitude() : 0;
    return Math.min(moved, this.velocity.magnitude());
  }
  this.acceleration = function() {
    return this.force.scale(1/this.mass);
  }
  this.nudge = function(force) {
    this.force = this.force.add(force);
  }
  // The circle is created once; later frames only move it, and only recolour it
  // when the colour has changed. `fill` defaults to the particle's own colour.
  this.draw = function(fill){
    fill = fill || this.color;
    if (!this.el) {
      this.el = document.createElementNS(svgns, "circle");
      this.el.setAttribute('r', this.mass);
      this.world.canvas.appendChild(this.el);
    }
    if (fill !== this.fill) {
      this.el.setAttribute('fill', fill);
      this.fill = fill;
    }
    this.el.setAttribute('cx', this.x());
    this.el.setAttribute('cy', this.y());
  }
  this.remove = function(){
    if (this.el) {
      this.el.remove();
      this.el = null;
      this.fill = null;
    }
  }
}
