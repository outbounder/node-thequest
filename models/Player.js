var _ = require("underscore");

module.exports = function(user, socket){
  this.socket = socket;

  this.state = { 
    username: user.username
    , hasTreasure: false
    , x: 0
    , y: 0
    , width: 32
    , height: 32
    , playerId: _.uniqueId()
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
  
  var DIMENSIONS = { x: 32, y: 32 };
  var ACCELERATION = 3;
  var DECCELERATION = 1;
  var MAX_SPEED = 20;
  var changeAcceleration = function (dir, coef, pressed) {
    var val = acceleration[dir] * coef;
    if (val > 0 && !pressed) { //moving in that direction and not pressing - stopping
      acceleration[dir] = Math.max(val - DECCELERATION, 0) * coef;
    }
    if (pressed && val < MAX_SPEED) { //apply acceleration
      acceleration[dir] = Math.min(MAX_SPEED, (val + ACCELERATION)) * coef;
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
    
  var distanceOfImpact = function (dir, player1, player2) {
    //calculate direction of impact
    // - 1 player 1 was hit from lower, 0 - equal speeds, no direction on dir, +1 - player1 was hit from higher
    var directionOfImpact = compare(player1.acc()[dir], player2.acc()[dir]); 
    /*
     * Let player 2 be hitting from right, player1 from left
     * player1.acc > player2.acc, therefore directionOfImpact = +1
     * (player2 absolute x position - player1 absolute x position) * +1 - how close positions of players are, if value is negative they swap places
     * - width -> results in negative value equal to the number of points they traveled after collision.
     */
    var distanceToImpact = ((player2.state[dir] - player1.state[dir]) * directionOfImpact - DIMENSIONS[dir]);
    return -distanceToImpact;
  };
  
  var compare = function (a, b) {
    if (a === b) return 0; // prevent 0/0 as it is not 0, but NaN
    return (a - b) / Math.abs(a - b);
  }
  
  var speedOfImpact = function (dir, acc1, acc2) {
    var a = acc1[dir]
    , b = acc2[dir];
    /*
     let a > b in the following examples:
     if b >= 0, a > 0 -> a chases b, speed is a - b
     if a >= 0, b < 0 -> a speeds against b, speed is a + (-b) -> a - b
     if a < 0, b < 0 -> b chases a towards -Infinity, speed is (-b) - (-a) -> a - b
       
     Therefore speed of impact on a given direction is the higherValue - lowerValue:
    */
    return Math.max(a, b) - Math.min(a, b);
  };
  
  var calcTimeOfImpact = function (dir, player1, player2) {
    var speed = speedOfImpact(dir, player1.acc(), player2.acc());
    if (speed == 0) return 1; //instead of Infinity
    return distanceOfImpact(dir, player1, player2) / speed;
  };
  
  this.handlePlayerCollisions = function (player) {
    if (player == this)
      return;
    var dist = this.getDistance(player);
    if (this.isColliding(player)) {
      //resolve collision
     
      //calculate time of impact
      var timeOfImpact = Math.min(
	  calcTimeOfImpact("x", this, player)
	  , calcTimeOfImpact("y", this, player)
      );
      
      //revert time to time of impact
      this.moveTime(-timeOfImpact);
      player.moveTime(-timeOfImpact);
    
      //swap accelerations
      var tmp = this.acc();
      this.acc(player.acc());
      player.acc(tmp);
      
      //move with time of impact
      this.moveTime(timeOfImpact);
      player.moveTime(timeOfImpact);
      
      this.ensureCollisionIsResolved(player);
      
      //swap treasure owner
      tmp = this.state.hasTreasure;
      this.state.hasTreasure = player.state.hasTreasure;
      player.state.hasTreasure = tmp;
      
    }
  }
  
  this.ensureCollisionIsResolved = function (player) {
    //just run away
    if(this.isColliding(player)) { 
      player.moveTime(1);
      this.moveTime(1);
    }
    
    //and if it is still colliding just go until we find a way out
    while(this.isColliding(player)) {
      console.log("things got f*cked up");
      //in case we have a unit blocked at a wall and another colliding non-stop with it they get stuck. 
      //This should resolve the issue. But keep in mind this is buggy behavior
      if (this.isStill() || player.isStill()) {
	var newAcc = { 
	  x: Math.round(Math.random()*5)
	  , y: Math.round(Math.random()*5)
	}
	//go in opposite directions
	this.acc(newAcc)
	player.acc({x: -newAcc.x, y: -newAcc.y});
      }
      
      for (var retry = 0; retry < 10 && this.isColliding(player); retry ++) {
	player.moveTime(1);
	this.moveTime(1);
      }
    }
  }
  
  var roundFurther = function (value) {
    return (value >= 0) ? Math.ceil(value): Math.floor(value);
  }
  
  this.moveTime = function(time, fn) {
    this.state.x += roundFurther(acceleration.x * time);
    this.state.y += roundFurther(acceleration.y * time);
  }
  
  this.isStill = function () {
    return acceleration.x === 0 && acceleration.y === 0;
  }
  
  this.acc = function (arg) {
    if (typeof arg !== "undefined") {
      acceleration = arg;
    } else {
      return acceleration;
    }
  };
}



