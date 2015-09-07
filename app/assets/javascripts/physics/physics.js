$(function(){
  var width = 2000;
  var height = 2000;
  var numberOfParticles = 4;
  world = new World(width, height, 'world');
  world.g = new Vector(0, 0.1);
  world.friction = 0.00;

  var particles = new Array();
  for (var i = 0; i < numberOfParticles; i++) {
    var particle = new Particle(randomInteger(width), randomInteger(height), randomInteger(100), world);
    particle.color = getRandomColor();
    particle.velocity = new Vector(Math.random() * 8, Math.random() * 8);
    particles.push(particle);  
  }
  function updateWorld(){
    var mousePosition = getRelativeMousePosition(world);

    world.clear();
    for (my_particle in particles) {
      var particle = particles[my_particle];
      var forces   = [
        // world.gravityForce(particle)
      ]
      if(mousePosition) {
        forces.push(world.mouseDragForce(mousePosition, particle));
      }
      particle.update(forces);
    }
    window.requestAnimationFrame(updateWorld);
  }

  window.requestAnimationFrame(updateWorld);
});

var mousePosition = false;
document.onclick = function(e){
  mousePosition = new Vector(e.pageX, e.pageY);
  var canvas = document.getElementById('world');
  var rect   = canvas.getBoundingClientRect();
  var topCorner = new Vector(rect.left, rect.top);
  var mousePosition = pos.difference(topCorner);
}

function getRelativeMousePosition(canvas) {
  if (mousePosition) {
    var rect = canvas.canvas.getBoundingClientRect();
    var topCorner = new Vector(rect.left, rect.top);
    var pos = topCorner.difference(mousePosition);
    if (pos.x > 0 && pos.x < canvas.sizeX && pos.y > 0 && pos.y < canvas.sizeY) {
      return pos;
    }
  }
  return new Vector(1000, 1000);
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
