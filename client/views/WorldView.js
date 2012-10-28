module.exports = WorldView = Backbone.View.extend({

  PlayerView:require("./PlayerView"),

  collection:null,

  width: null,
  height: null,
  zoom: 1,
  
  initialize: function(options){
    this.views = [];
    this.setViewDimensions();
    this.focus = {x:400,y:300};
    
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
    var dimensions = this.modelPointToScreen(view.model);
    view.$el.css(dimensions);
    view.$(".coin").css({"width":dimensions["width"], "height":dimensions["height"]})
  },

  modelPointToScreen: function (model){
    var z = model.get('z')/64;
    var width = model.get('width')/(this.zoom - z);
    var height =  model.get('height')/(this.zoom - z);
    return {
      "left":  this.width+model.get('width')/2+((this.focus.x-model.get('x')) / (z - this.zoom) - this.width/2 - width / 2),
      "top":  this.height+model.get('height')/2+((this.focus.y-model.get('y')) / (z - this.zoom) - this.height/2 - height / 2),
      "width": width,
      "height": height
    };
  },

  setViewDimensions: function(){
      this.width = parseInt(this.$el.css("width").slice(0,-2));
      this.height = parseInt(this.$el.css("height").slice(0,-2));
      this.offset = this.$el.offset();
    },
});
