module.exports = Backbone.View.extend({
  className: "player",
  
  initialize:function(){
    this.model.on("change", function(){
      this.render();
      this.trigger("change", this);
    }, this);
  },

  render: function(){
    if(this.model.get("hasTreasure"))
      this.$el.append($("<div class='coin'></div>"));
    else
      this.$(".coin").remove();
    return this;
  },

  remove:function(){
    this.model.unbind();
    this.$el.remove();
    //this.trigger("removed");
    return this;
  }
});