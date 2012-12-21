_ = require("./vendor/underscore");
var socket = io.connect(require("config").socketio);

require("./vendor/TweenLite.min");
require("./vendor/easing/EasePack.min");


//var Stats = require("./vendor/stats.min");
//console.log("###:", Stats);monitor


var Player = require("./views/Player3D");
var players = [];


var Preloader = function() {
  this.total = 0;
  this.loaded = 0;

  var _self = this;
  
  this.complete = null;
  this.listen = function(fn) {
    _self.total ++; 
    console.log("listen:", _self.total);
    return function() {
      _self.loaded ++;

      console.log("listenComplete:", _self.loaded, arguments);

      if (fn)
        fn.apply(null, arguments);

      if (_self.total == _self.loaded && _self.complete)
        _self.complete();
    }
  }
}



var ww = window.innerWidth;
var hh = window.innerHeight;

var camera = new THREE.PerspectiveCamera(45, ww / hh, 0.1, 100000);
camera.position.z = 2600;
//camera.position.y = 400;

var scene = new THREE.Scene();
//scene.fog = new THREE.FogExp2( 0x000000, 0.0008 );

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


var renderer = new THREE.WebGLRenderer( { antialias: true} );
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

var starLight = new THREE.PointLight( 0xfff58a, 3, 700 ); 
starLight.position.x = -120; 
starLight.position.y = 300; 
starLight.position.z = -270; 
gameContainer3d.add( starLight );

var showmanMaterial;
var showmanGeometry;

var preloader = new Preloader();

var light2 = new THREE.PointLight( 0xff6600, 1.5, 1000 ); 
light2.position.y = 100; 
light2.position.z = 30; 
gameContainer3d.add( light2 );

var world3d;

var sprite1 = THREE.ImageUtils.loadTexture( "textures/snowflake1.png", null, preloader.listen());
var sprite2 = THREE.ImageUtils.loadTexture( "textures/snowflake2.png", null, preloader.listen());
var sprite3 = THREE.ImageUtils.loadTexture( "textures/snowflake3.png", null, preloader.listen());
var sprite4 = THREE.ImageUtils.loadTexture( "textures/snowflake4.png", null, preloader.listen());
var sprite5 = THREE.ImageUtils.loadTexture( "textures/snowflake5.png", null, preloader.listen());

var systems = [];
var materials = [];
var parameters;

function initParticles() {
  var particles, geometry, i, h, color, sprite, size;
  var mouseX = 0, mouseY = 0;

  var windowHalfX = window.innerWidth / 2;
  var windowHalfY = window.innerHeight / 2;

  geometry = new THREE.Geometry();

  for (var i = 0; i < 200; i ++ ) {

    var vertex = new THREE.Vector3();
    vertex.x = Math.random() * 3000 - 1500;
    vertex.y = Math.random() * 1500;
    vertex.z = Math.random() * 3000 - 1500;

    geometry.vertices.push( vertex );

  }

  parameters = [ [ [1.0, 0.2, 1.0], sprite2, 20 ],
           [ [0.95, 0.1, 1], sprite3, 15 ],
           [ [0.90, 0.05, 1], sprite1, 10 ],
           [ [0.85, 0, 0.8], sprite5, 8 ],
           [ [0.80, 0, 0.7], sprite4, 5 ],
           ];

  for ( i = 0; i < parameters.length; i ++ ) {

    color  = parameters[i][0];
    sprite = parameters[i][1];
    size   = parameters[i][2];

    materials[i] = new THREE.ParticleBasicMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent : true } );
    materials[i].color.setHSV( color[0], color[1], color[2] );

    particles = new THREE.ParticleSystem( geometry, materials[i] );

    particles.rotation.x = Math.random() * 6;
    particles.rotation.y = Math.random() * 6;
    particles.rotation.z = Math.random() * 6;

    scene.add( particles );
    systems.push(particles);
  }

  //console.log("Stats", Stats);

  /*stats = new require("./vendor/stats.min");
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild( stats.domElement );*/
}

var renderParticles = function() {
  var time = Date.now() * 0.00005;

  for ( i = 0; i < systems.length; i ++ ) 
      systems[i].rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );

  for ( i = 0; i < materials.length; i ++ ) {
    color = parameters[i][0];

    h = ( 360 * ( color[0] + time ) % 360 ) / 360;
    materials[i].color.setHSV( h, color[1], color[2] );
  }
}

$(".gameWorld").append(renderer.domElement);

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

// LOAD OBJETCTS

var callbackWorld = function ( geometry, materials ) {
  world3d = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
  world3d.position.y = 105;
  world3d.position.x = 0;
  world3d.castShadow = true;

  stageContainer3d.add( world3d );
};

var loader = new THREE.JSONLoader();
loader.load( "models/world.js", preloader.listen(callbackWorld), "textures");

console.log("-1-");

var winText3D;
var loseText3D;

var callbackWinText = function ( geometry, materials ) {
  winText3D = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
  winText3D.scale.x = 10;
  winText3D.scale.y = 10;
  winText3D.scale.z = 10;
  winText3D.position.y = 1000;

  stageContainer3d.add( winText3D );
};

loader = new THREE.JSONLoader();
loader.load( "models/win-text.js", preloader.listen(callbackWinText), "textures");

console.log("-2-");

var callbackLoseText = function ( geometry, materials ) {
  loseText3D = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
  loseText3D.scale.x = 10;
  loseText3D.scale.y = 10;
  loseText3D.scale.z = 10;
  loseText3D.position.y = 1000;

  stageContainer3d.add( loseText3D );
};

loader = new THREE.JSONLoader();
loader.load( "models/lose-text.js", preloader.listen(callbackLoseText), "textures");


var callbackSnowman = function ( geometry, materials ) {
  showmanGeometry = geometry;
  showmanMaterial = materials;

  console.log(materials);
};

loader = new THREE.JSONLoader();
loader.load("models/snowman1.js", preloader.listen(callbackSnowman), "textures");

var initAll =  function() {

  initParticles();

  var render = function() {
    requestAnimationFrame(render);

    renderParticles();
    renderer.render(scene, camera);
  }

  var onWindowResize = function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

  }

  window.addEventListener( 'resize', onWindowResize, false );
  render();

  var socket = io.connect();

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
    if (victory)
      TweenLite.to(winText3D.position, 1.5, {y: 10, ease: Bounce.easeOut});
    else
      TweenLite.to(loseText3D.position, 1.5, {y: 10, ease: Bounce.easeOut});

    var player = getPlayerByUsername(user.username);
    player.victories += victory ? 1 : 0;

    $(".victoriesCount").html(player.victories);
  })

  socket.on("restart", function(){
    TweenLite.to(winText3D.position, 1, {y: 1000, ease: Cubic.easeIn});
    TweenLite.to(loseText3D.position, 1, {y: 1000, ease: Cubic.easeIn});

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

};

var _self = this;

preloader.complete = function() {
  console.log("---ALL LOADED---");
  initAll();
}
