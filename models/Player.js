module.exports = function(user){
  this.username = user.username;
  this.hasTreasure = false;
  this.x = 0;
  this.y = 0;
  this.width = 32;
  this.height = 32;
  this.speed = 10;
  this.offset = 1; // borders+margins
}

