_ = require("underscore");
var socket = io.connect();

var Player = require("./views/Player");
var players = [];

var getPlayerByUsername = function(username){
  for(var i = 0; i<players.length; i++)
    if(players[i].username == username)
      return players[i];
}

var addOrUpdate = function(playerData){
  var player = getPlayerByUsername(playerData.username);
  if(!player) {
    player = new Player(playerData)
    players.push(player);
    $(".gameWorld").append(player.render().$el);
  } else {
    _.extend(player, playerData);
    player.render();
  }
}

socket.on('visitorsOnline', function (data) {
  $(".visitorsCount").html(data);
});

socket.on("timeLeft", function(timeLeft){
  $(".timeLeft").html("Time left:"+timeLeft);
});

socket.on("connect", function(){
  socket.emit("addPlayer");
});

socket.on("addPlayer", function(playerData){
  addOrUpdate(playerData);
});

socket.on("players", function(playersData){
  for(var i = 0; i<playersData.length; i++) {
    var playerData = playersData[i];
    addOrUpdate(playerData);   
  }
});

socket.on("removePlayer", function(playerData){
  var p = getPlayerByUsername(playerData.username);
  players.splice(players.indexOf(p), 1);
  p.remove();
});

socket.on("movePlayer", function(playerData){
  var player = getPlayerByUsername(playerData.username);
  _.extend(player, playerData);
  player.render();
});

socket.on("treasureTrapped", function(p1Data, p2Data){
  _.extend(getPlayerByUsername(p1Data.username), p1Data).render();
  if(p2Data)
    _.extend(getPlayerByUsername(p2Data.username), p2Data).render();
})

socket.on("restart", function(){
  $(".player").remove();
  players = [];
  socket.emit("addPlayer");
});

var lastKeyDown;
$(window).on("keydown", function(e){
  lastKeyDown = e;
});

$(window).on("keyup", function(e){
  lastKeyDown = null;
});

var keyboardInputId = setInterval(function(){
  if(lastKeyDown) {
    var e = lastKeyDown;
    var currentPlayer = getPlayerByUsername(user.username);
    if(!currentPlayer) return;
    var dirX = 0;
    var dirY = 0;
    if(e.keyCode == 37)
      dirX = -1;
    if(e.keyCode == 39)
      dirX = 1;
    if(e.keyCode == 40)
      dirY = 1;
    if(e.keyCode == 38)
      dirY = -1;
    if(dirY != 0 || dirX != 0)
      socket.emit("movePlayer", dirX*currentPlayer.speed, dirY*currentPlayer.speed);
  }
}, 1000/24);