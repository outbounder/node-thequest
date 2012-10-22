module.exports = function(data){
  _.extend(this, data);
  this.$el = $("<div></div>");
}

_.extend(module.exports.prototype, {
  render: function(){
    this.$el.html(this.username);
    this.$el.addClass("player");
    if(this.hasTreasure)
      this.$el.addClass("hasTreasure");
    else
      this.$el.removeClass("hasTreasure");
    this.$el.css({
      left: this.x,
      top: this.y
    });
    return this;
  },
  remove: function(){
    this.$el.remove();
  }
});