module.exports = Backbone.View.extend({
  template: require("./ChooseAvatarDialog.jade"),
  events: {
    "click a.avatar": "selectAvatar"
  },
  render: function(){
    var self = this;
    this.$el.html(this.template({
      players: ["0.png", "1.png", "2.png", "3.png", "4.png", "5.gif", "6.gif", "7.png", "8.png", "9.gif"]
    }));
    this.$el.bPopup({
      modalClose: false
    }).center();
  },
  selectAvatar: function(e){
    var avatarType = $(e.currentTarget).attr("data-file").split(".")[0];
    this.$el.bPopup().close();
    this.trigger("confirm", avatarType);
  }
});