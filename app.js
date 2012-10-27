
/**
 * Module dependencies.
 */

if(process.env.NODE_ENV == "azure")
  config = require("./config/azure");
else
  config = require("./config/local");

var express = require('express')
  , socketio = require("socket.io")
  , routes = require('./routes')
  , actions = require("./lib/expressActions")
  , MongoStore = require('connect-mongo')(express)
  , SessionSockets = require('session.socket.io')
  , mongoose = require("mongoose")
  , browserify = require("browserify")
  , http = require('http')
  , path = require('path');

var app = express();

var cookieParser = express.cookieParser("thequest");
var sessionStore = new MongoStore(config.MongoStore);

var db = mongoose.createConnection(config.mongoose.hostname,
                    config.mongoose.db,
                    config.mongoose.port,
                    config.mongoose.opts);
db.once("open", function(){
  require("./models/Backbone").db = db;
  
  app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    app.use(express.session({
      secret: "thequest",
      store: sessionStore
    }));
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(browserify("./client/game-index.js", {
      mount: "/game-index.js",
      cache: false
    }));
  });

  app.configure('development', function(){
    app.use(express.errorHandler());
  });

  app.get('/', routes.index);
  actions.mount(app, require("./routes/user"));
  actions.mount(app, require("./routes/game"));

  var GameWorld = require("./models/GameWorld");
  var User = require("./models/User");
  var Player = require("./models/Player");

  var server = http.createServer(app).listen(app.get('port'), "0.0.0.0",function(){
    console.log("Express server listening on port " + app.get('port'));

    var io = socketio.listen(server);
    io.set("log level", 0);
    var sio = new SessionSockets(io, sessionStore, cookieParser);

    var game = new GameWorld(io);
    game.restart();
    console.log("game started");

    io.clientsCount = 0;
    sio.on("connection", function(err, socket, session){
      if(err) return console.log(err);
      io.clientsCount += 1;
      io.sockets.emit("visitorsOnline", io.clientsCount);

      if(!session.userId) return;
      User.findById(session.userId, function(err, user){
        if(err) return console.log(err);
        if(!user) return console.log("user not registered");
        socket.player = new Player(user, socket);

        socket.on("addPlayer", function(){
          game.addPlayer(socket.player);
        });

        socket.on("directionChange", function(isSet, dir){
          socket.player.direction[dir] = isSet;
        });
        
        socket.on("disconnect", function(){
          if(socket.player)
            game.removePlayer(socket.player);
          socket.player = null;
          io.clientsCount -= 1;
          io.sockets.emit("visitorsOnline", io.clientsCount);
        });

        socket.emit("registered");
      });
    });


  });

});