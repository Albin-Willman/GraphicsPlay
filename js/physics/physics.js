document.addEventListener('DOMContentLoaded', function(){
  var worldOpts = {
    canvas: 'logo',
    width: 100,
    height: 50,
    limits: 'hard',
    numberOfParticles: 20,
    minMass: 1,
    maxMass: 2,
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

// Wrapping only makes sense for a rectangle; other shapes have walls or nothing.
function setupLimits(type, world) {
  if (world.shape) {
    return type == 'none' ? new NoLimits(world) : new ShapeLimits(world);
  }
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

// Where a pointer event is in world coordinates. The canvas can be drawn smaller than
// the world (on a narrow screen), so screen pixels are scaled by its viewBox.
function worldPosition(canvas, e) {
  var rect = canvas.getBoundingClientRect();
  var box = canvas.viewBox.baseVal;
  var width = canvas.clientWidth || rect.width, height = canvas.clientHeight || rect.height;
  return new Vector(
    (e.clientX - rect.left - canvas.clientLeft) * box.width / width,
    (e.clientY - rect.top - canvas.clientTop) * box.height / height);
}

function setupForceFunctions(canvasId) {
  var canvas = document.getElementById(canvasId);
  var mousePosition = false;
  var heldKeys = {};

  // The mouse forces follow a mouse while it's over the world, or a finger or pen
  // while it touches the world (pointer events cover all three).
  function follow(e){
    mousePosition = worldPosition(canvas, e);
  }
  function release(){
    mousePosition = false;
  }
  canvas.addEventListener('pointermove', follow);
  canvas.addEventListener('pointerdown', follow);
  canvas.addEventListener('pointerleave', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerup', function(e){
    if (e.pointerType != 'mouse') { release(); }
  });

  function activeDirection(key){
    switch(key) {
      case 'ArrowLeft':  return new Vector(-1, 0);
      case 'ArrowUp':    return new Vector(0, -1);
      case 'ArrowRight': return new Vector(1, 0);
      case 'ArrowDown':  return new Vector(0, 1);
    }
  }

  // Sum of all held arrow keys, so two keys push diagonally.
  function keyDirection(){
    var sum = new Vector(0, 0);
    for (var key in heldKeys) {
      sum = sum.add(activeDirection(key));
    }
    if (sum.x == 0 && sum.y == 0) { return false; }
    return sum.normalize();
  }

  // Leave arrow keys alone while a form control (e.g. a slider) has focus.
  function isFormControl(el){
    return el && /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(el.tagName);
  }

  document.addEventListener('keydown', function(e) {
    if (!activeDirection(e.key) || isFormControl(e.target)) { return; }
    e.preventDefault();
    heldKeys[e.key] = true;
  });
  document.addEventListener('keyup', function(e) {
    delete heldKeys[e.key];
  });
  // Key releases are missed while the window is unfocused.
  window.addEventListener('blur', function() {
    heldKeys = {};
  });

  // For on-screen arrow buttons, which hold a key down like the keyboard does.
  function holdKey(key, held){
    if (held) { heldKeys[key] = true; } else { delete heldKeys[key]; }
  }

  return {
      mousePosition: function() { return mousePosition; },
      keyDirection: keyDirection,
      holdKey: holdKey
  };
}

function setupWorld(opts) {
  var world = new World(opts.width, opts.height, opts.canvas);
  if (!world.initiated) { return null; }

  // Shared by every particle, so changing it in place affects them all.
  var forces = [];
  var limitsType;
  var colors = null;
  var massRange = { min: opts.minMass, max: opts.maxMass };

  var sim = {
    world: world,
    paused: false,
    setForces: function(forceOpts) {
      forces.length = 0;
      for (var i = 0; i < forceOpts.length; i++) {
        forces.push(setupForce(forceOpts[i]));
      }
    },
    setSize: function(width, height) {
      world.resize(width, height);
    },
    setLimits: function(type) {
      limitsType = type;
      world.limits = setupLimits(type, world);
    },
    setShape: function(name) {
      world.setShape(name);
      world.limits = setupLimits(limitsType, world);
    },
    // energyLoss is the share (0..1) of the collision's kinetic energy that is lost:
    // with restitution e, the energy along the line of impact is scaled by e².
    setCollisions: function(enabled, energyLoss) {
      world.collisions = enabled ? { restitution: Math.sqrt(1 - energyLoss) } : null;
    },
    // See colors.js. Size blends span the min-max size of the latest reset.
    setColors: function(mode, from, to) {
      colors = { mode: mode, from: from, to: to };
      world.colorer = makeColorer(mode, from, to, massRange.min, massRange.max);
      world.draw();
    },
    reset: function(numberOfParticles, minMass, maxMass) {
      massRange = { min: minMass, max: maxMass };
      if (colors) { world.colorer = makeColorer(colors.mode, colors.from, colors.to, minMass, maxMass); }
      world.clear();
      var pf = new ParticleFactory(world);
      pf.build(numberOfParticles, new RandomMassComputer(minMass, maxMass), forces);
      world.draw();
    }
  };

  sim.setLimits(opts.limits);
  sim.setForces(opts.forces);
  sim.reset(opts.numberOfParticles, opts.minMass, opts.maxMass);

  // Fixed time step: the forces are tuned per step, so always step at 60 Hz
  // and run as many steps as real time demands, whatever the display's refresh rate.
  var STEP_MS = 1000 / 60;
  var MAX_FRAME_MS = 250; // after a stall (e.g. a background tab), skip ahead instead of catching up
  // If steps are slower than real time (lots of colliding particles), catching up would
  // make every frame slower still. Run at most this many and let the simulation slow down.
  var MAX_STEPS_PER_FRAME = 4;
  var lastTime = null;
  var accumulated = 0;

  function updateWorld(now){
    if (sim.paused || lastTime === null) {
      lastTime = now;
    }
    if (!sim.paused) {
      accumulated += Math.min(now - lastTime, MAX_FRAME_MS);
      lastTime = now;
      if (accumulated >= STEP_MS) {
        for (var steps = 0; accumulated >= STEP_MS && steps < MAX_STEPS_PER_FRAME; steps++) {
          world.update();
          accumulated -= STEP_MS;
        }
        accumulated = Math.min(accumulated, STEP_MS);
        world.draw();
      }
    }
    window.requestAnimationFrame(updateWorld);
  }
  window.requestAnimationFrame(updateWorld);
  return sim;
}
