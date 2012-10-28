module.exports = WorldView = Backbone.View.extend({

  PlayerView:require("./PlayerView"),

  collection:null,

  width: null,
  height: null,
  zoom: 1,
  
  initialize: function(options){
    this.views = [];
    
    var self = this;
    this.collection.each(function(model){
      self.createView(model);
    });

    this.collection.on("add", function(model){
      self.createView(model);
    });

    this.collection.on("reset", this.reset, this);
  },

  render: function(options){
    this.updateAll();
    return this;
  },

  reset: function(){
    this.views.forEach(function(view){
      view.remove();
    });
    this.views = [];
    this.$el.empty();
  },

  createView:function(model){
    var view = new this.PlayerView({model:model})
      .render()
      .on("change", this.updateOne, this);
    view.trigger("change", view);

    this.views.push(view);
    this.$el.append(view.$el);
  },

  updateAll: function(){
    var self = this;
    this.views.forEach(function(view){self.updateOne(view)});
    //this.terrain.forEach....
  },

  updateOne:function(view){
    view.$el.css(this.modelPointToScreen(view.model));
  },

  modelPointToScreen: function (model){
    var z = model.get('z')/64;
    var result = {
      "left":  -model.get('x') / (z - this.zoom),
      "top":  -model.get('y') / (z - this.zoom),
      "width": model.get('width')/(this.zoom - z),
      "height": model.get('height')/(this.zoom - z)
    };
    console.log(z);
    return result;
  }
});
