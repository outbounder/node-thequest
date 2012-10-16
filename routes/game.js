module.exports = {
  root: "/game",
  "GET ": [function(req, res, next){
    if(!req.session.userId) 
      res.redirect("/users/login")
    else
      next();
  },function(req, res) {
    res.render('game', { title: 'Thequest' });  
  }]
}