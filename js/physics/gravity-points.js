// Gravity points on the physics page. Press and hold in the world to place one: the
// longer the press, the stronger it pulls. Each point is drawn as a ring sized by its
// strength and listed in `list`, where its force type and strength can be changed, its
// marker can be hidden and it can be deleted. `onChange` is called whenever the
// points' forces change.
var GRAVITY_POINT_HOLD_SECONDS = 4; // holding this long gives full strength

// A point pulls like the mouse pull (gravity) or like the rubber band to the mouse.
// Their strengths are on very different scales, so the ranges match their sliders.
// Negative gravity repels, like a negative mouse pull.
var GRAVITY_POINT_TYPES = {
  gravity: { label: 'Gravity',     force: 'drag',   min: -40, max: 40,  step: 0.5,   digits: 1 },
  rubber:  { label: 'Rubber band', force: 'rubber', min: 0,   max: 0.1, step: 0.001, digits: 3 },
};

function GravityPoints(canvas, list, onChange){
  var points = [];
  var nextId = 1;
  var width = +canvas.getAttribute('width'), height = +canvas.getAttribute('height');

  // Drawn over the particles; the ring under a held press grows until it's released.
  var layer = document.createElementNS(svgns, 'g');
  layer.setAttribute('class', 'gravity-points');
  canvas.appendChild(layer);

  function marker(x, y){
    var g = document.createElementNS(svgns, 'g');
    var ring = document.createElementNS(svgns, 'circle');
    var dot = document.createElementNS(svgns, 'circle');
    dot.setAttribute('r', 2);
    dot.setAttribute('class', 'centre');
    var label = document.createElementNS(svgns, 'text');
    g.append(ring, dot, label);
    layer.appendChild(g);
    moveMarker(g, x, y);
    return g;
  }
  function moveMarker(g, x, y){
    g.setAttribute('transform', 'translate(' + x + ',' + y + ')');
  }
  // The ring's size shows how strong the point is for its type, and its colour
  // whether it pulls or (with negative strength) pushes.
  function drawMarker(g, type, strength){
    var info = GRAVITY_POINT_TYPES[type];
    var r = 3 + 2 * Math.sqrt(40 * Math.abs(strength) / info.max);
    for (var t in GRAVITY_POINT_TYPES) { g.classList.toggle(t, t == type); }
    g.classList.toggle('repel', strength < 0);
    g.children[0].setAttribute('r', r);
    g.children[2].setAttribute('y', -r - 3);
    g.children[2].textContent = strength.toFixed(info.digits);
  }

  // How far through a full-strength hold the press is, from a tap (1/40) to 1.
  function heldFraction(press){
    var seconds = (performance.now() - press.start) / 1000;
    return Math.min(1, Math.max(1 / 40, seconds / GRAVITY_POINT_HOLD_SECONDS));
  }
  function roundToStep(value, step){
    return Math.round(value / step) * step;
  }

  // Pointer events, so a press works with a mouse, a pen or a finger. A press that
  // moves further than DRAG_DISTANCE screen pixels is a drag (steering the particles
  // with the mouse forces, say), not a placement, so it doesn't leave a point.
  var DRAG_DISTANCE = 10;
  var press = null;
  canvas.addEventListener('pointerdown', function(e){
    if (e.button !== 0 || press) { return; }
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    var position = worldPosition(canvas, e);
    var x = position.x, y = position.y;
    press = { id: e.pointerId, x: x, y: y, clientX: e.clientX, clientY: e.clientY,
              start: performance.now(), marker: marker(x, y) };
    press.marker.classList.add('growing');
    (function grow(){
      if (!press) { return; }
      drawMarker(press.marker, 'gravity', heldFraction(press) * GRAVITY_POINT_TYPES.gravity.max);
      window.requestAnimationFrame(grow);
    })();
  });
  canvas.addEventListener('pointerup', function(e){
    if (!press || e.pointerId !== press.id) { return; }
    // Each type keeps its own strength, both starting from how long the press was.
    var fraction = heldFraction(press);
    var strengths = {};
    for (var type in GRAVITY_POINT_TYPES) {
      var info = GRAVITY_POINT_TYPES[type];
      strengths[type] = roundToStep(fraction * info.max, info.step);
    }
    var point = { id: nextId++, x: press.x, y: press.y, type: 'gravity', strengths: strengths, marker: press.marker };
    point.marker.classList.remove('growing');
    press = null;
    drawMarker(point.marker, point.type, point.strengths.gravity);
    point.item = listItem(point);
    points.push(point);
    list.append(point.item);
    changed();
  });
  function cancelPress(e){
    if (!press || e.pointerId !== press.id) { return; }
    press.marker.remove();
    press = null;
  }
  canvas.addEventListener('pointercancel', cancelPress);
  canvas.addEventListener('pointermove', function(e){
    if (press && Math.hypot(e.clientX - press.clientX, e.clientY - press.clientY) > DRAG_DISTANCE) {
      cancelPress(e);
    }
  });
  // A long press on a touch screen would otherwise open the context menu.
  canvas.addEventListener('contextmenu', function(e){ e.preventDefault(); });

  this.remove = function(point){
    point.marker.remove();
    point.item.remove();
    points.splice(points.indexOf(point), 1);
    changed();
  }
  this.clear = function(){
    points.slice().forEach(function(point) {
      point.marker.remove();
      point.item.remove();
    });
    points.length = 0;
    changed();
  }
  // Points move with the world when it's resized, like the particles do.
  this.resize = function(newWidth, newHeight){
    points.forEach(function(point) {
      point.x *= newWidth / width;
      point.y *= newHeight / height;
      moveMarker(point.marker, point.x, point.y);
      point.item.querySelector('.position').textContent = positionText(point);
    });
    width = newWidth;
    height = newHeight;
    if (points.length) { changed(); }
  }
  this.forceOpts = function(){
    return points.map(function(point) {
      return buildForceOpts(GRAVITY_POINT_TYPES[point.type].force, point.strengths[point.type],
        buildDragPointFunction(new Vector(point.x, point.y)));
    });
  }
  this.count = function(){
    return points.length;
  }

  var self = this;
  var emptyMessage = document.createElement('li');
  emptyMessage.className = 'text-muted';
  emptyMessage.textContent = 'None yet. Press and hold in the world to add one; hold longer for a stronger pull.';
  list.append(emptyMessage);

  function changed(){
    emptyMessage.hidden = points.length > 0;
    onChange();
  }
  function positionText(point){
    return point.id + '. (' + Math.round(point.x) + ', ' + Math.round(point.y) + ')';
  }

  // Each point's entry is built once and then updated in place, so its slider keeps
  // working while it's dragged.
  function listItem(point){
    var typeSelect = document.createElement('select');
    typeSelect.className = 'form-control input-sm';
    typeSelect.setAttribute('aria-label', 'Force type of point ' + point.id);
    for (var type in GRAVITY_POINT_TYPES) {
      var option = document.createElement('option');
      option.value = type;
      option.textContent = GRAVITY_POINT_TYPES[type].label;
      typeSelect.append(option);
    }
    typeSelect.value = point.type;

    var strength = document.createElement('input');
    strength.type = 'range';
    strength.setAttribute('aria-label', 'Strength of point ' + point.id);
    var strengthText = document.createElement('span');
    strengthText.className = 'text-muted';
    function showStrength(){
      var info = GRAVITY_POINT_TYPES[point.type];
      strength.min = info.min;
      strength.title = info.min < 0 ? 'Negative repels' : '';
      strength.max = info.max;
      strength.step = info.step;
      strength.value = point.strengths[point.type];
      strengthText.textContent = point.strengths[point.type].toFixed(info.digits);
      drawMarker(point.marker, point.type, point.strengths[point.type]);
    }
    showStrength();

    typeSelect.addEventListener('change', function() {
      point.type = typeSelect.value;
      showStrength();
      onChange();
    });
    strength.addEventListener('input', function() {
      point.strengths[point.type] = parseFloat(strength.value);
      showStrength();
      onChange();
    });

    var remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn btn-link btn-xs';
    remove.title = 'Delete';
    remove.setAttribute('aria-label', 'Delete point ' + point.id);
    remove.innerHTML = '<i class="fa fa-times"></i>';
    remove.addEventListener('click', function() { self.remove(point); });

    var position = document.createElement('span');
    position.className = 'position';
    position.textContent = positionText(point);
    var header = document.createElement('div');
    header.className = 'gravity-point-header';
    // Hiding only hides the marker; the point keeps pulling.
    var hide = document.createElement('input');
    hide.type = 'checkbox';
    hide.addEventListener('change', function() {
      point.marker.classList.toggle('concealed', hide.checked);
    });
    var hideLabel = document.createElement('label');
    hideLabel.className = 'hide-point';
    hideLabel.title = 'Hide the marker; the point keeps acting';
    hideLabel.append(hide, ' Hide');
    header.append(position, hideLabel, typeSelect, remove);
    var slider = document.createElement('div');
    slider.className = 'gravity-point-strength';
    slider.append(strength, strengthText);

    var item = document.createElement('li');
    item.append(header, slider);
    // Hovering an entry picks out its ring in the world.
    item.addEventListener('mouseenter', function() { point.marker.classList.add('highlight'); });
    item.addEventListener('mouseleave', function() { point.marker.classList.remove('highlight'); });
    return item;
  }
}
