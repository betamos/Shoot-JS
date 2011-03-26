/**
 * 
 */

(function() {

var l = function(msg) {
  if (window.console)
    console.log(msg);
};

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

var renderEngine = function(canvas) {
  var self = this;
  var ctx = canvas.get(0).getContext('2d');
  canvas.attr('width', config.canvasWidth);
  canvas.attr('height', config.canvasHeight);
  
  ctx.scale(1, -1);
  ctx.translate(0, -1 * config.canvasHeight);
  
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
    var y = config.canvasHeight - (e.pageY - this.offsetTop);
    crossHair.position.x = x;
    crossHair.position.y = y;
  });
  
  canvas.css('cursor', 'none');
  
  // var moveControls = ['w', 'a', 's', 'd'];
  
  var keyHandler = function(e) {
    console.log(e.originalEvent.type);
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

  var block = new Block(175, 350, 100, 300);
  
  canvas.click(function(e) {
    // Shoot
    var direction = new Vector().add(crossHair.position).add(new Vector().add(player.position).scale(-1));
    // Rescale
    direction.setLength(4);
    var bullet = new Bullet(player.position, direction);
    renderer.scene.push(bullet);
    
    block.detectCollision(bullet, 'remove');
    // TODO: return false?
  });

  renderer.scene.push(block);
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

var Bullet = PointVector.extend({
  move : function() {
    this.position.add(this.direction);
  },
  redraw : function(ctx) {
    this.move();
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 3, 0, 2 * Math.PI, false);
    ctx.fill();
  },
});

var Block = Class.extend({
  collisions : [],
  init : function(top, right, bottom, left) {
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
  },
  redraw : function(ctx) {
    this.collision();
    ctx.fillStyle = 'green';
    ctx.fillRect(this.left, this.bottom, this.right-this.left, this.top-this.bottom);
  },
  detectCollision : function(object, action) {
    this.collisions.push({
      object : object,
      action : action,
    });
  },
  collision : function() {
    for (var i = this.collisions.length-1; i >= 0; i--) {
      var position = this.collisions[i].object.position;
      if (window.Collisions.inside(position.x, position.y, this.top, this.right, this.bottom, this.left)) {
        this.collisions.splice(i, 1);
        console.log('collision');
      }
    }
  },
});

window.onload = function() {
  init();
};

})(jQuery);
