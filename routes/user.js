var User = require("../models/User");

module.exports = {
  root: "/users",
  "GET /logout": function(req, res) {
    req.session.destroy();
    res.redirect("/users/login");
  },
  "GET /login": function(req, res) {
    res.render('user/login', { title: 'Thequest login', error: null });
  },
  "POST /login": function(req, res) {
    User.findOneByUsernamePassword(req.body.username, req.body.password, function(err, user){
      if(user) {
        req.session.userId = user.id;
        res.redirect("/game");
      } else
        res.render("user/login", { title: 'Thequest login', error: 'invalid user'});
    });
  },
  "GET /register": function(req, res) {
    res.render("user/register", {title: "Thequest register", error: null});
  },
  "POST /register": function(req, res) {
    User.create(req.body, function(err, user){
      if(user) {
        req.session.userId = user.id;
        res.redirect("/game");
      } else
        res.render("user/register", { title: "Thequest register", error: err});
    });
  }
}