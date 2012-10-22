var User = require("../models/User");

module.exports = {
  root: "/game",
  "GET ": [function(req, res, next){
    if(!req.session.userId) 
      res.redirect("/users/login")
    else
      next();
  },function(req, res) {
    User.findById(req.session.userId, function(err, user){
      if(err) return console.log(err);
      res.render('game', { title: 'Thequest', user: user });    
    });
  }]
}