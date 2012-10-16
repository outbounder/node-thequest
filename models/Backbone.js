var mongoose = require("mongoose");
module.exports.db = null;

module.exports.createModel = function(name, schema) {
  return module.exports.db.model(name, schema);
};

module.exports.createSchema = function(options) {
  var BaseSchema;
  BaseSchema = new mongoose.Schema(options);
  return BaseSchema;
};

module.exports.createModelSchema = function(name, options) {
  var methods, plugins, post, postName, pre, preName, schema, statics;
  if (options.statics) {
    statics = options.statics;
    delete options.statics;
  }
  if (options.methods) {
    methods = options.methods;
    delete options.methods;
  }
  if (options.plugins) {
    plugins = options.plugins;
    delete options.plugins;
  }
  if (options.pre) {
    pre = options.pre;
    delete options.pre;
  }
  if (options.post) {
    post = options.post;
    delete options.post;
  }
  schema = module.exports.createSchema(options);
  if (statics) {
    schema.statics = statics;
  }
  if (methods) {
    schema.methods = methods;
  }
  if (plugins) {
    schema.plugins = plugins;
  }
  if (pre) {
    for (preName in pre) {
      schema.pre(preName, pre[preName]);
    }
  }
  if (post) {
    for (postName in post) {
      schema.post(postName, post[postName]);
    }
  }
  return module.exports.createModel(name, schema);
};