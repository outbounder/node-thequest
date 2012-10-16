_ = require("underscore");
var socket = io.connect('http://localhost');
socket.on('visitorsOnline', function (data) {
  $(".visitorsCount").html(data);
});