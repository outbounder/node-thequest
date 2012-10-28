module.exports = require("./View").extend({
  className: "mapElement",

  initialize: function(){
    this.$el.css("background-color", this.model.get('color'));
  }
});