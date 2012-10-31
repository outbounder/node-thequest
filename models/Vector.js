/**
 * Vector represents mathematical/mechanical vector.
 */
var Dimensions = require("./Dimensions");

/**
 * Vectors are immutable, create is the only way to se their value
 * var v = Vector.create({x: 5, y: 10})
 */ 
var create = function (xy) {
  xy = xy || {};
  var vector = Dimensions.reduce({}, function (vector, key) {
    vector[key] = xy[key] || 0;
  });
  
  var buildNewVector = function (fn/*(value, enum)*/) {
    var value = {}
    Dimensions.reduce(value, fn);
    return create(value);
  }
  
  vector.add = function(anotherVector) {
    return buildNewVector(function (value, key) {
      value[key] = vector[key] + anotherVector[key];
    });
  }
  
  vector.substract = function (anotherVector) {
    return buildNewVector(function (value, key) {
      value[key] = vector[key] - anotherVector[key];
    });
  }
  
  vector.revert = function () {
    return buildNewVector(function (value, key) {
      value[key] = - vector[key];
    });
  }
  
  vector.multiply = function (scalar) {
    return buildNewVector(function (value, key) {
      value[key] = scalar * vector[key];
    });
  }
  
  vector.abs = function () {
    return buildNewVector(function (value, key) {
      value[key] = Math.abs(vector[key]);
    });
  }
  
  vector.revertDim = function (dimension) {
    return buildNewVector(function (value, key) {
      value[key] = (key === dimension) ? -vector[key]: vector[key];
    });
  }
  
  vector.equals = function(anotherVector) {
    var result = !!anotherVector;
    Dimensions.each(function (dim) {
      result = result && (vector[dim] === anotherVector[dim]);
    });
    return result;
  }
  
  vector.toString = function () {
    return "Vector(" + 
      Dimensions.map(function (dim) {
        return dim + ": " + vector[dim];
      }).join(", ") + 
      ")";
  }
  
  return Object.freeze(vector);
};

module.exports = {
  "create": create
}