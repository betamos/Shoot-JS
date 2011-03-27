/**
 * @author Didrik Nordström
 */

var Timer = Class.extend({
  init : function() {
    this.active = false;
  },
  start : function() {
    if (this.active)
      console.warn('Starting already active timer.');
    this.active = true;
    this.startTime = new Date().getMilliseconds();
  },
  stop : function() {
    if (this.active === false)
      console.warn('Trying to stop inactive timer');
    this.stopTime = new Date().getMilliseconds();
    this.active = false;
  },
  getTime : function() {
    if (this.active)
      return new Date().getMilliseconds() - this.startTime;
    else
      return this.stopTime - this.startTime;
  },
  reset : function() {
    if (this.active)
      console.warn('Trying to reset active timer.');
    this.startTime = 0;
    this.stopTime = 0;
    this.steps = [];
  }
});

var removeArrayObject = function(arr, obj) {
  var pos = arr.indexOf(obj);
  if (pos >= 0) {
    arr.splice(pos, 1);
    return true;
  }
  else
    return false;
};
