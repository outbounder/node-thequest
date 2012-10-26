module.exports = function(data){
  _.extend(this, data);
  this.$el = $("<div><div class='name'></div><div class='coin'></div></div>");
}

_.extend(module.exports.prototype, {
  render: function(){
    this.$el.find(".name").html(this.username);
    this.$el.addClass("player");
    
    if(this.hasTreasure)
      this.$el.find(".coin").show();//addClass("hasTreasure");
    else
      this.$el.find(".coin").hide();//this.$el.removeClass("hasTreasure");

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