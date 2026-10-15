// Particle-particle collisions. Particles are circles whose radius is their mass.
// A uniform grid keeps it close to linear: each particle is only tested against
// the particles in its own and the eight neighbouring cells.
function resolveCollisions(particles, restitution){
  var cellSize = 0;
  for (var i = 0; i < particles.length; i++) {
    cellSize = Math.max(cellSize, 2 * particles[i].mass);
  }
  if (!cellSize) { return; }

  var grid = new Map();
  var cellX = new Array(particles.length);
  var cellY = new Array(particles.length);
  for (var i = 0; i < particles.length; i++) {
    cellX[i] = Math.floor(particles[i].x() / cellSize);
    cellY[i] = Math.floor(particles[i].y() / cellSize);
    var key = cellX[i] + ',' + cellY[i];
    if (!grid.has(key)) { grid.set(key, []); }
    grid.get(key).push(i);
  }

  for (var i = 0; i < particles.length; i++) {
    for (var dx = -1; dx <= 1; dx++) {
      for (var dy = -1; dy <= 1; dy++) {
        var cell = grid.get((cellX[i] + dx) + ',' + (cellY[i] + dy));
        if (!cell) { continue; }
        for (var k = 0; k < cell.length; k++) {
          // Each pair once.
          if (cell[k] > i) { collide(particles[i], particles[cell[k]], restitution); }
        }
      }
    }
  }
}

// restitution 1 keeps all the energy along the line between the centres, 0 keeps none.
function collide(a, b, restitution){
  var dx = b.position.x - a.position.x;
  var dy = b.position.y - a.position.y;
  var minDistance = a.mass + b.mass;
  var distanceSq = dx*dx + dy*dy;
  if (distanceSq >= minDistance*minDistance) { return; }

  var distance = Math.sqrt(distanceSq);
  var nx = 1, ny = 0;
  if (distance > 0) {
    nx = dx / distance;
    ny = dy / distance;
  }

  // Push them apart until they just touch, the lighter one moving further.
  var overlap = minDistance - distance;
  var totalMass = a.mass + b.mass;
  a.position.x -= nx * overlap * b.mass / totalMass;
  a.position.y -= ny * overlap * b.mass / totalMass;
  b.position.x += nx * overlap * a.mass / totalMass;
  b.position.y += ny * overlap * a.mass / totalMass;

  // Already moving apart: no impulse.
  var approach = (b.velocity.x - a.velocity.x)*nx + (b.velocity.y - a.velocity.y)*ny;
  if (approach >= 0) { return; }

  var impulse = -(1 + restitution) * approach / (1/a.mass + 1/b.mass);
  a.velocity = new Vector(a.velocity.x - impulse*nx/a.mass, a.velocity.y - impulse*ny/a.mass);
  b.velocity = new Vector(b.velocity.x + impulse*nx/b.mass, b.velocity.y + impulse*ny/b.mass);
}
