// Interactive world on the physics page, with a control panel built from FORCE_CONTROLS.
var FORCE_CONTROLS = [
  { id: 'rubber',   label: 'Rubber band to mouse',       type: 'rubber',   direction: 'mouse', min: 0,   max: 0.1, step: 0.001, value: 0.01, enabled: true },
  { id: 'mouse',    label: 'Mouse pull (negative repels)', type: 'drag',   direction: 'mouse', min: -20, max: 20,  step: 0.5,   value: -5,   enabled: true },
  { id: 'push',     label: 'Arrow key push',             type: 'push',     direction: 'keys',  min: 0,   max: 20,  step: 0.5,   value: 5,    enabled: true },
  { id: 'friction', label: 'Friction',                   type: 'friction',                     min: 0,   max: 1,   step: 0.01,  value: 0.3,  enabled: true },
  { id: 'noise',    label: 'Noise',                      type: 'noise',                        min: 0,   max: 2,   step: 0.01,  value: 0.31, enabled: true },
  { id: 'gravity',  label: 'Gravity (down)',             type: 'gravity',  direction: 'down',  min: 0,   max: 2,   step: 0.05,  value: 0.3,  enabled: false },
];

var LIMIT_OPTIONS = [
  { value: 'hard',   label: 'Bounce off walls' },
  { value: 'round',  label: 'Wrap around' },
  { value: 'tunnel', label: 'Wrap top/bottom' },
  { value: 'none',   label: 'No walls' },
];

document.addEventListener('DOMContentLoaded', function(){
  var panel = document.getElementById('controls');
  if (!panel || !document.getElementById('world')) { return; }

  var ff = setupForceFunctions('world');
  var directions = {
    mouse: ff.mousePosition,
    keys:  ff.keyDirection,
    down:  buildDirectionFunction(new Vector(0, 1)),
  };

  var settings = { limits: 'hard', numberOfParticles: 200, maxMass: 25 };

  function currentForceOpts() {
    return FORCE_CONTROLS
      .filter(function(c) { return c.enabled; })
      .map(function(c) { return buildForceOpts(c.type, c.value, directions[c.direction] || null); });
  }

  var sim = setupWorld({
    canvas: 'world',
    width: 500,
    height: 500,
    limits: settings.limits,
    numberOfParticles: settings.numberOfParticles,
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

  // Forces
  panel.append(el('h4', {}, ['Forces']));
  FORCE_CONTROLS.forEach(function(c) {
    var group = slider('force-' + c.id, '', c, function(value) {
      c.value = value;
      sim.setForces(currentForceOpts());
    });
    var checkbox = el('input', { type: 'checkbox' });
    checkbox.checked = c.enabled;
    checkbox.addEventListener('change', function() {
      c.enabled = checkbox.checked;
      group.querySelector('input[type=range]').disabled = !c.enabled;
      sim.setForces(currentForceOpts());
    });
    group.querySelector('input[type=range]').disabled = !c.enabled;
    var label = group.querySelector('label');
    label.removeAttribute('for');
    label.append(checkbox, ' ' + c.label);
    panel.append(group);
  });

  // World
  panel.append(el('h4', {}, ['World']));
  var limitsSelect = el('select', { id: 'limits', class: 'form-control input-sm' },
    LIMIT_OPTIONS.map(function(o) { return el('option', { value: o.value }, [o.label]); }));
  limitsSelect.value = settings.limits;
  limitsSelect.addEventListener('change', function() { sim.setLimits(limitsSelect.value); });
  panel.append(el('div', { class: 'form-group' }, [el('label', { for: 'limits' }, ['Edges']), limitsSelect]));

  function reset() { sim.reset(settings.numberOfParticles, settings.maxMass); }

  panel.append(slider('particles', 'Particles', { min: 1, max: 1000, step: 1, value: settings.numberOfParticles },
    null, function(value) { settings.numberOfParticles = value; reset(); }));
  panel.append(slider('max-mass', 'Max size', { min: 1, max: 40, step: 1, value: settings.maxMass },
    null, function(value) { settings.maxMass = value; reset(); }));

  var pauseButton = el('button', { type: 'button', class: 'btn btn-default' }, ['Pause']);
  pauseButton.addEventListener('click', function() {
    sim.paused = !sim.paused;
    pauseButton.textContent = sim.paused ? 'Resume' : 'Pause';
  });
  var resetButton = el('button', { type: 'button', class: 'btn btn-primary' }, ['Reset']);
  resetButton.addEventListener('click', reset);
  panel.append(el('div', { class: 'btn-group' }, [pauseButton, resetButton]));
});
