 /**
 * Vector represents mathematical/mechanical vector.
 */
var Dimensions = require("./Dimensions");


var buildNewVector = function (fn/*(value, enum)*/) {
  return Dimensions.reduce(Object.create(_proto), fn);
}

var _proto = (function () {
  var vector = {};
  
  vector.add = function(anotherVector) {
    var that = this;
    return buildNewVector(function (value, key) {
      value[key] = that[key] + anotherVector[key];
    });
  }
  
  vector.substract = function (anotherVector) {
    var that = this;
    return buildNewVector(function (value, key) {
      value[key] = that[key] - anotherVector[key];
    });
  }
  
  vector.revert = function () {
    var that = this;
    return buildNewVector(function (value, key) {
      value[key] = - that[key];
    });
  }
  
  vector.multiply = function (scalar) {
    var that = this;
    return buildNewVector(function (value, key) {
      value[key] = scalar * that[key];
    });
  }
  
  vector.abs = function () {
    var that = this;
    return buildNewVector(function (value, key) {
      value[key] = Math.abs(that[key]);
    });
  }
  
  vector.revertDim = function (dimension) {
    var that = this;
    return buildNewVector(function (value, key) {
      value[key] = (key === dimension) ? -that[key]: that[key];
    });
  }
  
  vector.equals = function(anotherVector) {
    var that = this;
    var result = !!anotherVector;
    Dimensions.each(function (dim) {
      result = result && (that[dim] === anotherVector[dim]);
    });
    return result;
  }

  vector.length = function(){
    var that = this;
    var result = 0;
    Dimensions.each(function(dim) {
      result += that[dim]*that[dim];
    });
    return Math.sqrt(result);
  }

  vector.unitVector = function(){
    return this.multiply(1/this.length());
  }
  
  vector.toString = function () {
    var that = this;
    return "Vector(" + 
      Dimensions.map(function (dim) {
        return dim + ": " + that[dim];
      }).join(", ") + 
      ")";
  }
  
  return vector;
}) ();

/**
 * Vectors are immutable, create is the only way to se their value
 * var v = Vector.create({x: 5, y: 10})
 */ 
var create = function (xy) {
  xy = xy || {};
  return buildNewVector(function (value, key) {
    value[key] = xy[key] || 0;
  });
};

module.exports = {
  "create": create
}