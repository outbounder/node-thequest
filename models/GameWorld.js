var _ = require("underscore");

var rand = function(LowerRange, UpperRange){
  return Math.floor(Math.random() * (UpperRange - LowerRange + 1)) + LowerRange;
}

var applyGameRules = function (players) {
  //TODO: use forEach... in next revision :)
  var i, j;
  for (i = 0; i < players.length; i ++) {
    players[i].update();
  }
  for (i = 0; i < players.length; i ++) {
    var pl = players[i];
    pl.handleGameAreaCollisions({left: 0, top: 0, right: 800, bottom: 600})
    for(j = 0; j < players.length; j ++) {
      pl.handlePlayerCollisions(players[j]);
    }
  }
}

module.exports = function(io){
  this.players = [];
  this.io = io;
  
  var that = this;
  
  var gameCycle = function(){
    applyGameRules(that.players);
    that.broadcast("updateGame", that.getGameState());
    /* 
     * Use Timeout instead of Interval to ensure that the computer has its time to finish calculations. 
     * Using setInterval can lead to multiple gameCycle invokation waiting in the queue for execution 
     * and lead to possible errors when working with non-block operations
     */
    setTimeout(gameCycle, 20); 
  };
  
  //init:
  gameCycle();
}

_.extend(module.exports.prototype, {
  players: null,
  width: 800, // px
  height: 600, // px
  timeLeft: 0, // sec
  gameDuration: 30, // sec
  gameTickInterval: 1000, // milis
  
  broadcast: function (message, data) {
    this.io.sockets.emit(message, data);
  },
  getPlayerByUsername: function(username) {
    return _.find(this.players, function(p){ return p.state.username == username});
  },

  addPlayer: function(player) {

    this.players.push(player);
    var state = player.state;
    state.x = rand(0, this.width);
    state.y = rand(0, this.height);
    state.z = 1;
    if(this.players.length == 1)//this is the first player
      state.hasTreasure = true;
    this.broadcast("addPlayer", state);
  },
  removePlayer: function(player) {
    this.players.splice(this.players.indexOf(player), 1);
    
    var state = player.state;
    this.broadcast("removePlayer", state);
    if(state.hasTreasure && this.players.length > 0) {
      state.hasTreasure = false;
      p = this.players[rand(0,this.players.length-1)];
      p.state.hasTreasure = true;
      this.broadcast("treasureTrapped", p.state);
    }
  },
  restart: function(){
    if(this.gameIntervalId)
      clearInterval(this.gameIntervalId);

    var self = this;
    this.gameIntervalId = setInterval(function(){
      self.timeLeft -= 1;
      if(self.timeLeft < 0)
        self.restart();
      else
        self.broadcast("timeLeft", self.timeLeft);
    }, this.gameTickInterval);

    this.timeLeft = this.gameDuration;
    this.players = [];
    this.broadcast("restart");
    this.broadcast("timeLeft", this.timeLeft);
  },
  getGameState: function () {
    var gameState = {
      players: []
    };
    
    for (var i = 0; i < this.players.length; i ++) {
      gameState.players.push(this.players[i].state);
    }
    
    return gameState;
  }
});