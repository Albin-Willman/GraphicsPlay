$(function(){
  var width = 100;
  var height = 50;
  var numberOfParticles = 20;
  var dragStrength      = 2;
  var maxMass           = 1;
  var gravityStrength   = 0.01;
  var frictionStrength  = 0.03;
  var gravityDirection  = (new Vector(1, 1)).normalize();
  var world     = new World(width, height, 'logo');
  // world.limits = new RoundLimits(world);

  var gravity    = new GravityForce(gravityFunction, world, gravityStrength);
  var friction   = new FrictionForce(frictionStrength);
  var dragPoint  = new DragForce(fixDragPoint, world, dragStrength);
  var dragPoint2 = new DragForce(secondFixDragPoint, world, dragStrength);

  var forces = [
    dragPoint,
    dragPoint2,
    friction
  ]

  var pf = new ParticleFactory(world);
  var massComputer = new RandomMassComputer(maxMass);
  pf.build(numberOfParticles, massComputer,forces);

  var dragPoint = false;
  function fixDragPoint() {
    if(!dragPoint)
      dragPoint = new Vector(25, 25);
    return dragPoint;
  }
  var dragPoint2 = false;
  function secondFixDragPoint() {
    if(!dragPoint2)
      dragPoint2 = new Vector(75, 25);
    return dragPoint2;
  }

  function gravityFunction(world){
    return gravityDirection;
  }

  function updateWorld(){
    world.update();
    window.requestAnimationFrame(updateWorld);
  }
  window.requestAnimationFrame(updateWorld);

});
$(function(){
  var width = 500;
  var height = 500;
  var numberOfParticles = 30;
  var mouseStrength     = 10;
  var dragStrength      = 5;
  var keyStrength       = 1;
  var maxMass           = 4;
  var noiseStrength     = 0.5;
  var gravityStrength   = 0.03;
  var frictionStrength  = 0.03;
  var gravityDirection  = (new Vector(1, 1)).normalize();

  var gravityFunction = function(world){
    return gravityDirection;
  }

  var world     = new World(width, height, 'world');
  var gravity   = new GravityForce(gravityFunction, world, gravityStrength);
  var friction  = new FrictionForce(frictionStrength);
  var mouseDrag = new DragForce(getRelativeMousePosition, world, mouseStrength);
  var keyForce  = new PushForce(keyPush, world, keyStrength);
  var dragPoint = new DragForce(fixDragPoint, world, dragStrength);
  var noise     = new NoiseForce(noiseStrength);

  var forces   = [
    noise,
    // gravity,
    mouseDrag,
    // dragPoint,
    // keyForce,
    friction
  ];
  world.limits = new RoundLimits(world);
  // world.limits = new HardLimits(world);
  // world.limits = new NoLimits(world);
  var massComputer = new RandomMassComputer(maxMass);
  
  var pf = new ParticleFactory(world);
  pf.build(numberOfParticles, massComputer, forces);


  var forces2  = [
    noise,
    gravity,
    // mouseDrag,
    // dragPoint,
    keyForce,
    friction
  ];
  pf.build(numberOfParticles, massComputer, forces2);

  function updateWorld(){
    world.update();
    window.requestAnimationFrame(updateWorld);
  }
  window.requestAnimationFrame(updateWorld);

  var mousePosition = false;
  document.onmousemove = function(e){
    var pos = new Vector(e.pageX, e.pageY);
    var rect   = document.getElementById('world').getBoundingClientRect();
    var topCorner = new Vector(rect.left, rect.top);
    mousePosition = pos.difference(topCorner);
  }

  function getRelativeMousePosition(canvas) {
    if(!mousePosition)
      mousePosition = new Vector(0, 0);
    return mousePosition;
  }
  document.onkeydown = function(e) {
    keyForce = activeDirection(e.keyCode);
  }
  document.onkeyup = function(e) {
    keyForce = new Vector(0, 0);
  }

  var keyForce = false
  function activeDirection(keyCode){
    if (keyCode == '38')      { return new Vector(0, -1); }
    else if (keyCode == '40') { return new Vector(0, 1);  }
    else if (keyCode == '37') { return new Vector(-1, 0); }
    else if (keyCode == '39') { return new Vector(1, 0);  }
  }

  function keyPush() {
    if(!keyForce)
      keyForce = new Vector(0, 0);
    return keyForce;
  }

  var dragPoint = false;
  function fixDragPoint() {
    if(!dragPoint)
      dragPoint = new Vector(750, 750);
    // dragPoint = dragPoint.add(new Vector(Math.random()-0.5, Math.random()-0.5));
    return dragPoint;
  }
});
