
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));

  var io = require("socket.io").listen(server);

  io.clientsCount = 0;
  io.on("connection", function(socket){
    io.clientsCount += 1;
    io.sockets.emit("visitorsOnline", io.clientsCount);
    
    socket.on("disconnect", function(){
      io.clientsCount -= 1;
      io.sockets.emit("visitorsOnline", io.clientsCount);
    });
  });
});
