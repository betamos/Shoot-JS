/**
 * 
 */

var direction = {
  UP : new Vector(0, 1),
  RIGHT : new Vector(1, 0),
  DOWN : new Vector(0, -1),
  LEFT : new Vector(-1, 0),
};

var config = {
  canvasWidth : 800,
  canvasHeight : 300,
  controls : { // W, A, S, D
    87 : direction.UP,
    68 : direction.RIGHT,
    83 : direction.DOWN,
    65 : direction.LEFT,
  },
};

var liveDebug;

var renderEngine = function(canvas) {
  var self = this;
  var ctx = canvas.get(0).getContext('2d');
  canvas.attr('width', config.canvasWidth);
  canvas.attr('height', config.canvasHeight);
  
  ctx.scale(1, -1);
  ctx.translate(0, -1 * config.canvasHeight);
  
  // Ascending from bottom to top in z-index
  self.scene = {
    bullets : [],
    houses : [],
    players : [],
    hud : [],
  };
  
  self.clear = function(color) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
  };
  
  var timer = new Timer();
  
  self.redraw = function() {
    timer.start();
    Collisions.runDetections();
    // l('redraw');
    self.clear();
    for (var i in self.scene) {
      for (var j in self.scene[i])
        self.scene[i][j].redraw(ctx);
    }
    timer.stop();
    liveDebug.frameTime.text(timer.getTime());
  };
};

$(document).ready(function() {
  
  liveDebug = {
    frameTime : $('#frame-time')
  };
  
  var canvas = $('<canvas />');
  $('#game').append(canvas);
  var renderer = new renderEngine(canvas);
  renderer.clear();
  
  var player = new Player(100, 100);
  var crossHair = new CrossHair(player);
  var interval = setInterval(renderer.redraw, 13);
  
  canvas.mousemove(function(e) {
    var x = e.pageX - this.offsetLeft;
    var y = config.canvasHeight - (e.pageY - this.offsetTop);
    crossHair.position.x = x;
    crossHair.position.y = y;
  });
  
  // canvas.css('cursor', 'none');
  
  // var moveControls = ['w', 'a', 's', 'd'];
  
  var keyHandler = function(e) {
    var direction = config.controls[e.keyCode];
    if (typeof direction === 'undefined')
      return true;
    switch (e.originalEvent.type) {
    case 'keydown':
      player.appendMovement(direction);
      break;
    case 'keyup':
      player.popMovement(direction);
      break;
    }
    return false;
  };

  $(window).bind('keydown', keyHandler);
  $(window).bind('keyup', keyHandler);

  var block1 = new Block(10, 10, 100, 80);
  var block2 = new Block(300, 100, 200, 75);
  
  canvas.click(function(e) {
    // Shoot
    var direction = new Vector().add(crossHair.position).add(new Vector().add(player.position).scale(-1));
    // Rescale
    direction.setLength(4);
    var bullet = new Bullet(player.position, direction);
    renderer.scene.bullets.push(bullet);
    // TODO: return false?
  });
  
  Collisions.startDetect(renderer.scene.bullets, renderer.scene.houses, function(o1, o2) {
    // o1 is the Bullet, o2 is the Rectangle
    o1.color = 'red';
    var pos = renderer.scene.bullets.indexOf(o1);
    if (pos >= 0)
      renderer.scene.bullets.splice(pos, 1);
  });

  renderer.scene.houses.push(block1);
  renderer.scene.houses.push(block2);
  renderer.scene.hud.push(crossHair);
  renderer.scene.players.push(player);
});
