/**
 * test vector functionality
 */
describe("Vector", function(){
  var Vector = require("../models/Vector")
  , Dimensions = require("../models/Dimensions");

  it("has x and y params (as long as Dimensions has them)", function(){
    var vector = Vector.create({x: 5, y: -2});
    expect(vector.x).toBe(5);
    expect(vector.y).toBe(-2);
  });

  it("adds two vectors", function(){
    var a = Vector.create({x: 5, y: -2});
    var b = Vector.create({ x: 7, y: 8 });
    var c = a.add(b);
    expect(c.x).toBe(12);
    expect(c.y).toBe(6);
  })
  
  it("substracts two vectors", function(){
    var a = Vector.create({x: 5, y: -2});
    var b = Vector.create({ x: 7, y: 8 });
    var c = a.substract(b);
    expect(c.x).toBe(-2);
    expect(c.y).toBe(-10);
  })
  
  it("multiplies vectors by scalar", function(){
    var a = Vector.create({x: 5, y: -2});
    var c = a.multiply(3);
    expect(c.x).toBe(15);
    expect(c.y).toBe(-6);
  })

  it("reverses a vector", function(){
    var a = Vector.create({x: 5, y: -2});
    var c = a.revert();
    expect(c.x).toBe(-5);
    expect(c.y).toBe(2);
  })
  
  it("absolutes the dimensions of a vector", function(){
    var a = Vector.create({x: 5, y: -2});
    var c = a.abs();
    expect(c.x).toBe(5);
    expect(c.y).toBe(2);
  })
  
  it("reverts only a single dimension", function(){
    var a = Vector.create({x: 5, y: -2});
    var c = a.revertDim(Dimensions.x);
    expect(c.x).toBe(-5);
    expect(c.y).toBe(-2);
  })
  
  it("checks equality between vectors", function(){
    var a = Vector.create({x: 5, y: -2});
    var b = Vector.create({x: 5, y: -2});
    var c = Vector.create({x: 4, y: 4});
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  })
  
  it("provides meaningful toString", function(){
    var a = Vector.create({x: 5, y: -2});
    var expected = "Vector(x: 5, y: -2)";
    expect(a.toString()).toBe(expected);
  }) 
});