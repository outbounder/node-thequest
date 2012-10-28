var socket = io.connect();
var PlayersCollection = require("./collections/PlayersCollection");
var players = new PlayersCollection();

var WorldView = require("./views/WorldView");
var World = new WorldView({
  el:".gameWorld",
  collection: players
}).render();

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
    World.collection.add(playerData);
});

socket.on("players", function(gameState){
  var playersData = gameState.players;
  var l = playersData.length;
  for(var i = 0; i<l; i++)
    players.add(playersData[i]);
});

socket.on("removePlayer", function(playerData){
  players.get(playerData.username).remove();
});

var movePlayer = function(playerData){
  players.get(playerData.username).set(playerData);
};

socket.on("movePlayer", movePlayer);
socket.on("updateGame", function (gameState) {
  //expect playerStates to be an array
  for (var i = 0; i < gameState.players.length; i ++) {
    movePlayer(gameState.players[i]);
  }
});

socket.on("treasureTrapped", function(p1Data, p2Data){
  players.get(p1Data).set(p1Data);
  if(p2Data)
    players.get(p2Data).set(p2Data);
})

socket.on("restart", function(){
  players.reset();
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
  if(e.keyCode == 32)
    dir = "jump";
  
  return dir;
}

$(window).on("keydown", function(e){
  var dir = direction(e);
  dir !== "" ? socket.emit("directionChange", true, direction(e)) : false;
});

$(window).on("keyup", function(e){
  var dir = direction(e);
  dir !== "" ? socket.emit("directionChange", false, direction(e)) : false;
});
