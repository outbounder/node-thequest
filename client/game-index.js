_ = require("./vendor/underscore");
var socket = io.connect();

var Player = require("./views/Player");
var players = [];

var getPlayerById = function(playerId){
  for(var i = 0; i<players.length; i++)
    if(players[i].playerId == playerId)
      return players[i];
}

var getPlayerByUsername = function(username){
  for(var i = 0; i<players.length; i++)
    if(players[i].username == username)
      return players[i]; 
}

var addOrUpdate = function(playerData){
  var player = getPlayerById(playerData.playerId);
  if(!player) {
    player = new Player(playerData)
    players.push(player);
    $(".gameWorld").append(player.render().$el);
  } else {
    _.extend(player, playerData);
    player.render();
  }
}

socket.on("registered", function(){
  socket.emit("addPlayer");  
});

socket.on("addPlayer", function(playerData){
  addOrUpdate(playerData);
});

socket.on("removePlayer", function(playerData){
  var p = getPlayerById(playerData.playerId);
  players.splice(players.indexOf(p), 1);
  p.remove();
});

socket.on("updateGame", function (gameState) {
  $(".timeLeft").html("Time left:"+gameState.timeLeft);
  //expect playerStates to be an array
  for (var i = 0; i < gameState.players.length; i ++) {
    addOrUpdate(gameState.players[i]);
  }
});

socket.on("treasureTrapped", function(p1Data, p2Data){
  _.extend(getPlayerById(p1Data.playerId), p1Data).render();
  if(p2Data)
    _.extend(getPlayerById(p2Data.playerId), p2Data).render();
})

socket.on("endgame", function (victory) {
  $(".endLabel").hide();
  victory?$(".winLabel").show():$(".looseLabel").show();

  var player = getPlayerByUsername(user.username);
  player.victories += victory?1:0;
  $(".victoriesCount").html(player.victories);
})

socket.on("restart", function(){
  $(".endLabel").hide();
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

$(".endLabel").hide();