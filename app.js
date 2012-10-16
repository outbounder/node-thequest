
/**
 * Module dependencies.
 */

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
var sessionStore = new MongoStore({db: "thequest-sessions"});

var db = mongoose.createConnection('localhost', "thequest");
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
    app.use(browserify(__dirname+"/client/game-index.js", {
      mount: "/game-index.js"
    }));
  });

  app.configure('development', function(){
    app.use(express.errorHandler());
  });

  app.get('/', routes.index);
  actions.mount(app, require("./routes/user"));
  actions.mount(app, require("./routes/game"));


  var server = http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));

    var io = socketio.listen(server);
    var sio = new SessionSockets(io, sessionStore, cookieParser);

    io.clientsCount = 0;
    sio.on("connection", function(err, socket, session){
      io.clientsCount += 1;
      io.sockets.emit("visitorsOnline", io.clientsCount);
      
      socket.on("disconnect", function(){
        io.clientsCount -= 1;
        io.sockets.emit("visitorsOnline", io.clientsCount);
      });
    });
  });

});