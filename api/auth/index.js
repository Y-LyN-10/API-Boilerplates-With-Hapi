const Auth  = require('./auth');

exports.register = (plugin, options, next) => {

  plugin.route([
    { method: 'POST', path: '/login',  config: Auth.login },
    { method: 'GET' , path: '/logout', config: Auth.logout }
  ]);

  next();
};

exports.register.attributes = {
  name: 'auth-api'
};
