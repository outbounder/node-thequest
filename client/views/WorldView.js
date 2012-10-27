module.exports = WorldView = Backbone.View.extend({

    PlayerView:require("./PlayerView"),
    //TerrainView: require("./TerrainView"),

    collection:null,
    //terrainCollection

    width: null,
    height: null,
    zoom: 12,
    min_zoom:10,
    max_zoom:20,
    
    drag_mode: "navigate", //"selection", "select_area", "drag_object"
    offset:{
      left:null, 
      top:null
    },

    events:{
      "mousedown" : "drag",
      "mousewheel" : "changeZoom",
      "resize": "resize"
    },

    initialize: function(options){
      this.views = [];
      this.focus ={x:0,y:0};
      this.$el.css({'z-indx':'-10000'});
      this.updateDimensions();
     
      //Initializing the views
      //this.terrain = [];
      //this.terrain.push(new this.Terra)

      var self = this;
      this.collection.each(function(model){
        self.createView(model);
      });

      this.collection.on("add", function(model){
        self.createView(model);
      });

      this.collection.on("reset", this.reset, this);
    },

    reset: function(){
      this.views.forEach(function(view){
        view.remove();
      });
      this.views = [];
      this.$el.empty();
    },

    bindView:function(view){
      view.on("change", this.updateOne, this);
    },

    createView:function(model){
      var view = new this.PlayerView({
        model:model
      }).render();
      this.views.push(view);
      this.$el.append(view.$el);
      this.bindView(view);
      this.updateOne(view);
    },

    render: function(options){
      this.updateAll();
      return this;
    },

    updateAll: function(){
      var self = this;
      this.views.forEach(function(view){self.updateOne(view)});
      //this.terreain.forEach(function(item){

      //});
    },

    updateOne:function(view){
      view.$el.css(this.modelPointToScreen(view.model));
    },

    modelPointToScreen: function (model){
      width = 10*(model.get('width')/(this.zoom - model.get('z')));
      height = 10*(model.get('height')/(this.zoom - model.get('z')));

      var result = {
        "left":  (this.focus.x - model.get('x')) / (model.get('z') - this.zoom) + this.width/2 - width / 2,
        "top":  (this.focus.y - model.get('y')) / (model.get('z') - this.zoom) + this.height/2 - height / 2,
        "width": width,
        "height": height
      };
      return result;
    },

    changeZoom: function(event, delta){
      event.stopPropagation();
      this.zoom-=(delta*this.zoom/50);
      if(this.zoom<this.min_zoom) this.zoom = this.min_zoom;
      if(this.zoom>this.max_zoom) this.zoom = this.max_zoom;
      this.updateAll();
    },

    drag: function(event){
      switch(this.drag_mode){
        case "navigate":
          this.navigate(event); break;
        case "selection":
          this.selection(event); break;
        case "select_area":
          this.select_area(event); break;
        case "drag_object":
          this.drag_object(event); break;
      }
    },

    navigate : function(e){
      var that = this;
      var prevx = this.focus.x;
      var prevy = this.focus.y;
      WorldView.disableSelection();
      var x = e.pageX;
      var y = e.pageY;
      $("*").mousemove(function(e){
        //Drag arround
        var posx = x - e.pageX;
        var posy = y - e.pageY;
        that.focus.x = prevx+posx;
        that.focus.y = prevy+posy;
        that.updateAll();
      })
      .mouseup(function(){
        WorldView.enableSelection();
        //Disable mousemove and mouseup event from all elements
        $("*").unbind("mousemove");
        $("*").unbind("mouseup");
      });
    },

    resize: function(event){
      var oldSize = {width:this.width, height:this.height};
      var newSize = {width:this.$el.width(), height:this.$el.height()};
      var diff = {width:newSize.width/oldSize.width, height:newSize.height/oldSize.height};
      this.width = newSize.width;
      this.height = newSize.height;
      this.zoom /= newSize.width < newSize.height ? diff.width : diff.height;
      this.updateAll();
    },

    updateDimensions: function(){
      this.width = parseInt(this.$el.css("width").slice(0,-2));
      this.height = parseInt(this.$el.css("height").slice(0,-2));
      this.offset = this.$el.offset();
    },
    
  },

  //Static methods
  {

    //Translation from screen to model and from model to screen

    modelAreaToScreen: function(map, modelPoints){
      var result = [];
      modelPoints.forEach(function(point){
        result.push(Map.modelPointToScreen( map, point)); });
      return result;
    },

    screenPointToModel: function (map, screenPoint){
      return {
        x: screenPoint.x * map.zoom - map.width / 2 + map.focus.x,
        y: screenPoint.y * map.zoom + map.height / 2 + map.focus.y};
    },

    screenAreaToModel: function (map, screenPoint){
      var result = [];
      screenPoints.forEach(function(point){
        result.push(screenPointToModel(map, point)); });
      return redult;
    },

    disableSelection: function(){
      $("*").css({
       '-moz-user-select':'none',
       '-webkit-user-select':'none',
       'user-select':'none',
       '-ms-user-select':'none'})
      .attr('unselectable', 'on')
      .onselectstart = function(){return false;};
    },
    
    enableSelection: function(){
      $("*").css({
         '-moz-user-select':'auto',
         '-webkit-user-select':'auto',
         'user-select':'auto',
         '-ms-user-select':'auto'
        })
        .attr('unselectable', 'off')
        .onselectstart = function(){};
    }

  }
);
