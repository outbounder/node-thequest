module.exports = function(user){
  this.state = { 
    username: user.username
    , hasTreasure: false
    , x: 0
    , y: 0
    , width: 32
    , height: 32
  };
  
  this.direction = {
    left: false
    , top: false
    , right: false
    , bottom: false
  };
  
  var acceleration = {
    x: 0
    , y: 0
  }
  
  var ACCELERATION = 3;
  var DECCELERATION = 5;
  var MAX_SPEED = 30;
  var changeAcceleration = function (dir, coef, pressed) {
    
    var val = acceleration[dir] * coef;
    if (val > 0) { //moving in that direction
      if (pressed) { //pressing in that direction
	if (val < MAX_SPEED) {
	  acceleration[dir] = (val + ACCELERATION) * coef;
	}
      } else { //moving, but not pressing - stopping
	acceleration[dir] = Math.max(val - DECCELERATION, 0) * coef;
      }
    } else {
      if (pressed) {
	acceleration[dir] = (val + ACCELERATION) * coef;
      }
    }
  }
  
  
  this.update = function () {
    //calc change
    changeAcceleration("x", -1, this.direction.left);
    changeAcceleration("y", -1, this.direction.top);
    changeAcceleration("x", +1, this.direction.right);
    changeAcceleration("y", +1, this.direction.bottom);

    //actually change position
    this.state.x += acceleration.x;
    this.state.y += acceleration.y;
  }
 
  this.getDistance = function (player) {
    var state = this.state;
    var st = player.state;
    return {
      x: Math.abs(st.x - state.x) - state.width
      , y: Math.abs(st.y - state.y) - state.height
    }
  }
  
  var isCollision = function (dist) {
    return dist.x <= 0 && dist.y <= 0;
  }
  
  this.isColliding = function (player) {
    return isCollision(this.getDistance(player));
  }
  
  this.handleGameAreaCollisions = function (area) {
      var state = this.state;
      if (state.x < area.left) {
	state.x = area.left;
	acceleration.x = Math.abs(acceleration.x); //move to the right
      }
      if (state.y < area.top) {
	state.y = area.top;
	acceleration.y = Math.abs(acceleration.y);
      }
      if (state.x + state.width > area.right) {
	state.x = area.right - state.width;
	acceleration.x = - Math.abs(acceleration.x);
      }
      if (state.y + state.height > area.bottom) {
	state.y = area.bottom - state.height;
	acceleration.y = - Math.abs(acceleration.y);
      }
  }
  
  this.changeDirection = function (attr, coef, shift) {
    this.state[attr] = this.state[attr] + shift * coef;
    acceleration[attr] = Math.abs(acceleration[attr]) * coef;
  }
  
  var compare = function (a, b) {
    return (a - b) / Math.abs(a - b);
  }
  
  this.handlePlayerCollisions = function (player) {
    if (player == this)
      return;
    var dist = this.getDistance(player);
    var tmp;
    if (isCollision(dist)) {
      //TODO: Realistic physics
      thisXSign = compare(this.state.x, player.state.x) || -1; //never use 0
      this.changeDirection("x", thisXSign, - dist.x);
      player.changeDirection("x", -thisXSign, - dist.x);
      thisYSign = compare(this.state.y, player.state.y) || -1;
      this.changeDirection("y", thisYSign, - dist.y);
      player.changeDirection("y", -thisYSign, - dist.y);
    }
  }
}



