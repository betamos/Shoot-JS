

/**
 * POINT
 */
var Point = Class.extend({
  init : function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  },
  // Return distance from this point to another point
  distanceTo : function(p) {
    return Math.sqrt(Math.pow(p.x - this.x, 2) + Math.pow(p.y - this.y, 2));
  }
});



/**
 * VECTOR
 */
var Vector = Class.extend({
  /**
   * Construct the vector
   * 
   * @param float x
   * @param float y
   */
  init : function(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  },
  angle : function() {
    // Determine which quadrant the end point is in, if start point is origo
    var quadrant;
    if (this.y >= 0 && this.x >= 0)
      quadrant = 1;
    else if (this.y >= 0 && this.x < 0)
      quadrant = 2;
    else if (this.y < 0 && this.x < 0)
      quadrant = 3;
    else if (this.y < 0 && this.x >= 0)
      quadrant = 4;
    
    // The angle in the first quadrant, when x and y are positive
    var theta = Math.atan(Math.abs(this.y) / Math.abs(this.x));
    
    switch (quadrant) {
      case 1:
      return theta;
      case 2:
      return Math.PI - theta;
      case 3:
      return Math.PI + theta;
      case 4:
      return Math.PI * 2 - theta;
    }
  },
  norm : function() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  },
  // Give the vector a new angle. It will preserve the norm
  newAngle : function(angle) {
    var d = this.norm();
    this.x = Math.cos(angle) * d;
    this.y = Math.sin(angle) * d;
    return this;
  },
  scale : function(lambda) {
    this.x *= lambda;
    this.y *= lambda;
    return this;
  },
  add : function(vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  },
  setLength : function(length) {
    var norm = this.norm();
    // Don't affect the zero vector
    if (norm === 0)
      return this;
    this.x = this.x * length / norm;
    this.y = this.y * length / norm;
    return this;
  },
  clone : function() {
    return new Vector(this.x, this.y);
  }
});



/**
 * POINTVECTOR
 */
var PointVector = Class.extend({
  /**
   * Combination between point and vector. E.g. for a photon or a line
   * 
   * @param Point point
   * @param Vector vector
   */
  init : function(position, direction) {
    this.position = new Vector(position.x, position.y);
    this.direction = new Vector(direction.x, direction.y);
  }
});

var Rectangle = Class.extend({
  init : function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  },
  fill : function(ctx, color) {
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  },
});

var Circle = Class.extend({
  init : function(center, radius) {
    this.position = center.clone();
    this.radius = radius;
  },
});

/**
 * Collision library
 */

var Collisions = {
  // Vector point, Rectangle rect
  pointInRectangle : function(point, rect) {
    if (point instanceof Vector && rect instanceof Rectangle)
      //x,y are the point, l,r,b,t are the extents of the rectangle
      return point.x > rect.x && point.x < rect.x + rect.width && point.y > rect.y && point.y < rect.y + rect.height;
    else
      console.error('Type error!');
  },
  /**
   * @param Rectangle r1 The first rectangle
   * @param Rectangle r2 The other rectangle
   * @return true if the rectangles intersects, false otherwise
   */
  rectIntersectsRect : function(r1, r2) {
    return !(
      r1.x > r2.x + r2.width || r1.x + r1.width < r2.x ||
      r1.y + r1.height < r2.y || r1.y > r2.y + r2.height
    );
  },
  pointIntersectsCircle : function(point, circle) {
    var distance = point.clone().add(circle.position.clone().scale(-1)).norm();
    if (distance < circle.radius)
      return true;
    else
      return false;
  },
  circleIntersectsCircle : function(c1, c2) {
    var distance = c1.position.clone().add(c2.position.clone().scale(-1)).norm();
    if (distance < Math.max(c1.radius, c2.radius))
      return true;
    else
      return false;
  },
  /**
   * TEMPORARY: Treats circle as a point
   */
  circleIntersectsRectangle : function(circle, rect) {
    //x,y are the point, l,r,b,t are the extents of the rectangle
    var point = circle.position;
    return point.x > rect.x && point.x < rect.x + rect.width && point.y > rect.y && point.y < rect.y + rect.height;
  },
  /**
   * Check if they collide.
   * Thumb rule: Complexity of object1 <= object2 e.g. a point is less complex than a circle
   */
  inside : function(object1, object2) {
    if (object1 instanceof Vector && object2 instanceof Rectangle)
      return this.pointInRectangle(object1, object2);
    else if (object1 instanceof Rectangle && object2 instanceof Rectangle)
      return this.rectIntersectsRect(object1, object2);
    else if (object1 instanceof Vector && object2 instanceof Circle)
      return this.pointIntersectsCircle(object1, object2);
    else if (object1 instanceof Circle && object2 instanceof Circle)
      return this.circleIntersectsCircle(object1, object2);
    else if (object1 instanceof Circle && object2 instanceof Rectangle)
      return this.circleIntersectsRectangle(object1, object2);
  },
  observedObjects : [],
  /**
   * Start detecting collisions
   */
  startDetect : function(array1, array2, callback) {
    this.observedObjects.push({
      array1 : array1,
      array2 : array2,
      callback : callback
    });
  },
  runDetections : function() {
    for (var i in this.observedObjects) {
      // Now we have two arrays
      // Easy access: array1, array2, callback
      with (this.observedObjects[i]) {
        // We iterate over the first array
        for (var j = array1.length-1; j >= 0; j--) {
          var o1 = array1[j];
          // And over the second
          for (var k = array2.length-1; k >= 0; k--) {
            var o2 = array2[k];
            // If these two objects collides
            if (this.inside(o1.exportShape(), o2.exportShape())) {
              // The user defined callback
              callback(o1, o2);
            }
          }
        }
      }
    }
  }
};

/**
 * 
  collision : function() {
    for (var i = this.collisions.length-1; i >= 0; i--) {
      var position = this.collisions[i].object.position;
      if (window.Collisions.inside(position.x, position.y, this.top, this.right, this.bottom, this.left)) {
        this.collisions.splice(i, 1);
        console.log('collision');
      }
    }
  },
 */
