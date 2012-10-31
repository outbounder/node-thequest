var mockupIO = {
  sockets: {
    emit: function(){}
  }
}

var _describe = function(){};

/* This test is totally out of date, we should implement new tests for the new structure and responsibilities
 *      --valeribogdanov 
 */
_describe("Game World", function(){
  var GameWorld = require("../models/GameWorld");
  var Player = require("../models/Player");
  var User = require("../models/User");

  var game = new GameWorld(mockupIO);
  var player1 = new Player(new User({username: "player1"}));
  var player2 = new Player(new User({username: "player2"}));

  it("adds players", function(){
    game.addPlayer(player1);
    expect(game.players.length).toBe(1);
    expect(game.players[0].username).toBe("player1");
    expect(game.players[0].x).toBeDefined();
    expect(game.players[0].y).toBeDefined();
    expect(game.players[0].width).toBeDefined();
    expect(game.players[0].height).toBeDefined();

    game.addPlayer(player2);
    expect(game.players.length).toBe(2);
    expect(game.players[1].username).toBe("player2");
  });

  it("finds player by username", function(){
    var p = game.getPlayerByUsername("player1");
    expect(p).toBeDefined();
    expect(p.username).toBe("player1");
  })

  it('removes players', function(){
    game.removePlayer(player1);
    expect(game.players.length).toBe(1);
    game.removePlayer(player2);
    expect(game.players.length).toBe(0);
  });

  it("moves player", function(){
    
    game.addPlayer(player1);
    var originalX = player1.x;
    var originalY = player1.y;

    game.movePlayer(player1, 100, 100);
    expect(game.players[0].x).toBe(originalX+100);
    expect(game.players[0].y).toBe(originalY+100);
    expect(player1.x).toBe(originalX+100);
    expect(player1.y).toBe(originalY+100);
  });

  it("collides players", function(){
    player1.hasTreasure = true;
    game.addPlayer(player2);
    player2.hasTreasure = false;
    var originalX = player1.x = player2.x-player2.width;
    var originalY = player1.y = player2.y-player2.height;
    game.movePlayer(player1, player2.width/2, player2.height/2);
    expect(player1.x).toBe(originalX);
    expect(player1.y).toBe(originalY);
    expect(player1.hasTreasure).toBe(false);
    expect(player2.hasTreasure).toBe(true);
  });

  it("collides players 2", function(){
    var originalX = player1.x = player2.x;
    var originalY = player1.y = player2.y-player2.height;
    game.movePlayer(player1, 0, player2.height/2);
    expect(player1.x).toBe(originalX);
    expect(player1.y).toBe(originalY);
  });

  it("collides players 2", function(){
    var originalX = player1.x = player2.x;
    var originalY = player1.y = player2.y+player2.height+1;
    game.movePlayer(player1, 0, -player2.height/2);
    expect(player1.x).toBe(originalX);
    expect(player1.y).toBe(originalY);
  });
});