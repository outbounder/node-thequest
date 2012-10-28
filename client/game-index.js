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
