module.exports = Backbone.Model.extend({
  idAttribute:"username",
  defaults:{
    hasTreasure: null,
    username: null,
    height: null,
    width: null,
    x: null,
    y: null,
    z: 1
  }
});