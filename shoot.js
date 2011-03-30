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
  // Milliseconds between frame, higher is slower
  frameRate : 15
};

var liveDebug;

var RenderEngine = function(canvas) {
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
  
  var frameTime = new Timer();
  
  self.redraw = function(timeDelta) {
    frameTime.start();
    Collisions.runDetections();
    // l('redraw');
    self.clear();
    for (var i in self.scene) {
      for (var j in self.scene[i])
        self.scene[i][j].redraw(ctx, self.scene);
    }
    frameTime.stop();
    liveDebug.frameTime.text(frameTime.getTime());
    liveDebug.fps.text(parseInt(1000 / timeDelta));
  };
};

$(document).ready(function() {
  
  liveDebug = {
    frameTime : $('#frame-time'),
    fps : $('#fps')
  };
  
  var canvas = $('<canvas />');
  $('#game').append(canvas);
  var renderer = new RenderEngine(canvas);
  renderer.clear();
  
  var thisPlayer = new Player(100, 100);
  thisPlayer.color = 'red';
  var crossHair = new CrossHair(thisPlayer);
  
  var timer = new Timer();
  timer.start();
  var interval = setInterval(function() {
    timer.stop();
    lastTime = timer.getTime();
    renderer.redraw(timer.getTime());
    timer.start()
  }, config.frameRate);
  
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
      thisPlayer.appendMovement(direction);
      break;
    case 'keyup':
      thisPlayer.popMovement(direction);
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
    var direction = new Vector().add(crossHair.position).add(new Vector().add(thisPlayer.position).scale(-1));
    // Rescale
    direction.setLength(4);
    var bullet = new Bullet(thisPlayer.position, direction);
    renderer.scene.bullets.push(bullet);
    // TODO: return false?
  });
  
  Collisions.startDetect(renderer.scene.bullets, renderer.scene.houses, function(bullet, house) {
    bullet.color = 'red';
    removeArrayObject(renderer.scene.bullets, bullet);
  });
  
  Collisions.startDetect(renderer.scene.bullets, renderer.scene.players, function(bullet, player) {
    if (player !== thisPlayer)
      removeArrayObject(renderer.scene.players, player);
  });

  renderer.scene.houses.push(block1);
  renderer.scene.houses.push(block2);
  renderer.scene.hud.push(crossHair);
  renderer.scene.players.push(thisPlayer);
  renderer.scene.players.push(
    thisPlayer,
    new Player(530, 120),
    new Player(150, 25),
    new Player(180, 20)
  );
});
