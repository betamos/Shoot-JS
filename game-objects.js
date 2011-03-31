/**
 * @author Didrik Nordström
 */

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

var Player = Class.extend({
  init : function(x, y) {
    this.position = new Vector(x, y);
    this.speed = 2;
    this.color = 'purple';
    this.moveMent = [];
    // The side of the square of the bounding box which is affected by collision
    this.boundingBoxSize = 16;
  },
  /**
   * Array contraints a list of elements that cant be moved to
   */
  move : function(constraints, gameField) {
    this.position.add(this.getDirection());
    if (!Collisions.inside(this.exportShape(), gameField))
      this.position.add(this.getDirection().scale(-1));
    for (var i in constraints) {
      if (Collisions.inside(this.exportShape(), constraints[i]))
        this.position.add(this.getDirection().scale(-1));
    }
  },
  getDirection : function() {
    var direction = new Vector();
    for (i in this.moveMent) {
      direction.add(this.moveMent[i]);
    }
    direction.setLength(1);
    direction.scale(this.speed);
    return direction;
  },
  appendMovement : function(direction) {
    if (this.moveMent.indexOf(direction) === -1)
      this.moveMent.push(direction);
  },
  popMovement : function(direction) {
    var pos = this.moveMent.indexOf(direction);
    if (pos >= 0)
      this.moveMent.splice(pos, 1);
  },
  redraw : function(ctx, scene, gameField) {
    this.move(scene.houses, gameField);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 10, 0, 2 * Math.PI, false);
    ctx.stroke();
  },
  exportShape : function() {
    return new Circle(this.position, 10);
  }
});

var Bullet = PointVector.extend({
  init : function(position, direction) {
    this.shape = 'point';
    this.color = 'yellow';
    this.speed = 4;
    this._super(position, direction.scale(this.speed));
  },
  move : function() {
    this.position.add(this.direction);
  },
  redraw : function(ctx) {
    this.move();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 3, 0, 2 * Math.PI, false);
    ctx.fill();
  },
  exportShape : function() {
    return this.position;
  }
});

var Grenade = PointVector.extend({
  init : function(position, direction) {
    this.shape = 'point';
    this.color = 'darkgreen';
    this.speed = 4.0;
    this.friction = 0.1;
    this.exploding = false;
    this.radius = 5;
    this._super(position, direction.scale(this.speed));
  },
  move : function() {
    if (this.speed > 0 && this.exploding == false) {
      this.speed = Math.max(0, this.speed - this.friction);
      this.position.add(this.direction.setLength(this.speed));
    }
    else if (!this.exploding) {
      this.exploding = true;
      this.color = 'orange';
      this.radius = 100;
    }
    else {
      this.radius -= 3;
      this.radius = Math.max(0, this.radius);
    }
  },
  redraw : function(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    this.move();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();
  },
  exportShape : function() {
    if (this.exploding)
      return new Circle(this.position, this.radius);
    else
      return this.position;
  }
});

var SmokeGrenade = PointVector.extend({
  init : function(position, direction) {
    this.shape = 'point';
    this.color = 'white';
    this.speed = 4.0;
    this.friction = 0.1;
    this.emitting = false;
    this.radius = 5;
    this.clouds = [];
    this.cloudLifeTime = 3000; // Each cloud is alive for 5s
    this.cloudEmitInterval = 200; // One new cloud every 150ms
    this.cloudRadius = 5; // Cloud radius in px
    this.emitTime = 15000; // Emitting for 30 s
    this._super(position, direction.scale(this.speed));
  },
  move : function() {
    if (this.speed > 0 && this.emitting == false) {
      this.speed = Math.max(0, this.speed - this.friction);
      this.position.add(this.direction.setLength(this.speed));
    }
    else if (!this.emitting) {
      this.emitting = true;
      var self = this;
      var timer = setInterval(function() {
        
        // Emit new cloud
        var cloud = new Circle(self.position, self.cloudRadius);
        cloud.direction = new Vector(Math.random()-0.5, Math.random()-0.5);
        cloud.opacity = 0.95;
        self.clouds.push(cloud);

        // Remove cloud
        setTimeout(function() {
          self.clouds.shift();
        }, self.cloudLifeTime);
      }, self.cloudEmitInterval);
      
      // Stop emitting from this grenade
      setTimeout(function() {
        clearInterval(timer);
      }, self.emitTime);
    }
  },
  redraw : function(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    this.move();
    this.moveClouds();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
    this.drawClouds(ctx);
  },
  moveClouds : function() {
    for (var i in this.clouds) {
      this.clouds[i].position.add(this.clouds[i].direction);
      // Attenuate cloud
      this.clouds[i].radius += 1;
      this.clouds[i].opacity *= 0.98;
    }
  },
  drawClouds : function(ctx) {
    for (var i in this.clouds) {
      
      ctx.fillStyle = 'rgba(255, 255, 255, ' + this.clouds[i].opacity + ')';
      
      ctx.beginPath();
      ctx.arc(this.clouds[i].position.x, this.clouds[i].position.y, this.clouds[i].radius, 0, 2 * Math.PI, false);
      
      ctx.fill();
      ctx.closePath();
    }
  },
  exportShape : function() {
      return this.position;
  }
});

var Block = Rectangle.extend({
  shape : 'rectangle',
  redraw : function(ctx) {
    this.fill(ctx, 'green');
  },
  exportShape : function() {
    return this;
  }
});
