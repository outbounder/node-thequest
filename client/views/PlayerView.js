module.exports = Backbone.View.extend({
  className: "player",
  coin: "<div class='coin'></div>",
  
  initialize:function(){
    this.model.on("change:x change:y change:z", this.move, this);
    this.model.on("change:hasTreasure", this.treasure, this);
    this.$el.append($(this.coin));
  },

  render: function(){
    this.model.change();
    return this;
  },

  move:function(){
    this.trigger("change", this);
  },

  treasure: function(model){
    model.get("hasTreasure")?
      this.$(".coin").show():
      this.$(".coin").hide();
  },


  remove:function(){
    this.model.unbind();
    this.$el.remove();
    //this.trigger("removed");
    return this;
  }
});