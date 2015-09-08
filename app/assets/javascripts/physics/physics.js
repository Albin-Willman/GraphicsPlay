$(function(){
  var width = 2000;
  var height = 2000;
  var numberOfParticles = 30;
  var mouseStrength     = 100;
  var dragStrength      = 50;
  var keyStrength       = 10;
  var maxMass           = 40;
  var noiseStrength     = 5;
  var gravityStrength   = 0.3;
  var frictionStrength  = 0.3;
  var gravityDirection  = (new Vector(1, 1)).normalize();

  var gravityFunction = function(world){
    return gravityDirection;
  }
  var world     = new World(width, height, 'world');
  var gravity   = new GravityForce(gravityFunction, world, gravityStrength);
  var friction  = new FrictionForce(frictionStrength);
  var mouseDrag = new DragForce(getRelativeMousePosition, world, mouseStrength);
  var keyForce  = new PushForce(keyPush, world, keyStrength);
  var dragPoint = new DragForce(fixDragPoint, world, dragStrength);
  var noise     = new NoiseForce(noiseStrength);

  var forces   = [
    noise,
    // gravity,
    mouseDrag,
    // dragPoint,
    // keyForce,
    friction
  ];
  world.limits = new RoundLimits(world);
  // world.limits = new HardLimits(world);
  // world.limits = new NoLimits(world);
  var pf = new ParticleFactory(world, maxMass, forces);
  pf.build(numberOfParticles);

  var forces2  = [
    noise,
    gravity,
    // mouseDrag,
    // dragPoint,
    keyForce,
    friction
  ];
  var pf2 = new ParticleFactory(world, maxMass, forces2);
  pf2.build(numberOfParticles);

  function updateWorld(){
    world.update();
    window.requestAnimationFrame(updateWorld);
  }
  window.requestAnimationFrame(updateWorld);
});

var mousePosition = false;
document.onmousemove = function(e){
  var pos = new Vector(e.pageX, e.pageY);
  var rect   = document.getElementById('world').getBoundingClientRect();
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
