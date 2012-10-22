var Backbone = require("./Backbone");
var crypto = require("crypto");

var User = module.exports = Backbone.createModelSchema("User", {
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  pre: {
    save: function(next) {
      if (!this.isModified('password')) {
        return next();
      }
      this.password = User.hashPassword(this.password);
      return next();
    }
  },
  statics: {
    hashPassword: function(value) {
      var md5sum;
      md5sum = crypto.createHash('md5');
      md5sum.update(value);
      return md5sum.digest('hex');
    },
    available: function(email, username, callback) {
      return this.find({
        $or: [
          {
            email: email
          }, {
            username: username
          }
        ]
      }, function(err, results) {
        return callback(err, results);
      });
    },
    findOneByUsernamePassword: function(username, password, callback) {
      return this.findOne({
        username: username,
        password: this.hashPassword(password)
      }, function(err, result) {
        if (result && !err) {
          return callback(err, result);
        }
        return callback(err);
      });
    }
  }
});