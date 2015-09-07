$(function(){
  var width = 2000;
  var height = 2000;
  world = new World(width, height, 'world');
  
  var numberOfParticles = 40;
  var mouseStrength     = 100;
  var dragStrength      = 50;
  var keyStrength       = 10;
  var gravity = new GravityForce(new Vector(0, 1), 0.3);
  var friction = new FrictionForce(0.2);

  var pf = new ParticleFactory(world, 20);
  var particles = pf.build(numberOfParticles);

  function updateWorld(){
    var mouseDrag = new DragForce(getRelativeMousePosition(world), mouseStrength);
    var keyForce = new PushForce(keyPush(), keyStrength);
    var dragPoint = new DragForce(fixedDragPoint(), dragStrength);

    world.clear();
    for (my_particle in particles) {
      var particle = particles[my_particle];
      var forces   = [
        // gravity.compute(particle),
        mouseDrag.compute(particle),
        // dragPoint.compute(particle),
        // keyForce.compute(particle),
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
function fixedDragPoint() {
  if(!dragPoint)
    dragPoint = new Vector(1000, 1000);
  dragPoint = dragPoint.add(new Vector(Math.random()-0.5, Math.random()-0.5));
  return dragPoint;
}
