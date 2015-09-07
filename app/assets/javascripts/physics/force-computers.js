function DragForce(center){
  this.center = center;
  this.compute = function(strength, p){
    var difference = this.center.difference(p.position);
    var mag = difference.magnitude();
    if (mag > 0.000001) {
      return difference.scale(p.mass*strength/(mag*mag));
    } else {
      return difference.scale(1000000);
    }
  }
}
