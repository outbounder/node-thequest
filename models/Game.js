/**
 * Game is representing the game as a whole, not a single world of it. 
 * This class has the responsibility to add clients, create worlds and register players in them. 
 * The game cycle is part of the Game class. The cycle handles the world(s)
 * Game should be used as singleton
 */

var World = require("./GameWorld")
, Player = require("./Player")
, GAME_DURATION = 30000 //ms
, TICK_INTERVAL = 20 //ms
;

var create = function () {
  var game = {}
  , clients = []
  , world = { 
    updateGame: function() {}
    , restart: function () {}
    , addPlayer: function () { throw "Illegal State - fake world"; } 
  };
  
  var broadcastCount = function () {
    clients.forEach(function (client) {
      client.visitorsOnline(clients.length);
    });
  };
  
  game.addClient = function (client) {
    
    client.onAddPlayer = function(){
      world.addPlayer(new Player(client, world));
    };
    
    client.onDisconnect = function () {
      clients.splice(clients.indexOf(client), 1);
      broadcastCount();
    };
    
    clients.push(client);
    broadcastCount();
    
    client.registered();
  };
  
  
  game.startWorld = function () {
    world = new World(GAME_DURATION);
    console.log("world started");
    
    setTimeout(function () {
      var _world = world;
      _world.declareWinner();
      _world.pause();
      setTimeout(function(){ game.startWorld(); _world.restart(); }, 2500);
    }, GAME_DURATION);
  };
  
  
  //always ticks, therefore method must always be present
  var doGameCycle = function(){
    
    world.updateGame();
    
    /* 
     * Use Timeout instead of Interval to ensure that the computer has its time to finish calculations. 
     * Using setInterval can lead to multiple gameCycle invokation waiting in the queue for execution 
     * and lead to possible errors when working with non-block operations
     */
    setTimeout(doGameCycle, TICK_INTERVAL); 
  };
  doGameCycle(); // it will run as long as game instance exists
  
  return game;
}

module.exports = {
  "create": create
}