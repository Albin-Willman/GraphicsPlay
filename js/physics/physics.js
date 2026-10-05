document.addEventListener('DOMContentLoaded', function(){
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

  document.addEventListener('mousemove', function(e){
    var pos = new Vector(e.clientX, e.clientY);
    var rect   = document.getElementById(canvasId).getBoundingClientRect();
    var topCorner = new Vector(rect.left, rect.top);
    mousePosition = pos.difference(topCorner);
  });

  function activeDirection(key){
    switch(key) {
      case 'ArrowLeft':  return new Vector(-1, 0);
      case 'ArrowUp':    return new Vector(0, -1);
      case 'ArrowRight': return new Vector(1, 0);
      case 'ArrowDown':  return new Vector(0, 1);
    }
  }

  // Leave arrow keys alone while a form control (e.g. a slider) has focus.
  function isFormControl(el){
    return el && /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(el.tagName);
  }

  document.addEventListener('keydown', function(e) {
    var direction = activeDirection(e.key);
    if (!direction || isFormControl(e.target)) { return; }
    e.preventDefault();
    keyForce = direction;
  });
  document.addEventListener('keyup', function(e) {
    if (activeDirection(e.key)) { keyForce = false; }
  });

  return {
      mousePosition: function() { return mousePosition; },
      keyDirection: function() { return keyForce; }
  };
}

function setupWorld(opts) {
  var world = new World(opts.width, opts.height, opts.canvas);
  if (!world.initiated) { return null; }

  // Shared by every particle, so changing it in place affects them all.
  var forces = [];

  var sim = {
    world: world,
    paused: false,
    setForces: function(forceOpts) {
      forces.length = 0;
      for (var i = 0; i < forceOpts.length; i++) {
        forces.push(setupForce(forceOpts[i]));
      }
    },
    setLimits: function(type) {
      world.limits = setupLimits(type, world);
    },
    reset: function(numberOfParticles, maxMass) {
      world.clear();
      var pf = new ParticleFactory(world);
      pf.build(numberOfParticles, new RandomMassComputer(maxMass), forces);
      world.draw();
    }
  };

  sim.setLimits(opts.limits);
  sim.setForces(opts.forces);
  sim.reset(opts.numberOfParticles, opts.maxMass);

  function updateWorld(){
    if (!sim.paused) {
      world.update();
      world.draw();
    }
    window.requestAnimationFrame(updateWorld);
  }
  window.requestAnimationFrame(updateWorld);
  return sim;
}
