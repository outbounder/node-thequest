module.exports = Backbone.View.extend({
  remove:function(){
    this.unbind();
    this.trigger("remove");
    this.$el.remove();
  }
});