exports.index = function(req, res){
  res.redirect('/game');
  res.render('index', { title: 'Express' });
};