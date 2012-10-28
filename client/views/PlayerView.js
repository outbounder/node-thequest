module.exports = require("./View").extend({
  className: "player",
  coin: "<div class='coin'></div>",
  name:"<div class='name'></div>",
  turnLeft:{ 
    "-moz-transform": "scaleX(-1)",
    "-o-transform": "scaleX(-1)",
    "-webkit-transform": "scaleX(-1)",
    "transform": "scaleX(-1)"
  },
  turnRight:{
    "-moz-transform": "scaleX(1)",
    "-o-transform": "scaleX(1)",
    "-webkit-transform": "scaleX(1)",
    "transform": "scaleX(1)"
  },
  
  initialize:function(){
    this.model.on("change:x change:y change:z", this.render, this);
    this.model.on("change:hasTreasure", this.treasure, this);
    this.model.on("remove", this.remove, this);
    var name = $(this.name);
    name.html(this.model.get('username'));
    this.$el.append($(this.coin), name);
    this.treasure();
  },

  render: function(){
    var x = this.model.get("x");
    var prevx = this.model.previous("x");
    if(x!=prevx)
      x<prevx? this.$el.css(this.turnLeft) :this.$el.css(this.turnRight);
    
    this.trigger("change", this);
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
  }
});