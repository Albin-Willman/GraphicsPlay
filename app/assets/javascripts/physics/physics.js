
$(function(){
  var width = 2000;
  var height = 2000;
  var numberOfParticles = 100;
  world = new World(width, height, 'world');
  world.g = new Vector(0, 0.3);
  world.friction = 0.4;
  var mouseStrength = 100;
  var gravityStrength = 50;

  var particles = new Array();
  for (var i = 0; i < numberOfParticles; i++) {
    var particle = new Particle(randomInteger(width), randomInteger(height), randomInteger(20) + 1, world);
    particle.color = getRandomColor();
    particles.push(particle);  
  }
  function updateWorld(){
    var mouseDrag = new DragForce(getRelativeMousePosition(world));
    var keyForce = keyPush();
    var gravityPoint = new DragForce(fixedGravityPoint());

    world.clear();
    for (my_particle in particles) {
      var particle = particles[my_particle];
      var forces   = [
        world.gravityForce(particle)
      ]
      if(keyForce){
        forces.push(keyForce);
      }
      if(mouseDrag.center) {
        forces.push(mouseDrag.compute(mouseStrength, particle));
      }
      if(gravityPoint.center) {
        forces.push(gravityPoint.compute(gravityStrength, particle));
      }
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
  if(mousePosition){
    return mousePosition;
  } else {
    mousePosition = new Vector(1000, 1000);
    return mousePosition;
  } 
}
document.onkeydown = function(e) {
  setActiveKey(e.keyCode);
}
document.onkeyup = function(e) {
  keyForce = new Vector(0, 0);
}

var keyForce = false
function setActiveKey(keyCode){
  if (keyCode == '38') {
    keyForce = new Vector(0, -10);
  }
  else if (keyCode == '40') {
    keyForce = new Vector(0, 10);
  }
  else if (keyCode == '37') {
    keyForce = new Vector(-10, 0);
  }
  else if (keyCode == '39') {
    keyForce = new Vector(10, 0);
  }
}

function keyPush() {
  if(!keyForce)
    keyForce = new Vector(0, 0);
  return keyForce;
}

var gravityPoint = false;
function fixedGravityPoint() {
  if(!gravityPoint)
    gravityPoint = new Vector(1000, 1000);
  gravityPoint = gravityPoint.add(new Vector(Math.random()-0.5, Math.random()-0.5));
  return gravityPoint;
}

function randomInteger(max){
  return Math.floor(Math.random() * max);
}

function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
