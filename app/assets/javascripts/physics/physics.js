$(function(){
  var width = 2000;
  var height = 2000;
  world = new World(width, height, 'world');

  var numberOfParticles = 100;
  var mouseStrength     = -100;
  var dragStrength      = 50;
  var keyStrength       = 10;
  var maxMass           = 50;

  var pf = new ParticleFactory(world, maxMass);
  var particles = pf.build(numberOfParticles);

  var gravityFunction = function(world){
    return new Vector(0, 1);
  }

  var gravity   = new GravityForce(gravityFunction, world, 0.3);
  var friction  = new FrictionForce(0.2);
  var mouseDrag = new DragForce(getRelativeMousePosition, world, mouseStrength);
  var keyForce  = new PushForce(keyPush, world, keyStrength);
  var dragPoint = new DragForce(randomDragPoint, world, dragStrength);
  var noise     = new NoiseForce(3);

  function updateWorld(){
    world.clear();
    for (my_particle in particles) {
      var particle = particles[my_particle];
      var forces   = [
        noise.compute(particle)
        // gravity.compute(particle),
        // mouseDrag.compute(particle),
        // dragPoint.compute(particle),
        // keyForce.compute(particle),
        // friction.compute(particle)
      ];
      particle.update(forces);
    }
    window.requestAnimationFrame(updateWorld);
  }

  window.requestAnimationFrame(updateWorld);
});

var mousePosition = false;
document.onmousemove = function(e){
  var pos = new Vector(e.pageX, e.pageY);
  var canvas = document.getElementById('world');
  var rect   = canvas.getBoundingClientRect();
  var topCorner = new Vector(rect.left, rect.top);
  mousePosition = pos.difference(topCorner);
}

function getRelativeMousePosition(canvas) {
  if(!mousePosition)
    mousePosition = new Vector(1000, 1000);
  return mousePosition;
}
document.onkeydown = function(e) {
  keyForce = activeDirection(e.keyCode);
}
document.onkeyup = function(e) {
  keyForce = new Vector(0, 0);
}

var keyForce = false
function activeDirection(keyCode){
  if (keyCode == '38') {
    return new Vector(0, -1);
  }
  else if (keyCode == '40') {
    return new Vector(0, 1);
  }
  else if (keyCode == '37') {
    return new Vector(-1, 0);
  }
  else if (keyCode == '39') {
    return new Vector(1, 0);
  }
}

function keyPush() {
  if(!keyForce)
    keyForce = new Vector(0, 0);
  return keyForce;
}

var dragPoint = false;
function randomDragPoint() {
  if(!dragPoint)
    dragPoint = new Vector(1000, 1000);
  dragPoint = dragPoint.add(new Vector(Math.random()-0.5, Math.random()-0.5));
  return dragPoint;
}
