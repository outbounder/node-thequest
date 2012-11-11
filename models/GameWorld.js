var _ = require("underscore");


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
  
  
  that.applyGameRules = function () {
    var players = that.players;
    players.forEach(function (player) {
      player.update();
    });
    
    players.forEach(function (player) {
      player.handleGameAreaCollisions({left: 0, top: 0, right: that.width, bottom: that.height});
      players.forEach(function (anotherPlayer) {
	if (player !== anotherPlayer) {
	  player.handlePlayerCollisions(anotherPlayer);
	}
      });
    });
    
  }
  
  that.updateGame = function () {
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