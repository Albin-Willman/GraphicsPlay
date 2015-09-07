$(function(){
  var world = new World(2000, 2000, 'world');
  var particles = new Array();
  var particle = new Particle(0, 2000, 50, world);
  particles.push(particle);
  world.drawParticle(particle);
  var particle = new Particle(0, 1000, 30, world);
  particles.push(particle);
  world.drawParticle(particle);
  function updateWorld(){
    world.clear();
    for (my_particle in particles) {
      var particle = particles[my_particle];
      particle.update([world.g.scale(particle.mass)]);
      world.drawParticle(particle);  
    }
    window.requestAnimationFrame(updateWorld);
  }
  window.requestAnimationFrame(updateWorld);
});
