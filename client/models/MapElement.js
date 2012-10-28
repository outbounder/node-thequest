module.exports = Backbone.Model.extend({
  defaults:{
    height: null,
    width: null,
    color:null,
    x: null,
    y: null,
    z: null
  },
  remove:function(){
    this.trigger("remove");
    this.unbind();
  }
});