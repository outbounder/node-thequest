var _ = require("underscore")
, Vector = require("./Vector")
, Dimensions = require("./Dimensions")
, Directions = require("./Directions");

//FIXME: this function is duplicated in Player and World.. do something about it
var rand = function(LowerRange, UpperRange){
  return Math.floor(Math.random() * (UpperRange - LowerRange + 1)) + LowerRange;
}

var create = function (client, world) {
  var that = Object.create(client)
  , id = _.uniqueId()
  , forceDirection = Directions.enumMap()
  , position = Vector.create()
  , hasTreasure = false
  , speed = Vector.create() //Zeroed vector
  , mass = 10
  , directionForce = 30
  , frictionCoef = 1 //kg/s
  , DIMENSIONS = Vector.create({x: 32, y: 32});
  
  Object.defineProperty(that, "position", {
    get: function () {
      return position;
    }
  });

  Object.defineProperty(that, "hasTreasure", {
    get: function () {
      return hasTreasure;
    }
    , set: function (_treasure) {
      hasTreasure = _treasure;
    }
  });
  
  Object.defineProperty(that, "speed", {
    get: function () {
      return speed;
    }
    , set: function (val) {
      speed = val;
    }
  });
  
  Object.defineProperty(that, "state", {
    get: function () {
      return {
        username: that.username
        , hasTreasure: that.hasTreasure
        , x: Math.round(that.position.x)
        , y: Math.round(that.position.y)
        , width: DIMENSIONS.x
        , height: DIMENSIONS.y
        , playerId: id
      }
    }
  });
  
  client.onDirectionChange = function(isSet, dir){
    forceDirection[dir] = isSet;
  };
  
  client.onRemovePlayer = function () {
    world.removePlayer(that);
  }
  
  that.init = function (_hasTreasure) {
    position = Vector.create({
      x: rand(0, world.width)
      , y: rand(0, world.height)
    });
    hasTreasure = _hasTreasure;
  }
  
  that.update = function () {
    position = that.calcPosition(speed, forceDirection);
  }
  
  
  that.updateSpeed = function (_speed, _forceDirection) {
    speed = that.calcSpeed(_speed, _forceDirection);
  }
  
  /*
   * all public calc~ methods are intended as an extension point to add diff:erent behavior
   */
  that.calcPosition = function (_speed, _forceDirection) {
    that.updateSpeed(_speed, _forceDirection);
    return position.add(that.speed/* speed in points/iteration * 1 iteration */);
  }
  
  that.calcSpeed = function (_speed, _forceDirection) {
    return _speed.add(that.calcAcceleration(_speed, _forceDirection));
  }
  
  that.calcAcceleration = function (_speed, _forceDirection) {
    var sforce = that.calcFrictionForce(_speed, _forceDirection);
    sforce = sforce.add(that.calcPushForce(_speed, _forceDirection));
    return sforce.multiply(1/mass);
  }
  
  that.calcFrictionForce = function (_speed, _forceDirection) {
    return _speed.multiply(frictionCoef).revert();
  }
  
  that.calcPushForce = function (_speed, _forceDirection) {
    var val = {}
    Directions.each(function (dir) {
      if (_forceDirection[dir]) {
        val[dir.dimension] = (val[dir.dimension] || 0) + dir.towards;
      }
    });
    return Vector.create(val).multiply(directionForce);
  }
  
  that.calcDistance = function (positionedObject) {
    return that.position
    .substract(positionedObject.position)
    .abs()
    .substract(DIMENSIONS); //asume all positionedObject have constant sizes = DIMENSIONS
  }
  
  var isCollision = function (dist) {
    //negative in all dimensions:
    return dist.revert().equals(dist.abs());
  }
  
  that.isColliding = function (player) {
    return isCollision(that.calcDistance(player));
  }
  
  
  that.handleGameAreaCollisions = function (area) {
    var move = {};
    Directions.each(function (dir) {
      /*
       * 0 for left, top, 1 for right, bottom 
       * TODO: this must change, and array for all directions must represent the distance in that direction from position. 
       * This way we will escape the dependecy on position being the top left corner
       */
      var withDimensions = (1 + dir.towards) / 2;
      
      var dim = dir.dimension;
      
      var playerEnd = that.position[dim] + withDimensions * DIMENSIONS[dim];
      var distanceToWall = (area[dir] - playerEnd) * dir.towards;
      
      if (distanceToWall < 0) { //collision with game wall
        move[dim] = distanceToWall * dir.towards;
        speed = speed.revertDim(dim);
      }
    });
    position = position.add(Vector.create(move));//  .multiply(2) for elastic hit and time calculation, but starts looking less realistic
  }
   
  var calcTimeOfImpact = function (player1, player2) {
    var dotImpactSpeed = player1.speed.substract(player2.speed);
    var dotImpactDistance = player1.position.substract(player2.position);
    var absDotImpactSpeed = dotImpactSpeed.abs();
    
    var timesAfterImpact = Dimensions.map(function (dim) {
      /* 
       * calculate dot's impact time (might be negative) and add the time for passing the dimensions. 
       * The lowest number (must be non-negative) is the actual time after impact. It must be between 0 and 1
       */
      return (dotImpactDistance[dim] / dotImpactSpeed[dim]) + (DIMENSIONS[dim] / absDotImpactSpeed[dim]);
    });
    
    var time = Math.min.apply(Math, timesAfterImpact);
    
    if (time < 0 || time > 1) {
      console.log("error in calcualtion: collision time calcualte to ", time, " cycles. speeds and positions:"
      , " player1: {", player1.speed, player1.position, "}"
      , " player2: {", player2.speed, player2.position, "}");
      return 1;
    }
    return time;
  };
  
  that.handlePlayerCollisions = function (player) {
    if (player === that)
      return;

    if (that.isColliding(player)) {
      //resolve collision
      var timeOfImpact = calcTimeOfImpact(that, player);
      
      //revert time to time of impact
      that.moveTime(-timeOfImpact);
      player.moveTime(-timeOfImpact);
    
      //swap speeds
      var tmp = that.speed;
      that.speed = player.speed;
      player.speed = tmp;
      
      //move with time of impact - elastic hit occured before "timeOfImpact", we must proceed moving forward
      that.moveTime(timeOfImpact);
      player.moveTime(timeOfImpact);
      
      that.ensureCollisionIsResolved(player);
      
      //swap treasure owner
      tmp = that.hasTreasure;
      that.hasTreasure = player.hasTreasure;
      player.hasTreasure = tmp;
      
    }
  }
  
  that.ensureCollisionIsResolved = function (player) {
    //just run away
    if(that.isColliding(player)) { 
      player.moveTime(1);
      that.moveTime(1);
    }
    
    //and if it is still colliding just go random directions until we find a way out
    while(that.isColliding(player)) {
      console.log("things got f*cked up: " + that.position + that.speed + player.position + player.speed);
      //in case we have a unit blocked at a wall and another colliding non-stop with it they get stuck. 
      //This should resolve the issue. But keep in mind that is buggy behavior
      if (that.isStill() || player.isStill()) {
        var newAcc = Vector.create({ 
          x: rand(-20, 20)
          , y: rand(-20, 20)
        })
        //go in opposite directions
        that.speed = newAcc
        player.speed = newAcc.revert();
      }
      
      //move them until they are away from each other...
      for (var retry = 0; retry < 10 && that.isColliding(player); retry ++) {
        player.moveTime(1);
        that.moveTime(1);
      }
    }
  }
  
  that.moveTime = function(time) {
    position = position.add(speed.multiply(time));
  }
  
  that.isStill = function () {
    return speed.equals(Vector.create());
  }
 
 return that;
}

module.exports = function(client, world){
  return create(client, world); //handle new Player(args) and Player(args) invokations
}

module.exports.create = create;



