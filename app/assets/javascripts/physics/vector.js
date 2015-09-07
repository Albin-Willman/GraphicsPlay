function Vector(x, y) {
  this.x = x;
  this.y = y;
  this.add = function(other){
    return new Vector(this.x + other.x, this.y + other.y);
  }
  this.scale = function(k) {
    return new Vector(this.x*k, this.y*k);
  }
}
