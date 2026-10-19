// Non-rectangular world shapes, each fitted to the world's width x height box.
// A shape can say whether a point is inside, find how far a point is from its
// boundary (and which way is out), and give its outline as an SVG path.
// The rectangle isn't a shape: it keeps the plain walls in limits.js.
function makeShape(name, width, height){
  switch (name) {
    case 'circle':  return new EllipseShape(width, height, true);
    case 'ellipse': return new EllipseShape(width, height, false);
    default:        return null;
  }
}

function EllipseShape(width, height, circle){
  var rx = circle ? Math.min(width, height) / 2 : width / 2;
  var ry = circle ? rx : height / 2;
  var cx = width / 2, cy = height / 2;

  this.contains = function(x, y){
    var u = (x - cx) / rx, v = (y - cy) / ry;
    return u*u + v*v <= 1;
  }

  // Signed distance from the point to the boundary (positive inside) and the
  // boundary's outward normal at the nearest point. Returns null when the point
  // is more than `margin` inside, which is most particles most of the time.
  this.nearest = function(x, y, margin){
    var px = x - cx, py = y - cy;
    var u = px / rx, v = py / ry, k = u*u + v*v;
    // The ellipse scaled by s lies at least (1 - s) * min radius inside the boundary.
    var s = 1 - margin / Math.min(rx, ry);
    if (s > 0 && k < s*s) { return null; }

    var q = closestPointOnEllipse(rx, ry, px, py);
    var dx = px - q.x, dy = py - q.y;
    var distance = Math.sqrt(dx*dx + dy*dy);
    var nx = q.x / (rx*rx), ny = q.y / (ry*ry);
    var length = Math.sqrt(nx*nx + ny*ny);
    return { depth: k <= 1 ? distance : -distance, nx: nx / length, ny: ny / length };
  }

  // The outside of the world, as the box minus the ellipse.
  this.outline = 'M0,0 H' + width + ' V' + height + ' H0 Z ' +
    'M' + (cx - rx) + ',' + cy +
    ' A' + rx + ',' + ry + ' 0 1,0 ' + (cx + rx) + ',' + cy +
    ' A' + rx + ',' + ry + ' 0 1,0 ' + (cx - rx) + ',' + cy + ' Z';
}

// Nearest point on the ellipse (semi-axes a, b, centred on the origin) to (px, py).
// Iterates on the first quadrant and mirrors back. Three rounds are enough except near
// the sharp ends of a very flat ellipse; five are accurate everywhere at pixel scale.
// https://github.com/0xfaded/ellipse_demo
function closestPointOnEllipse(a, b, px, py){
  var x = Math.abs(px), y = Math.abs(py);
  var tx = Math.SQRT1_2, ty = Math.SQRT1_2;
  for (var i = 0; i < 5; i++) {
    var ex = (a*a - b*b) * tx*tx*tx / a;
    var ey = (b*b - a*a) * ty*ty*ty / b;
    var rx = a*tx - ex, ry = b*ty - ey;
    var qx = x - ex, qy = y - ey;
    var r = Math.sqrt(rx*rx + ry*ry), q = Math.sqrt(qx*qx + qy*qy);
    if (q === 0) { break; }
    tx = Math.min(1, Math.max(0, (qx * r / q + ex) / a));
    ty = Math.min(1, Math.max(0, (qy * r / q + ey) / b));
    var t = Math.sqrt(tx*tx + ty*ty);
    tx /= t;
    ty /= t;
  }
  return { x: px < 0 ? -a*tx : a*tx, y: py < 0 ? -b*ty : b*ty };
}
