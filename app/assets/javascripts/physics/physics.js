$(function(){
  var width = 1500;
  var height = 1500;
  world = new World(width, height, 'world');

  var numberOfParticles = 30;
  var mouseStrength     = 100;
  var dragStrength      = 50;
  var keyStrength       = 10;
  var maxMass           = 40;
  var noiseStrength     = 0.1;

  var gravityFunction = function(world){
    return new Vector(1, 1);
  }

  var gravity   = new GravityForce(gravityFunction, world, 0.3);
  var friction  = new FrictionForce(0.4);
  var mouseDrag = new DragForce(getRelativeMousePosition, world, mouseStrength);
  var keyForce  = new PushForce(keyPush, world, keyStrength);
  var dragPoint = new DragForce(fixDragPoint, world, dragStrength);
  var noise     = new NoiseForce(noiseStrength);

  var pf = new ParticleFactory(world, maxMass);
  var particles = pf.build(numberOfParticles);

  function updateWorld(){
    world.clear();
    for (particleIndex in particles) {
      var particle = particles[particleIndex];
      var forces   = [
        noise.compute(particle),
        // gravity.compute(particle),
        // mouseDrag.compute(particle),
        dragPoint.compute(particle),
        keyForce.compute(particle),
        friction.compute(particle)
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
    mousePosition = new Vector(0, 0);
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
function fixDragPoint() {
  if(!dragPoint)
    dragPoint = new Vector(750, 750);
  // dragPoint = dragPoint.add(new Vector(Math.random()-0.5, Math.random()-0.5));
  return dragPoint;
}
