module.exports = function(data){
  _.extend(this, data);
  this.$el = $("<div><img id='avatar' /><div class='name'></div><div class='coin'></div></div>");
  this.$el.find("#avatar").attr("src", this.getAvatarUrl());
}

_.extend(module.exports.prototype, {
  getAvatarUrl : function(){
    var path = "/images/players/"+this.avatar;
    switch(this.avatar) {
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "7":
      case "8":
      case "10":
      case "11":
        return path+".png";
      case "5":
      case "6":
      case "9":
        return path+".gif";
    }
  },
  render: function(){
    this.$el.find(".name").html(this.username);
    this.$el.addClass("player");
    
    if(this.hasTreasure)
      this.$el.find(".coin").show();
    else
      this.$el.find(".coin").hide();

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