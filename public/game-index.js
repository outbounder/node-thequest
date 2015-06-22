(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = Backbone.Collection.extend({
  model:require("../models/MapElement"),
});
},{"../models/MapElement":4}],2:[function(require,module,exports){
module.exports = Backbone.Collection.extend({
  model:require("../models/Player"),
});
},{"../models/Player":5}],3:[function(require,module,exports){
var socket = io.connect();
var PlayersCollection = require("./collections/PlayersCollection");
var players = new PlayersCollection();



var Map = require("./collections/MapCollection");
var map = new Map();

var WorldView = require("./views/WorldView");
var World = new WorldView({
  el:".gameWorld",
  collection: players,
  mapCollection: map
}).render();



var direction = function (e) {
  var dir = "";
  
  if(e.keyCode == 37)
    dir = "left"
  if(e.keyCode == 39)
    dir = "right";
  if(e.keyCode == 40)
    dir = "bottom";
  if(e.keyCode == 38)
    dir = "top";
  if(e.keyCode == 32)
    dir = "jump";
  
  return dir;
};

var movePlayer = function(playerData){
  players.get(playerData.username).set(playerData);
};

//Adding dummy bottom and platform
World.mapCollection.reset([
  {
    height: 600,
    width: 800,
    color:"green",
    x: 0,
    y: 0,
    z: 0
  },
  {
    height: 100,
    width: 100,
    color:"grey",
    x: 200,
    y: 200,
    z: 2
  },
]);


socket.on("map", function(map){
  world.mapCollection = new MapCollection(map); 
})

.on('visitorsOnline', function (data) {
  $(".visitorsCount").html(data); 
})

.on("timeLeft", function(timeLeft){
  $(".timeLeft").html("Time left:"+timeLeft); 
})

.on("connect", function(){
  socket.emit("addPlayer");
})

.on("addPlayer", function(playerData){
    World.collection.add(playerData); 
})

.on("players", function(gameState){
  var playersData = gameState.players;
  var l = playersData.length;
  for(var i = 0; i<l; i++)
    players.add(playersData[i]);
})

.on("removePlayer", function(playerData){
  players.remove(playerData.username);
})

.on("movePlayer", function(playerData){
  var player = players.get(playerData.username);
  if(player)
    players.get(playerData.username).set(playerData);
  else
    throw new Error("Can't find player "+player.username);
})

.on("updateGame", function (gameState) {
  //expect playerStates to be an array
  for (var i = 0; i < gameState.players.length; i ++) {
    var player = gameState.players[i];
    players.add(player, {merge: true});
    players.get(player.username).set(player);
  }
})

.on("treasureTrapped", function(p1Data, p2Data){
  players.get(p1Data).set(p1Data);
  if(p2Data)
    players.get(p2Data).set(p2Data);
})

.on("restart", function(){
  players.reset();
  socket.emit("addPlayer");
});


$(window).on("keydown", function(e){
  var dir = direction(e);
  dir !== "" ? socket.emit("directionChange", true, direction(e)) : false;
});

$(window).on("keyup", function(e){
  var dir = direction(e);
  dir !== "" ? socket.emit("directionChange", false, direction(e)) : false;
});

},{"./collections/MapCollection":1,"./collections/PlayersCollection":2,"./views/WorldView":9}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
module.exports = Backbone.Model.extend({

  idAttribute: "username",

  defaults:{
    hasTreasure: null,
    username: null,
    height: null,
    width: null,
    x: null,
    y: null,
    z: null
  },

  remove:function(){
    this.trigger("remove");
    this.unbind();
  }
});

},{}],6:[function(require,module,exports){
module.exports = require("./View").extend({
  className: "mapElement",

  initialize: function(){
    this.$el.css("background-color", this.model.get('color'));
  }
});
},{"./View":8}],7:[function(require,module,exports){
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
},{"./View":8}],8:[function(require,module,exports){
module.exports = Backbone.View.extend({
  remove:function(){
    this.unbind();
    this.trigger("remove");
    this.$el.remove();
  }
});
},{}],9:[function(require,module,exports){
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

},{"./MapElementView":6,"./PlayerView":7}]},{},[3]);
