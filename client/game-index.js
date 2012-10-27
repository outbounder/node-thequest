_ = require("underscore");
var socket = io.connect();

var Player = require("./views/Player");
var players = [];

var PlayersCollection = require("./collections/PlayersCollection");
var playersCollection = new PlayersCollection();

var WorldView = require("./views/WorldView");
var World = new WorldView({
  el:".gameWorld",
  collection: playersCollection
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
  if(World.collection.get(playerData.username))
    World.collection.add(playerData);
  else
    World.collection.add(playerData);
});

socket.on("players", function(gameState){
  var playersData = gameState.players;
  for(var i = 0; i<playersData.length; i++) {
    var playerData = playersData[i];
    playersCollection.add(playerData);
  }
});

socket.on("removePlayer", function(playerData){
  playersCollection.get(playerData.username).remove();
});


var movePlayer = function(playerData){
  playersCollection.get(playerData.username).set(playerData);
};

socket.on("movePlayer", movePlayer);
socket.on("updateGame", function (gameState) {
  //expect playerStates to be an array
  for (var i = 0; i < gameState.players.length; i ++) {
    movePlayer(gameState.players[i]);
  }
});

socket.on("treasureTrapped", function(p1Data, p2Data){
  playersCollection.get(p1Data).set(p1Data);
  if(p2Data)
    playersCollection.get(p2Data).set(p2Data);
})

socket.on("restart", function(){
  playersCollection.reset();
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
