var _ = require("underscore");

var rand = function(LowerRange, UpperRange){
  return Math.floor(Math.random() * (UpperRange - LowerRange + 1)) + LowerRange;
}

module.exports = function(io){
  this.players = [];
  this.io = io;
}

_.extend(module.exports.prototype, {
  players: null,
  width: 800, // px
  height: 600, // px
  timeLeft: 0, // sec
  gameDuration: 30, // sec
  gameTickInterval: 1000, // milis
  treasuerTimeoutLeft: 0, //milis
  treasuerTimeout: 1, //sec
  treasuerTimeoutInterval: 1000, // milis
  treasureLocked: false,


  getPlayerByUsername: function(username) {
    return _.find(this.players, function(p){ return p.username == username});
  },

  addPlayer: function(player) {
    player.x = rand(0, this.width);
    player.y = rand(0, this.height);
    while(this.checkCollision(player)) {
      player.x = rand(0, this.width);
      player.y = rand(0, this.height);
    }
    if(this.players.length == 0)
      player.hasTreasure = true;
    this.players.push(player);
    this.io.sockets.emit("addPlayer", player);
  },
  removePlayer: function(player) {
    this.players.splice(this.players.indexOf(player), 1);
    this.io.sockets.emit("removePlayer", player);
    if(player.hasTreasure && this.players.length > 0) {
      player.hasTreasure = false;
      p = this.players[rand(0,this.players.length-1)];
      p.hasTreasure = true;
      this.io.sockets.emit("treasureTrapped", p);
    }
  },
  movePlayer: function(player, dx, dy) {
    player.x += dx;
    player.y += dy;
    var p = this.checkCollision(player);
    if(p) {
      player.x -= dx;
      player.y -= dy;
      if((p.hasTreasure || player.hasTreasure) && !this.treasureLocked ) {
        player.hasTreasure = !player.hasTreasure;
        p.hasTreasure = !p.hasTreasure;
        this.io.sockets.emit("treasureTrapped", p, player);
        this.getTreasureTimeout();        
      }
    }
    this.io.sockets.emit("movePlayer", player);
  },
  checkCollision: function(player) {
    var playerRight = player.x+player.width;
    var playerBottom = player.y+player.height;

    for(var i = 0; i<this.players.length; i++) {
      if(player.username == this.players[i].username) continue;
      var p = this.players[i];
      var pRight = p.x+p.width;
      var pBottom = p.y+p.height;
      if(

        (p.x >= player.x && p.x <= playerRight && 
        p.y >= player.y && p.y <= playerBottom) || 

        (pRight >= player.x && pRight <= playerRight && 
        p.y >= player.y && p.y <= playerBottom) ||

        (pRight >= player.x && pRight <= playerRight && 
        pBottom >= player.y && pBottom <= playerBottom) ||
        
        (p.x > player.x && p.x < playerRight && 
        pBottom >= player.y && pBottom <= playerBottom)
      )
        return p;
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
        self.io.sockets.emit("timeLeft", self.timeLeft);
    }, this.gameTickInterval);

    this.timeLeft = this.gameDuration;
    this.players = [];
    this.io.sockets.emit("restart");
    this.io.sockets.emit("timeLeft", this.timeLeft);
  },
  getTreasureTimeout: function(){
    if(this.treasureIntervalId)
      clearInterval(this.treasureIntervalId);

    var self = this;
    self.treasureLocked = true;
    self.io.sockets.emit("treasureLocked", self.treasureLocked);    
    this.treasureIntervalId = setInterval(function(){
      self.treasuerTimeoutLeft -= 1;
      if(self.treasuerTimeoutLeft <= 0){ 
        self.treasureLocked = false;       
        self.io.sockets.emit("treasureLocked", self.treasureLocked);
      }
    }, this.treasuerTimeoutInterval);

    this.treasuerTimeoutLeft = this.treasuerTimeout;
    this.io.sockets.emit("treasuerTimeout", this.treasuerTimeoutLeft);
  },
});