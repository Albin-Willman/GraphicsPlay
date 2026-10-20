// How the physics page colours its balls. A colourer maps a particle to a fill colour.
//   random: each particle's own random colour, picked when it's created
//   solid:  everyone gets `from`
//   size:   blends from `from` (smallest) to `to` (biggest)
//   speed:  blends from `from` (still) to `to` (fast for what's going on right now)
//   height: blends from `from` (top of the world) to `to` (bottom)
// Blends use a fixed number of bands, so a moving particle's colour string only
// changes (and its SVG element is only touched) when it crosses into another band.
// A colourer can have a `prepare(particles)`, which the world calls before each draw.
var COLOR_BANDS = 32;
// Typical speeds range from ~0.05 px per step (left alone) to several px per step (near the
// mouse or a gravity point), so no fixed scale suits them all. Instead `to` is reached at
// the speed only the fastest FAST_SHARE of particles reach, eased towards over ~1/3 s so
// colours don't flicker, and never below MIN_FULL_COLOR_SPEED, so a calm world stays calm.
var FAST_SHARE = 0.1;
var MIN_FULL_COLOR_SPEED = 0.5;
var FULL_SPEED_EASING = 0.05;

function makeColorer(mode, from, to, minMass, maxMass){
  switch (mode) {
    case 'solid':
      return function() { return from; };
    case 'size':
      var bands = colorBands(from, to);
      var range = maxMass - minMass;
      return function(p) {
        return bands[range > 0 ? Math.round((p.mass - minMass) / range * COLOR_BANDS) : 0];
      };
    case 'speed':
      var bands = colorBands(from, to);
      var fullSpeed = null;
      var colorer = function(p) {
        return bands[Math.round(Math.min(1, p.speed() / fullSpeed) * COLOR_BANDS)];
      };
      colorer.prepare = function(particles) {
        if (!particles.length) { return; }
        var speeds = new Float64Array(particles.length);
        for (var i = 0; i < particles.length; i++) { speeds[i] = particles[i].speed(); }
        speeds.sort();
        var target = Math.max(MIN_FULL_COLOR_SPEED, speeds[Math.floor((1 - FAST_SHARE) * (speeds.length - 1))]);
        fullSpeed = fullSpeed === null ? target : fullSpeed + (target - fullSpeed) * FULL_SPEED_EASING;
      };
      return colorer;
    case 'height':
      var bands = colorBands(from, to);
      return function(p) {
        var t = Math.min(1, Math.max(0, p.y() / p.world.sizeY));
        return bands[Math.round(t * COLOR_BANDS)];
      };
    default:
      return function(p) { return p.color; };
  }
}

// COLOR_BANDS + 1 colours evenly blended from one '#rrggbb' to another.
function colorBands(from, to){
  var a = parseHexColor(from), b = parseHexColor(to);
  var bands = [];
  for (var i = 0; i <= COLOR_BANDS; i++) {
    var t = i / COLOR_BANDS;
    bands.push('rgb(' + a.map(function(c, k) { return Math.round(c + (b[k] - c) * t); }).join(',') + ')');
  }
  return bands;
}

function parseHexColor(hex){
  return [1, 3, 5].map(function(i) { return parseInt(hex.substr(i, 2), 16); });
}
