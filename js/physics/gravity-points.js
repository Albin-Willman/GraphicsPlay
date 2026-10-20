// Gravity points on the physics page. Press and hold in the world to place one: the
// longer the press, the stronger it pulls. Each point pulls like the mouse pull does
// (a drag force), is drawn as a ring sized by its strength and is listed in `list`,
// where it can be deleted. `onChange` is called whenever the points change.
var GRAVITY_POINT_GROWTH = 10; // strength gained per second held
var GRAVITY_POINT_MIN = 1;
var GRAVITY_POINT_MAX = 40;

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
    g.setAttribute('transform', 'translate(' + x + ',' + y + ')');
    var ring = document.createElementNS(svgns, 'circle');
    var dot = document.createElementNS(svgns, 'circle');
    dot.setAttribute('r', 2);
    dot.setAttribute('class', 'centre');
    var label = document.createElementNS(svgns, 'text');
    g.append(ring, dot, label);
    layer.appendChild(g);
    return g;
  }
  function setStrength(g, strength){
    var r = 3 + 2 * Math.sqrt(strength);
    g.children[0].setAttribute('r', r);
    g.children[2].setAttribute('y', -r - 3);
    g.children[2].textContent = strength.toFixed(1);
  }

  function heldStrength(press){
    var seconds = (performance.now() - press.start) / 1000;
    return Math.min(GRAVITY_POINT_MAX, Math.max(GRAVITY_POINT_MIN, GRAVITY_POINT_GROWTH * seconds));
  }

  // Pointer events, so a press works with a mouse, a pen or a finger.
  var press = null;
  canvas.addEventListener('pointerdown', function(e){
    if (e.button !== 0 || press) { return; }
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left, y = e.clientY - rect.top;
    press = { id: e.pointerId, x: x, y: y, start: performance.now(), marker: marker(x, y) };
    press.marker.classList.add('growing');
    (function grow(){
      if (!press) { return; }
      setStrength(press.marker, heldStrength(press));
      window.requestAnimationFrame(grow);
    })();
  });
  canvas.addEventListener('pointerup', function(e){
    if (!press || e.pointerId !== press.id) { return; }
    var strength = Math.round(heldStrength(press) * 10) / 10;
    setStrength(press.marker, strength);
    press.marker.classList.remove('growing');
    points.push({ id: nextId++, x: press.x, y: press.y, strength: strength, marker: press.marker });
    press = null;
    changed();
  });
  canvas.addEventListener('pointercancel', function(e){
    if (!press || e.pointerId !== press.id) { return; }
    press.marker.remove();
    press = null;
  });

  this.remove = function(point){
    point.marker.remove();
    points.splice(points.indexOf(point), 1);
    changed();
  }
  this.clear = function(){
    points.slice().forEach(function(point) { point.marker.remove(); });
    points.length = 0;
    changed();
  }
  // Points move with the world when it's resized, like the particles do.
  this.resize = function(newWidth, newHeight){
    points.forEach(function(point) {
      point.x *= newWidth / width;
      point.y *= newHeight / height;
      point.marker.setAttribute('transform', 'translate(' + point.x + ',' + point.y + ')');
    });
    width = newWidth;
    height = newHeight;
    if (points.length) { changed(); }
  }
  this.forceOpts = function(){
    return points.map(function(point) {
      return buildForceOpts('drag', point.strength, buildDragPointFunction(new Vector(point.x, point.y)));
    });
  }

  var self = this;
  function changed(){
    renderList();
    onChange();
  }
  function renderList(){
    list.textContent = '';
    if (!points.length) {
      list.append(listItem('text-muted', ['None yet. Press and hold in the world to add one; hold longer for a stronger pull.']));
    }
    points.forEach(function(point) {
      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'btn btn-link btn-xs';
      remove.title = 'Delete';
      remove.setAttribute('aria-label', 'Delete gravity point ' + point.id);
      remove.innerHTML = '<i class="fa fa-times"></i>';
      remove.addEventListener('click', function() { self.remove(point); });
      var item = listItem('', [
        point.id + '. (' + Math.round(point.x) + ', ' + Math.round(point.y) + ') strength ' + point.strength.toFixed(1),
        remove
      ]);
      // Hovering an entry picks out its ring in the world.
      item.addEventListener('mouseenter', function() { point.marker.classList.add('highlight'); });
      item.addEventListener('mouseleave', function() { point.marker.classList.remove('highlight'); });
      list.append(item);
    });
  }
  function listItem(className, children){
    var li = document.createElement('li');
    li.className = className;
    li.append.apply(li, children);
    return li;
  }
  renderList();
}
