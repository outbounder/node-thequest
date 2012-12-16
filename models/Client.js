/**
 * This class represents the communication with a single client from the servers prespective.
 * This is a wrapper over socket.io socket. Other implementations can be defined, as long as they follow the interface provided by this one.
 * 
 * Do not use node-proxy magic here so all the communication can be easily visible in one place
 */

var create = function (socket, user) {
  
  var client = {};
  
  client.username = user.username;
  client.victories = 0;
  client.avatar = "0";
  
  client.endgame = function (victory) {
    client.victories += victory;
    //maybe act more on this
    socket.emit("endgame", victory);
  };
  
  //Server to client
  client.restart = function () {
    socket.emit("restart");
  }
  
  client.addPlayer = function (data) {
    socket.emit("addPlayer", data);
  }
  
  client.removePlayer = function (data) {
    socket.emit("removePlayer", data);
  }
  
  client.treasureTrapped = function (data) {
    socket.emit("treasureTrapped", data);
  }
  
  client.updateGame = function (data) { 
    socket.emit("updateGame", data);
  }
  
  client.registered = function () {
    socket.emit("registered");
  }
  
  client.visitorsOnline = function (count) {
    socket.emit("visitorsOnline", count);
  }
  
  //listen to client
  var createPlaceholder  = function (messageName) {
    return function (fn) {
      console.log(messageName + "not redefined");
    }
  };
  

  //These must be defined from the user of the client object
  
  //game related
  client.onAddPlayer = createPlaceholder("addPlayer");
  client.onDisconnect = createPlaceholder("disconnect");
  
  //player related
  client.onDirectionChange = createPlaceholder("directionChange");
  client.onRemovePlayer = createPlaceholder("disconnect");
  
  socket.on("addPlayer", function(data){
    if(data)
      client.avatar = data.avatar;
    client.onAddPlayer();
  });

  socket.on("directionChange", function(isSet, dir){
    client.onDirectionChange(isSet, dir);
  });

  socket.on("disconnect", function(){
    client.onRemovePlayer();
    client.onDisconnect();
  });
  
  return client;
}

module.exports = {
  "create": create
}