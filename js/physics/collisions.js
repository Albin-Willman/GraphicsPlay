// Particle-particle collisions. Particles are circles whose radius is their mass.
//
// A pile needs more than one pass: each pass only resolves a contact once, and the
// floor's push has to travel up through every ball above it. So nearby pairs are found
// once per step, then they and the walls are resolved several times over.
var COLLISION_ITERATIONS = 10;
// Particles this close count as touching, so a pass still stops them moving into each
// other after an earlier pass has already pushed them apart.
var CONTACT_SLOP = 0.5;

function resolveCollisions(world, restitution){
  var pairs = findCandidatePairs(world.particles);
  for (var iteration = 0; iteration < COLLISION_ITERATIONS; iteration++) {
    for (var i = 0; i < pairs.length; i += 2) {
      collide(pairs[i], pairs[i + 1], restitution);
    }
    for (var i = 0; i < world.particles.length; i++) {
      world.checkLimits(world.particles[i]);
    }
  }
}

// Pairs close enough to touch this step, as a flat [a, b, a, b, ...] list.
// A uniform grid keeps this close to linear: each particle is only tested against
// the particles in its own and the eight neighbouring cells.
function findCandidatePairs(particles){
  var pairs = [];
  var margin = 2;
  var cellSize = 0;
  for (var i = 0; i < particles.length; i++) {
    cellSize = Math.max(cellSize, 2 * particles[i].mass + margin);
  }
  if (!cellSize) { return pairs; }

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
    var a = particles[i];
    for (var dx = -1; dx <= 1; dx++) {
      for (var dy = -1; dy <= 1; dy++) {
        var cell = grid.get((cellX[i] + dx) + ',' + (cellY[i] + dy));
        if (!cell) { continue; }
        for (var k = 0; k < cell.length; k++) {
          // Each pair once.
          if (cell[k] <= i) { continue; }
          var b = particles[cell[k]];
          var reach = a.mass + b.mass + margin;
          var ddx = b.position.x - a.position.x, ddy = b.position.y - a.position.y;
          if (ddx*ddx + ddy*ddy < reach*reach) { pairs.push(a, b); }
        }
      }
    }
  }
  return pairs;
}

// restitution 1 keeps all the energy along the line between the centres, 0 keeps none.
function collide(a, b, restitution){
  var dx = b.position.x - a.position.x;
  var dy = b.position.y - a.position.y;
  var minDistance = a.mass + b.mass;
  var reach = minDistance + CONTACT_SLOP;
  var distanceSq = dx*dx + dy*dy;
  if (distanceSq >= reach*reach) { return; }

  var distance = Math.sqrt(distanceSq);
  var nx = 1, ny = 0;
  if (distance > 0) {
    nx = dx / distance;
    ny = dy / distance;
  }

  // Push them apart until they just touch, the lighter one moving further.
  if (distance < minDistance) {
    var overlap = minDistance - distance;
    var totalMass = a.mass + b.mass;
    a.position.x -= nx * overlap * b.mass / totalMass;
    a.position.y -= ny * overlap * b.mass / totalMass;
    b.position.x += nx * overlap * a.mass / totalMass;
    b.position.y += ny * overlap * a.mass / totalMass;
  }

  // Already moving apart: no impulse.
  var approach = (b.velocity.x - a.velocity.x)*nx + (b.velocity.y - a.velocity.y)*ny;
  if (approach >= 0) { return; }

  // Contacts closing no faster than the particles' own forces push them together are
  // resting (like a ball sitting in a pile) and don't bounce, so piles can settle.
  var bounce = -approach > a.restingSpeed + b.restingSpeed ? restitution : 0;
  var impulse = -(1 + bounce) * approach / (1/a.mass + 1/b.mass);
  a.velocity.x -= impulse * nx / a.mass;
  a.velocity.y -= impulse * ny / a.mass;
  b.velocity.x += impulse * nx / b.mass;
  b.velocity.y += impulse * ny / b.mass;
}
