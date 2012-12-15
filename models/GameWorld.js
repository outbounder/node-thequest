var _ = require("underscore");
var Dimensions = require("./Dimensions");
var Vector = require("./Vector");
var DIMENSIONS = Vector.create({x: 32, y: 32});

var rand = function(LowerRange, UpperRange){
  return Math.floor(Math.random() * (UpperRange - LowerRange + 1)) + LowerRange;
}

var timestamp = function () {
  return new Date().getTime();
}

module.exports = function(duration){
  this.players = [];
  this.endTime = duration + timestamp();
  var that = this;
  this.running = true;
  var collisions = [];
  var collisionsMap = [];
  
  that.applyGameRules = function () {
    collisions = [];
    collisionsMap = [];

    var players = that.players;
    for (var i = players.length - 1; i >= 0; i--) {
      players[i].update();
    };
    
    for (var i = players.length - 1; i >= 0; i--) {
      var player = players[i];
      player.handleGameAreaCollisions({left: 0, top: 0, right: that.width, bottom: that.height});
      
      // find collisions
      for (var k = players.length - 1; k >= 0; k--) {
        if(players[k] === player) continue;
        if(player.isColliding(players[k]) && !collisionsMap[i+k]) {
          collisions.push([player, players[k]]);
          collisionsMap[i+k] = true;
        }
      };
    };

    // resolve collisions
    for(var c = 0; c<collisions.length; c++) {
      var p1 = collisions[c][0];
      var p2 = collisions[c][1];
      tmp = p1.hasTreasure;
      p1.hasTreasure = p2.hasTreasure;
      p2.hasTreasure = tmp;
      
      var p1speed = p1.speed;
      var p2speed = p2.speed;
      var speedDiff = p2speed.substract(p1speed);
      var force = speedDiff.unitVector().multiply(64);

      p1.speed = p2speed.add(force).multiply(0.5);
      p2.speed = p1speed.add(force).multiply(-0.5);
    }
  }
  
  that.updateGame = function () {
    if(this.running == false) return;

    that.applyGameRules();
    this.timeLeft = Math.floor((this.endTime - timestamp()) / 1000);
    that.broadcast("updateGame", that.getGameState());
  };
  
}

_.extend(module.exports.prototype, {
  players: null,
  width: 800, // px
  height: 600, // px
  timeLeft: 0, // sec
  gameDuration: 30, // sec
  gameTickInterval: 1000, // milis
  
  broadcast: function (message, data) {
    data = (typeof data !== "undefined")? data: {};
    this.players.forEach(function (pl) {
      pl[message](data);
    });
    //for (var i = this.players.length - 1; i >= 0; i--) {
    //  this.players[i].socket.emit(message, data);
    //};
  },

  addPlayer: function(player) {
    player.init(this.players.length == 0);
    this.broadcast("addPlayer", player.state);
    this.players.push(player);
  },
  removePlayer: function(player) {
    this.players.splice(this.players.indexOf(player), 1);
    
    this.broadcast("removePlayer", player.state);
    if(player.hasTreasure && this.players.length > 0) {
      this.giveNewTreasure();
    }
  },
  giveNewTreasure: function () {
    var p = this.players[rand(0,this.players.length-1)];
    p.hasTreasure = true;
    this.broadcast("treasureTrapped", p.state);
  },
  pause: function(){
    this.running = false;
  },
  restart: function () {
    this.broadcast("restart");
  },
  getGameState: function () {
    var gameState = {
      players: [],
      timeLeft: this.timeLeft
    };
    
    for (var i = 0; i < this.players.length; i ++) {
      gameState.players.push(this.players[i].state);
    }
    
    return gameState;
  },
  declareWinner: function () {
    this.players.forEach(function (pl) {
      pl.endgame(pl.hasTreasure);
    });
  }
});