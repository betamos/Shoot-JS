

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
    this.x = this.x * length / norm;
    this.y = this.y * length / norm;
  },
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
  init : function(point, vector) {
    this.point = point;
    this.vector = vector;
  }
});
