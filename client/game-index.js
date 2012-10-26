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

socket.on("players", function(gameState){
  var playersData = gameState.players;
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


var movePlayer = function(playerData){
  var player = getPlayerByUsername(playerData.username);
  _.extend(player, playerData);
  player.render();
};

socket.on("movePlayer", movePlayer);
socket.on("updateGame", function (gameState) {
  //expect playerStates to be an array
  for (var i = 0; i < gameState.players.length; i ++) {
    movePlayer(gameState.players[i]);
  }
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
  
  return dir;
}

$(window).on("keydown", function(e){
  socket.emit("directionChange", true, direction(e));
});

$(window).on("keyup", function(e){
  socket.emit("directionChange", false, direction(e));
});
