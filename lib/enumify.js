/**
 * This library makes enums in javascript... to lazy for more details - read the code
 * Usage: 
 * var Enumify = require("enumify");
 * See each method for details if its usage
 */
var _ = require("underscore")
, makeElement = function (name, index) {
  return {
    enumindex: index
    , toString: function () {
      return name;
    }
  };
};

var addMethods = function (enumObj) {
  Object.defineProperty(enumObj, "reduce", {
    value: function (accumulator, fn) {
      for (var key in enumObj) {
        fn (accumulator, enumObj[key]);
      }
      return accumulator;
    }
    , enumerable: false //only enum elements should be listable
  });
  
  Object.defineProperty(enumObj, "each", {
    value: function (fn) {
      for (var key in enumObj) {
        fn (enumObj[key]);
      }
    }
    , enumerable: false //only enum elements should be listable
  });
  
  Object.defineProperty(enumObj, "enumMap", {
    value: function (defaultValue) {
      var map = {}
      for (var key in enumObj) {
        map[key] = defaultValue;
      }
      return map;
    }
    , enumerable: false //only enum elements should be listable
  });
  
  Object.defineProperty(enumObj, "map", {
    value: function (fn) {
      var result = [];
      for (var key in enumObj) {
        result.push(fn (enumObj[key]));
      }
      return result;
    }
    , enumerable: false //only enum elements should be listable
  });
}

module.exports = {
  /**
   * Usage: 
   * Enumify.object({
   * red: { de: "rot" }
   * , green: {}
   * , blue: {}
   * });
   */
  "object": function (obj) {
    var enumObj = {}
    , value
    , elem
    , i = 0;
    
    for (key in obj) {
      elem = makeElement(key, i++);
      
      value = obj[key];
      
      if (typeof value === "object") {
        _.extend(elem, value)
      } else {
        elem.value = value;
      }
      
      enumObj[key] = Object.freeze(elem);
    }
    
    addMethods(enumObj);
    
    return Object.freeze(enumObj);
  }
  /**
   * Usage: 
   * Enumify.string("red, green, blue");
   */
  , "string": function (str) {
    var simple = {};
    
    str.split(",").forEach(function (e) {
      var key = e.trim();
      if (key)
        simple[key] = {};
    });
    
    return this.object(simple);
  }
}