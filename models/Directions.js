/**
 * An enum of the directions in the game
 */

var Enumify = require("../lib/enumify")
, Dimensions = require("./Dimensions");

var direction = function (dimension, way) {
  return {
    dimension: dimension
    , towards: way
  };
}

module.exports = new Enumify.object({
    left: direction(Dimensions.x, -1)
    , top: direction(Dimensions.y, -1)
    , right: direction(Dimensions.x, +1)
    , bottom: direction(Dimensions.y, +1)
});