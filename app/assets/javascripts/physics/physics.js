$(function(){
  var worldOpts = {
    canvas: 'logo',
    width: 100,
    height: 50,
    limits: 'hard',
    numberOfParticles: 20,
    maxMass: 1,
    forces: [
      buildForceOpts('friction', 0.05),
      buildForceOpts('drag', 3, buildDragPointFunction(new Vector(25, 25))),
      buildForceOpts('drag', 3, buildDragPointFunction(new Vector(75, 25))),
    ]
  };
  setupWorld(worldOpts);
});

$(function(){
  var ff = setupForceFunctions('world');

  var worldOpts = {
    canvas: 'world',
    width: 500,
    height: 500,
    limits: 'hard',
    numberOfParticles: 200,
    maxMass: 25,
    forces: [

      // buildForceOpts('gravity', 0.3, buildDirectionFunction(new Vector(0, 1))),
      // buildForceOpts('rubber', 0.03, buildDragPointFunction(new Vector(250, 250))),
      buildForceOpts('rubber', 0.01, ff.mousePosition),
      buildForceOpts('drag', -5, ff.mousePosition),
      buildForceOpts('push', 5, ff.keyDirection),
      buildForceOpts('friction', 0.3),
      buildForceOpts('noise', 0.31),
    ]
  }
  setupWorld(worldOpts);
});

function buildForceOpts(type, strength, direction = null) {
  return {
    type: type,
    direction: direction,
    strength: strength
  };
}

function setupForce(opts) {
  switch (opts.type) {
    case 'gravity':   return new GravityForce(opts.direction, opts.strength);
    case 'friction':  return new FrictionForce(opts.strength);
    case 'push':      return new PushForce(opts.direction, opts.strength);
    case 'drag':      return new DragForce(opts.direction, opts.strength);
    case 'rubber':    return new RubberForce(opts.direction, opts.strength);
    case 'noise':     return new NoiseForce(opts.strength);
  }
}

function setupLimits(type, world) {
  switch (type) {

    case 'tunnel': return new TunnelLimits(world);
    case 'hard': return new HardLimits(world);
    case 'round': return new RoundLimits(world);
    default: return new NoLimits(world);
  }
}

function buildDragPointFunction(point) {
  return function() { return point; }
}

function buildDirectionFunction(direction) {
  direction = direction.normalize();
  return function() { return direction; }
}

function setupForceFunctions(canvasId) {
  var mousePosition = false;
  var keyForce = false;

  document.onmousemove = function(e){
    var pos = new Vector(e.pageX, e.pageY);
    var rect   = document.getElementById(canvasId).getBoundingClientRect();
    var topCorner = new Vector(rect.left, rect.top);
    mousePosition = pos.difference(topCorner);
  }

  function activeDirection(keyCode){
    switch(keyCode) {
      case 37: return new Vector(-1, 0);
      case 38: return new Vector(0, -1);
      case 39: return new Vector(1, 0);
      case 40: return new Vector(0, 1);
    }
  }

  document.onkeydown = function(e) { keyForce = activeDirection(e.keyCode); }
  document.onkeyup   = function(e) { keyForce = false; }

  return {
      mousePosition: function(canvas) { return mousePosition; },
      keyDirection: function() { return keyForce; }
  };
}

function setupWorld(opts) {
  var world = new World(opts.width, opts.height, opts.canvas);
  if (!world.initated) { return; }

  world.limits = setupLimits(opts.limits, world);

  var forces = [];
  for (var i = 0; i < opts.forces.length; i++) {
    forces.push(setupForce(opts.forces[i]));
  }
  var pf = new ParticleFactory(world);
  pf.build(opts.numberOfParticles, new RandomMassComputer(opts.maxMass), forces);
  function updateWorld(){
    world.update();
    window.requestAnimationFrame(updateWorld);
  }
  window.requestAnimationFrame(updateWorld);
}
