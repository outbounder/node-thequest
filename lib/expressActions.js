var registerAction = function(app, method, url, action) {
  var args = [url];
  if(Array.isArray(action)) {
    action.forEach(function(a){
      args.push(function(req, res, next){
        a(req, res, next);
      });
    });
  } else {
    args.push(function(req, res, next){
      action(req, res, next);
    });
  }
  
  // dump all routes -> console.log(method, url);
  switch(method) {
    case "GET":
      app.get.apply(app, args);
    break;
    case "POST":
      app.post.apply(app, args);
    break;
    case "PUT":
      app.put.apply(app, args);
    break;
    case "DELETE":
      app.del.apply(app, args);
    break;
  }
};

var exportHttpActions = function(app, root, actions) {
  var root = actions.root || root;

  for(var key in actions) {
    if(key == "routes") {
      exportHttpActions(app, root,  actions.routes);
      continue;
    }
    if(key.indexOf(" ") === -1) continue;

    var parts = key.split(" ");
    var method = parts.shift();
    var url = parts.pop();
    var actionHandler = actions[key];
    if(typeof actionHandler === "string") {
      actionHandler = actions[actionHandler];
      if(typeof actionHandler !== "function" && !Array.isArray(actionHandler))
        throw new Error(actionHandler+" was not found");
    }
    registerAction(app, method, root+url, actionHandler);
  }
}

exports.mount = function(app, actions) {
  exportHttpActions(app, null, actions);  
}