// Interactive world on the physics page, with a control panel built from FORCE_CONTROLS.
var FORCE_CONTROLS = [
  { id: 'rubber',   label: 'Rubber band to mouse',       type: 'rubber',   direction: 'mouse', min: 0,   max: 0.1, step: 0.001, value: 0.01, enabled: true },
  { id: 'mouse',    label: 'Mouse pull (negative repels)', type: 'drag',   direction: 'mouse', min: -20, max: 20,  step: 0.5,   value: -5,   enabled: true },
  { id: 'push',     label: 'Arrow key push',             type: 'push',     direction: 'keys',  min: 0,   max: 20,  step: 0.5,   value: 5,    enabled: true },
  { id: 'friction', label: 'Friction',                   type: 'friction',                     min: 0,   max: 1,   step: 0.01,  value: 0.3,  enabled: true },
  { id: 'noise',    label: 'Noise',                      type: 'noise',                        min: 0,   max: 2,   step: 0.01,  value: 0.31, enabled: true },
  { id: 'gravity',  label: 'Gravity (down)',             type: 'gravity',  direction: 'down',  min: 0,   max: 2,   step: 0.05,  value: 0.3,  enabled: false },
];

var SHAPE_OPTIONS = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'circle',    label: 'Circle' },
  { value: 'ellipse',   label: 'Ellipse' },
];

var LIMIT_OPTIONS = [
  { value: 'hard',   label: 'Bounce off walls' },
  { value: 'round',  label: 'Wrap around' },
  { value: 'tunnel', label: 'Wrap top/bottom' },
  { value: 'none',   label: 'No walls' },
];

// See colors.js. Each mode lists the labels of the colour pickers it uses.
var COLOR_OPTIONS = [
  { value: 'random', label: 'Random' },
  { value: 'solid',  label: 'Solid' },
  { value: 'size',   label: 'By size' },
  { value: 'speed',  label: 'By speed' },
  { value: 'height', label: 'By position (top to bottom)' },
];
var COLOR_PICKER_LABELS = {
  solid: ['Colour'],
  size:  ['Small', 'Big'],
  speed: ['Slow', 'Fast'],
  height: ['Top', 'Bottom'],
};

document.addEventListener('DOMContentLoaded', function(){
  var panel = document.getElementById('controls');
  if (!panel || !document.getElementById('world')) { return; }

  var ff = setupForceFunctions('world');
  var directions = {
    mouse: ff.mousePosition,
    keys:  ff.keyDirection,
    down:  buildDirectionFunction(new Vector(0, 1)),
  };

  var settings = { width: 500, height: 500, shape: 'rectangle', limits: 'hard', numberOfParticles: 200, minMass: 1, maxMass: 25, collisions: false, collisionLoss: 10,
                   colorMode: 'random', colorFrom: '#1f3a93', colorTo: '#ff5a1f' };

  function applyCollisions() { sim.setCollisions(settings.collisions, settings.collisionLoss / 100); }

  // The sliders' forces plus one per gravity point (set up once the world exists).
  var gravityPoints = null;
  function currentForceOpts() {
    return FORCE_CONTROLS
      .filter(function(c) { return c.enabled; })
      .map(function(c) { return buildForceOpts(c.type, c.value, directions[c.direction] || null); })
      .concat(gravityPoints ? gravityPoints.forceOpts() : []);
  }

  var sim = setupWorld({
    canvas: 'world',
    width: settings.width,
    height: settings.height,
    limits: settings.limits,
    numberOfParticles: settings.numberOfParticles,
    minMass: settings.minMass,
    maxMass: settings.maxMass,
    forces: currentForceOpts()
  });

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    for (var key in attrs) { node.setAttribute(key, attrs[key]); }
    (children || []).forEach(function(child) {
      node.append(child);
    });
    return node;
  }

  function slider(id, label, opts, onInput, onChange) {
    var output = el('span', { class: 'pull-right text-muted' }, [String(opts.value)]);
    var input = el('input', { type: 'range', id: id, min: opts.min, max: opts.max, step: opts.step, value: opts.value });
    input.addEventListener('input', function() {
      output.textContent = input.value;
      if (onInput) { onInput(parseFloat(input.value)); }
    });
    if (onChange) {
      input.addEventListener('change', function() { onChange(parseFloat(input.value)); });
    }
    return el('div', { class: 'form-group' }, [
      el('label', { for: id }, [label]), output, input
    ]);
  }

  // A slider with a checkbox in its label that turns the setting on and off.
  function toggleSlider(id, label, opts, enabled, onInput, onToggle) {
    var group = slider(id, '', opts, onInput);
    var range = group.querySelector('input[type=range]');
    var checkbox = el('input', { type: 'checkbox' });
    checkbox.checked = enabled;
    range.disabled = !enabled;
    checkbox.addEventListener('change', function() {
      range.disabled = !checkbox.checked;
      onToggle(checkbox.checked);
    });
    var labelEl = group.querySelector('label');
    labelEl.removeAttribute('for');
    labelEl.append(checkbox, ' ' + label);
    return group;
  }

  // Forces
  panel.append(el('h4', {}, ['Forces']));
  FORCE_CONTROLS.forEach(function(c) {
    panel.append(toggleSlider('force-' + c.id, c.label, c, c.enabled,
      function(value) { c.value = value; sim.setForces(currentForceOpts()); },
      function(enabled) { c.enabled = enabled; sim.setForces(currentForceOpts()); }));
  });

  // Gravity points
  panel.append(el('h4', {}, ['Gravity points']));
  var pointList = el('ul', { class: 'list-unstyled gravity-point-list' });
  var clearButton = el('button', { type: 'button', class: 'btn btn-default btn-xs' }, ['Delete all']);
  panel.append(pointList, el('div', { class: 'form-group' }, [clearButton]));
  gravityPoints = new GravityPoints(document.getElementById('world'), pointList, function() {
    clearButton.hidden = !gravityPoints.count();
    sim.setForces(currentForceOpts());
  });
  clearButton.hidden = true;
  clearButton.addEventListener('click', function() { gravityPoints.clear(); });

  // World
  panel.append(el('h4', {}, ['World']));
  function select(id, label, options, value, onChange) {
    var input = el('select', { id: id, class: 'form-control input-sm' },
      options.map(function(o) { return el('option', { value: o.value }, [o.label]); }));
    input.value = value;
    input.addEventListener('change', function() { onChange(input.value); });
    panel.append(el('div', { class: 'form-group' }, [el('label', { for: id }, [label]), input]));
    return input;
  }

  select('shape', 'Shape', SHAPE_OPTIONS, settings.shape, function(value) {
    settings.shape = value;
    // Wrapping only works in a rectangle; other shapes get walls instead.
    var rectangle = value == 'rectangle';
    [].forEach.call(limitsSelect.options, function(option) {
      option.disabled = !rectangle && (option.value == 'round' || option.value == 'tunnel');
    });
    if (limitsSelect.selectedOptions[0].disabled) {
      limitsSelect.value = settings.limits = 'hard';
      sim.setLimits('hard');
    }
    sim.setShape(value);
  });
  var limitsSelect = select('limits', 'Edges', LIMIT_OPTIONS, settings.limits, function(value) {
    settings.limits = value;
    sim.setLimits(value);
  });

  function resize() {
    sim.setSize(settings.width, settings.height);
    gravityPoints.resize(settings.width, settings.height);
  }
  panel.append(slider('width', 'Width', { min: 100, max: 1200, step: 10, value: settings.width },
    function(value) { settings.width = value; resize(); }));
  panel.append(slider('height', 'Height', { min: 100, max: 1200, step: 10, value: settings.height },
    function(value) { settings.height = value; resize(); }));

  applyCollisions();
  panel.append(toggleSlider('collisions', 'Collisions (% energy lost)',
    { min: 0, max: 100, step: 1, value: settings.collisionLoss }, settings.collisions,
    function(value) { settings.collisionLoss = value; applyCollisions(); },
    function(enabled) { settings.collisions = enabled; applyCollisions(); }));

  // Colours: the pickers' labels follow the mode, and only the ones it uses are shown.
  function colorPicker(value, onInput) {
    var input = el('input', { type: 'color', value: value });
    input.addEventListener('input', function() { onInput(input.value); });
    var label = el('span');
    return { input: input, label: label, node: el('label', { class: 'color-picker' }, [input, ' ', label]) };
  }
  function applyColors() {
    sim.setColors(settings.colorMode, settings.colorFrom, settings.colorTo);
    var labels = COLOR_PICKER_LABELS[settings.colorMode] || [];
    fromPicker.label.textContent = labels[0] || '';
    toPicker.label.textContent = labels[1] || '';
    fromPicker.node.hidden = !labels[0];
    toPicker.node.hidden = !labels[1];
    pickers.hidden = !labels.length;
  }
  select('color-mode', 'Colour', COLOR_OPTIONS, settings.colorMode, function(value) {
    settings.colorMode = value;
    applyColors();
  });
  var fromPicker = colorPicker(settings.colorFrom, function(value) { settings.colorFrom = value; applyColors(); });
  var toPicker = colorPicker(settings.colorTo, function(value) { settings.colorTo = value; applyColors(); });
  var pickers = el('div', { class: 'form-group' }, [fromPicker.node, ' ', toPicker.node]);
  panel.append(pickers);
  applyColors();

  function reset() { sim.reset(settings.numberOfParticles, settings.minMass, settings.maxMass); }

  panel.append(slider('particles', 'Particles', { min: 1, max: 1000, step: 1, value: settings.numberOfParticles },
    null, function(value) { settings.numberOfParticles = value; reset(); }));

  // Min and max size push each other along so min never ends up above max.
  function setSlider(group, value) {
    group.querySelector('input[type=range]').value = value;
    group.querySelector('span').textContent = String(value);
  }
  var sizeRange = { min: 1, max: 50, step: 1 };
  var minMassSlider = slider('min-mass', 'Min size', Object.assign({ value: settings.minMass }, sizeRange),
    null, function(value) {
      settings.minMass = value;
      if (settings.maxMass < value) { settings.maxMass = value; setSlider(maxMassSlider, value); }
      reset();
    });
  var maxMassSlider = slider('max-mass', 'Max size', Object.assign({ value: settings.maxMass }, sizeRange),
    null, function(value) {
      settings.maxMass = value;
      if (settings.minMass > value) { settings.minMass = value; setSlider(minMassSlider, value); }
      reset();
    });
  panel.append(minMassSlider, maxMassSlider);

  // On-screen arrow keys for touch screens (CSS hides them where there's a mouse).
  // Holding a button holds that arrow key down.
  var arrowPad = el('div', { class: 'arrow-pad', 'aria-label': 'Arrow key push' },
    [['ArrowUp', 'up'], ['ArrowLeft', 'left'], ['ArrowDown', 'down'], ['ArrowRight', 'right']].map(function(arrow) {
      var button = el('button', { type: 'button', class: 'btn btn-default arrow-' + arrow[1], 'aria-label': 'Push ' + arrow[1] },
        [el('i', { class: 'fa fa-arrow-' + arrow[1] })]);
      button.addEventListener('pointerdown', function(e) {
        e.preventDefault();
        button.setPointerCapture(e.pointerId);
        ff.holdKey(arrow[0], true);
      });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function(type) {
        button.addEventListener(type, function() { ff.holdKey(arrow[0], false); });
      });
      button.addEventListener('contextmenu', function(e) { e.preventDefault(); });
      return button;
    }));
  document.getElementById('world').after(arrowPad);

  var pauseButton = el('button', { type: 'button', class: 'btn btn-default' }, ['Pause']);
  pauseButton.addEventListener('click', function() {
    sim.paused = !sim.paused;
    pauseButton.textContent = sim.paused ? 'Resume' : 'Pause';
  });
  var resetButton = el('button', { type: 'button', class: 'btn btn-primary' }, ['Reset']);
  resetButton.addEventListener('click', reset);
  panel.append(el('div', { class: 'btn-group' }, [pauseButton, resetButton]));
});
