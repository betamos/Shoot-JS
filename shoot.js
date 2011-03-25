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
  var crossHair = new CrossHair();
  var interval = setInterval(renderer.redraw, 15);
  
  canvas.mousemove(function(e) {
    var x = e.pageX - this.offsetLeft;
    var y = e.pageY - this.offsetTop;
    crossHair.x = x;
    crossHair.y = y;
  });
  
  canvas.css('cursor', 'none');
  
  // var moveControls = ['w', 'a', 's', 'd'];
  
  var player = new Player(100, 100);

  $(window).bind('keydown', 'w', function() {
    player.move(config.controls['w']);
  });
  $(window).bind('keydown', 'a', function() {
    player.move(config.controls['a']);
  });
  $(window).bind('keydown', 's', function() {
    player.move(config.controls['s']);
  });
  $(window).bind('keydown', 'd', function() {
    player.move(config.controls['d']);
  });

  renderer.scene.push(crossHair);
  renderer.scene.push(player);
};

var CrossHair = function() {
  var self = this;
  
  self.x = 0;
  self.y = 0;
  self.radius = 15;
  
  self.redraw = function(ctx) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(self.x, self.y, self.radius, 0, 2 * Math.PI, false);
    ctx.stroke();
  };
};

var Player = function(x, y) {
  var self = this;
  self.position = new Vector(x, y);
  self.speed = 5;
  self.move = function(direction) {
    var e = new Vector();
    l(direction);
    e.add(direction);
    e.scale(self.speed);
    //l(e);
    self.position.add(e);
  };
  self.redraw = function(ctx) {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(self.position.x, self.position.y, 5, 0, 2 * Math.PI, false);
    ctx.stroke();
  };
};

window.onload = function() {
  init();
};

})(jQuery);
