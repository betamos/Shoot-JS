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
  },
  move : function() {
    var direction = new Vector();
    for (i in this.moveMent) {
      direction.add(this.moveMent[i]);
    }
    direction.setLength(1);
    direction.scale(this.speed);
    this.position.add(direction);
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
  redraw : function(ctx) {
    this.move();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 5, 0, 2 * Math.PI, false);
    ctx.stroke();
  }
});

var Bullet = PointVector.extend({
  init : function(position, direction) {
    this.shape = 'point';
    this.color = 'yellow';
    this._super(position, direction);
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

var Block = Rectangle.extend({
  shape : 'rectangle',
  redraw : function(ctx) {
    ctx.fillStyle = 'green';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  },
  exportShape : function() {
    return this;
  }
});