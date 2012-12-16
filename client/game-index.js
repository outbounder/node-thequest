_ = require("./vendor/underscore");
Backbone = require("./vendor/backbone");
require("./vendor/jquery/bPopup");
require("./vendor/jquery/center");

var rand = function(LowerRange, UpperRange){
  return Math.floor(Math.random() * (UpperRange - LowerRange + 1)) + LowerRange;
}

var sounds = {
  enabled: true,
  trapped: new Audio("sounds/trap.wav"),
  start: new Audio("sounds/start.wav"),
  win: [
    new Audio("sounds/yahoo1.wav"),
    new Audio("sounds/yahoo2.wav"),
    new Audio("sounds/yeahaw1.wav"),
    new Audio("sounds/yeahaw2.wav"),
    new Audio("sounds/yeahaw3.wav"),
    new Audio("sounds/yow.wav")
  ],
  lose: [
    new Audio("sounds/oooo.wav"),
    new Audio("sounds/ouch.wav")
  ]
}

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
  var Dialog = require("./views/ChooseAvatarDialog");
  var chooseAvatarDialog = new Dialog({ model: user });
  chooseAvatarDialog.on("confirm", function(avatarType){
    socket.emit("addPlayer", {avatar: avatarType});
  });
  chooseAvatarDialog.on("close", function(){
    socket.emit('addPlayer');
  })
  chooseAvatarDialog.render();
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
  $(".timeLeft").html(gameState.timeLeft);
  //expect playerStates to be an array
  for (var i = 0; i < gameState.players.length; i ++) {
    addOrUpdate(gameState.players[i]);
  }
  if(gameState.treasureTrapped && sounds.enabled)
    sounds.trapped.play();
});

socket.on("endgame", function (victory) {
  $(".endLabel").hide();
  victory?$(".winLabel").show():$(".looseLabel").show();

  if(sounds.enabled)
    if(victory)
      sounds.win[rand(0,sounds.win.length)].play();
    else
      sounds.lose[rand(0, sounds.lose.length)].play();

  var player = getPlayerByUsername(user.username);
  player.victories += victory?1:0;
  $(".victoriesCount").html(player.victories);
})

socket.on("restart", function(){
  $(".endLabel").hide();
  $(".player").remove();

  players = [];
  socket.emit("addPlayer");

  if(sounds.enabled)
    sounds.start.play();
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
  e.preventDefault();
  socket.emit("directionChange", true, direction(e));
});

$(window).on("keyup", function(e){
  e.preventDefault();
  socket.emit("directionChange", false, direction(e));
});

$(".soundToggle").click(function(e){
  e.preventDefault();
  sounds.enabled = !sounds.enabled;
  if(sounds.enabled)
    $(".soundToggle").text("Toggle sound off");
  else
    $(".soundToggle").text("Toggle sound on");
});

$(".endLabel").hide();