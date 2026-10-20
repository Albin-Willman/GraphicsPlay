function World(sizeX, sizeY, canvasId){
  this.sizeX = sizeX;
  this.sizeY = sizeY;

  this.canvas = document.getElementById(canvasId);
  if (!this.canvas) {
    this.initiated = false;
    return false;
  }
  this.canvas.setAttribute('width', sizeX);
  this.canvas.setAttribute('height', sizeY);
  this.particles = [];
  this.limits = new NoLimits(this);
  this.collisions = null; // null when off, otherwise { restitution: 0..1 }
  this.shapeName = 'rectangle';
  this.shape = null; // null for the plain rectangle, otherwise see shapes.js
  this.outline = null;
  this.colorer = null; // null for each particle's own colour, otherwise see colors.js

  // The area outside the shape is shaded, behind the particles.
  this.setShape = function(name){
    this.shapeName = name;
    this.shape = makeShape(name, this.sizeX, this.sizeY);
    if (!this.outline) {
      this.outline = document.createElementNS(svgns, 'path');
      this.outline.setAttribute('class', 'world-outside');
      this.outline.setAttribute('fill-rule', 'evenodd');
      this.canvas.insertBefore(this.outline, this.canvas.firstChild);
    }
    this.outline.setAttribute('d', this.shape ? this.shape.outline : '');
  }
  this.contains = function(x, y){
    return !this.shape || this.shape.contains(x, y);
  }

  this.addParticle = function(p){
    this.particles.push(p);
  }
  this.clear = function(){
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].remove();
    }
    this.particles = [];
  }
  // Positions scale with the world, so particles keep their layout and stay inside.
  this.resize = function(sizeX, sizeY){
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].position.x *= sizeX / this.sizeX;
      this.particles[i].position.y *= sizeY / this.sizeY;
    }
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.canvas.setAttribute('width', sizeX);
    this.canvas.setAttribute('height', sizeY);
    if (this.shape) { this.setShape(this.shapeName); }
    this.draw();
  }
  this.checkLimits = function(p){
    this.limits.check(p);
  }
  // Move everything, then apply the edges; collisions apply the edges as they go,
  // so a collision can't leave a particle outside the walls.
  this.update = function(){
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].update();
    }
    for (var i = 0; i < this.particles.length; i++) {
      this.checkLimits(this.particles[i]);
    }
    if (this.collisions) {
      resolveCollisions(this, this.collisions.restitution);
    }
  }
  this.draw = function(){
    if (this.colorer && this.colorer.prepare) { this.colorer.prepare(this.particles); }
    for (var i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];
      p.draw(this.colorer && this.colorer(p));
    }
  }
  this.initiated = true;
}
