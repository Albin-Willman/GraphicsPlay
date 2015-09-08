function Vector(x, y) {
  this.x = x;
  this.y = y;
  this.add = function(other){
    return new Vector(this.x + other.x, this.y + other.y);
  }
  this.scale = function(k) {
    return new Vector(this.x*k, this.y*k);
  }
  this.magnitude = function() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
  }
  this.difference = function(other){
    return new Vector(this.x - other.x, this.y - other.y);
  }
  this.normalize = function(){
    return this.scale(1/this.magnitude());
  }
}
