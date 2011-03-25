/**
 * 
 */

(function() {

var l = function(msg) {
  if (window.console)
    console.log(msg);
};

var direction = {
  UP : new Vector(0, -1),
  RIGHT : new Vector(1, 0),
  DOWN : new Vector(0, 1),
  LEFT : new Vector(-1, 0),
};

var config = {
  canvasWidth : 800,
  canvasHeight : 300,
  controls : {
    'w' : direction.UP,
    'd' : direction.RIGHT,
    's' : direction.DOWN,
    'a' : direction.LEFT,
  },
};

var renderEngine = function(canvas) {
  var self = this;
  var ctx = canvas.get(0).getContext('2d');
  canvas.attr("width", config.canvasWidth);
  canvas.attr("height", config.canvasHeight);
  
  self.scene = [];
  
  self.clear = function(color) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
  };
  
  self.redraw = function() {
    // l('redraw');
    self.clear();
    for (i in self.scene) {
      self.scene[i].redraw(ctx);
    }
  };
};

var init = function() {
  var canvas = $('<canvas />');
  $('#game').append(canvas);
  var renderer = new renderEngine(canvas);
  renderer.clear();
  
  var player = new Player(100, 100);
  var crossHair = new CrossHair(player);
  var interval = setInterval(renderer.redraw, 15);
  
  canvas.mousemove(function(e) {
    var x = e.pageX - this.offsetLeft;
    var y = e.pageY - this.offsetTop;
    crossHair.position.x = x;
    crossHair.position.y = y;
  });
  
  canvas.css('cursor', 'none');
  
  // var moveControls = ['w', 'a', 's', 'd'];

  $(window).bind('keydown', 'w', function() {
    player.appendMovement(config.controls['w']);
  });
  $(window).bind('keydown', 'a', function() {
    player.appendMovement(config.controls['a']);
  });
  $(window).bind('keydown', 's', function() {
    player.appendMovement(config.controls['s']);
  });
  $(window).bind('keydown', 'd', function() {
    player.appendMovement(config.controls['d']);
  });
  
  $(window).bind('keyup', 'w', function() {
    player.popMovement(config.controls['w']);
  });
  $(window).bind('keyup', 'a', function() {
    player.popMovement(config.controls['a']);
  });
  $(window).bind('keyup', 's', function() {
    player.popMovement(config.controls['s']);
  });
  $(window).bind('keyup', 'd', function() {
    player.popMovement(config.controls['d']);
  });
  
  canvas.click(function(e) {
    // Shoot
    var direction = new Vector().add(crossHair.position).add(new Vector().add(player.position).scale(-1));
    // Rescale
    direction.setLength(4);
    var bullet = new Bullet(player.position, direction);
    renderer.scene.push(bullet);
  });

  renderer.scene.push(crossHair);
  renderer.scene.push(player);
};

var CrossHair = function(player) {
  var self = this;
  
  self.position = new Vector();
  self.radius = 15;
  
  self.redraw = function(ctx) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(self.position.x, self.position.y, self.radius, 0, 2 * Math.PI, false);
    ctx.moveTo(player.position.x, player.position.y);
    ctx.lineTo(self.position.x, self.position.y);
    ctx.stroke();
  };
};

var Player = function(x, y) {
  var self = this;
  self.position = new Vector(x, y);
  self.speed = 2;
  self.moveMent = [];
  self.move = function() {
    var direction = new Vector();
    for (i in self.moveMent) {
      direction.add(self.moveMent[i]);
    }
    direction.scale(self.speed);
    self.position.add(direction);
  };
  self.appendMovement = function(direction) {
    if (self.moveMent.indexOf(direction) === -1)
      self.moveMent.push(direction);
  };
  self.popMovement = function(direction) {
    var pos = self.moveMent.indexOf(direction);
    if (pos >= 0)
      self.moveMent.splice(pos, 1);
  };
  self.redraw = function(ctx) {
    self.move();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(self.position.x, self.position.y, 5, 0, 2 * Math.PI, false);
    ctx.stroke();
  };
};

var Bullet = Class.extend({
  position : null,
  movement : null,
  init : function(position, movement) {
    // TODO: Clone
    this.position = new Vector(position.x, position.y);
    this.movement = new Vector(movement.x, movement.y);
  },
  move : function() {
    this.position.add(this.movement);
  },
  redraw : function(ctx) {
    this.move();
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 3, 0, 2 * Math.PI, false);
    ctx.fill();
  },
});

window.onload = function() {
  init();
};

})(jQuery);
