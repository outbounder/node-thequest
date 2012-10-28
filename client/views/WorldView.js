module.exports = WorldView = Backbone.View.extend({

  PlayerView:require("./PlayerView"),
  MapElementView:require("./MapElementView"),

  collection:null,
  mapCollection: null,

  width: null,
  height: null,
  zoom: 1,
  
  initialize: function(options){
    this.players = [];
    this.platforms = [];
    this.focus = {x:400,y:300};
    this.mapCollection = options.mapCollection;

    this.setViewDimensions();
    this.renderPlayers();
    
    var self = this;
    this.collection.on("add", function(model){
      var view = self.createView(model, self.PlayerView);
      self.players.push(view);
      view.on("remove", function(view){
        self.players.splice(self.players.indexOf(view), 1);
      });
    })
    .on("reset", this.reset, this);

    this.mapCollection.on("reset", this.renderMap, this);
  },

  render: function(){
    this.updateAll();
    return this;
  },

  renderMap: function(){
    var self = this;
    this.mapCollection.each(function(object){
      var view = self.createView(object, self.MapElementView);
      self.platforms.push(view);
      view.on("remove", function(view){
        self.platforms.splice(self.players.indexOf(view), 1);
      });
    });
  },

  renderPlayers: function(){
    var self = this;
    this.collection.each(function(model){
      var view = self.createView(model, self.PlayerView);
      self.players.push(view);
      view.on("remove", function(view){
        self.players.splice(self.players.indexOf(view), 1);
      });
    });
  },

  reset: function(){
    this.players.forEach(function(view){
      view.remove();
    });
    this.players = [];
  },

  createView:function(model, viewPrototype){
    var view = new viewPrototype({model:model})
      .render()
      .on("change", this.updateOne, this);
    this.updateOne(view);
    this.$el.append(view.$el);
    return view;
  },

  updateAll: function(){
    var self = this;
    this.players.forEach(function(view){self.updateOne(view)});
    this.platforms.forEach(function(view){self.updateOne(view)});
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
      "height": height,
      "z-index": Math.round(z*100)
    };
  },

  setViewDimensions: function(){
      this.width = parseInt(this.$el.css("width").slice(0,-2));
      this.height = parseInt(this.$el.css("height").slice(0,-2));
      this.offset = this.$el.offset();
    },
});
