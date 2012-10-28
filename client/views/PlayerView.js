module.exports = Backbone.View.extend({
  className: "player",
  coin: "<div class='coin'></div>",
  name:"<div class='name'></div>",
  
  initialize:function(){
    this.model.on("change:x change:y change:z", this.move, this);
    this.model.on("change:hasTreasure", this.treasure, this);
    var name = $(this.name);
    name.html(this.model.get('username'));
    this.$el.append($(this.coin), name);
    this.treasure();
  },

  render: function(){
    this.model.change();
    return this;
  },

  move:function(){
    this.trigger("change", this);
  },

  treasure: function(){
    if (this.model.get("hasTreasure"))
      this.$(".coin").show();
    else
      this.$(".coin").hide();
  },

  remove:function(){
    this.model.unbind();
    this.$el.remove();
    //this.trigger("removed");
    return this;
  }
});