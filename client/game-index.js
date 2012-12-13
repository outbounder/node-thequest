_ = require("./vendor/underscore");
var socket = io.connect();

var Player = require("./views/Player3D");
var players = [];

var ww = window.innerWidth;
var hh = window.innerHeight;

var camera = new THREE.PerspectiveCamera(45, ww / hh, 0.1, 100000);
camera.position.z = 2600;
//camera.position.y = 400;

var scene = new THREE.Scene();
scene.add( new THREE.AmbientLight( 0x2b3132 ) );

var light = new THREE.SpotLight( 0xffffff, 1.5 );
light.position.set( 0, 500, 2000 );
light.castShadow = true;
light.intensity = 1.5;

light.shadowCameraNear = 200;
light.shadowCameraFar = camera.far;
light.shadowCameraFov = 50;

light.shadowBias = -0.00022;
light.shadowDarkness = 0.5;

light.shadowMapWidth = 2048;
light.shadowMapHeight = 2048;

scene.add( light );

var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize(ww, hh);
renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;


var gameContainer3d = new THREE.Object3D();

var stageContainer3d = new THREE.Object3D();
stageContainer3d.position.y = 0;
stageContainer3d.position.z = -200;
stageContainer3d.scale.x = 2.4;
stageContainer3d.scale.y = 2.4;
stageContainer3d.scale.z = 2.4;
stageContainer3d.rotation.x = 45 * (Math.PI / 180);

stageContainer3d.add(gameContainer3d);
scene.add(stageContainer3d);

/*plane = new THREE.Mesh( new THREE.PlaneGeometry( 800, 600, 8, 8 ), new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ));
plane.position.z = -20;
stageContainer3d.add( plane );*/


var showmanMaterial;
var showmanGeometry;

var light2 = new THREE.PointLight( 0xff6600, 1.5, 1000 ); 
light2.position.y = 100; 
light2.position.z = 30; 
gameContainer3d.add( light2 );

var loader = new THREE.JSONLoader();
var world3d;

var callbackWorld = function ( geometry, materials ) {

  world3d = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
  world3d.position.y = 105;
  world3d.position.x = 0;
  world3d.castShadow = true;
  //world3d.rotation.x = 90 * (Math.PI / 180);

  /*world3d.scale.x = 0.5;
  world3d.scale.y = 0.5;
  world3d.scale.z = 0.5;*/
  stageContainer3d.add( world3d );
};

loader.load( "models/world.js", callbackWorld, "textures");


var callbackSnowman = function ( geometry, materials ) {
  showmanGeometry = geometry;
  showmanMaterial = materials;




/*function createScene( geometry, materials, x, y, z, b ) {

  zmesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
  zmesh.position.set( x, y, z );
  zmesh.scale.set( 3, 3, 3 );
  scene.add( zmesh );

  createMaterialsPalette( materials, 100, b );

}*/


$(".gameWorld").append(renderer.domElement);

function render() {
  
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

window.addEventListener( 'resize', onWindowResize, false );
render();

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

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
    player = new Player(playerData, gameContainer3d, showmanGeometry, showmanMaterial, light2);
    players.push(player);
    gameContainer3d.add(player.model);
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

  for (var i = 0;i < players.length;i ++)
    gameContainer3d.remove(players[i].model);

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
  e.preventDefault();
  socket.emit("directionChange", true, direction(e));
});

$(window).on("keyup", function(e){
  e.preventDefault();
  socket.emit("directionChange", false, direction(e));
});

$(".endLabel").hide();

};

loader.load("models/snowman1.js", callbackSnowman, "textures");