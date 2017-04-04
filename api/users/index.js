const Users = require('./users');

exports.register = (plugin, options, next) => {

  plugin.route([
    { method: 'GET', path: '/', config: Users.list },
    { method: 'POST', path: '/', config: Users.create },
    { method: 'PUT', path: '/{id}', config: Users.update },
    { method: 'DELETE', path: '/{id}', config: Users.delete }
  ]);

  next();
};

exports.register.attributes = {
  name: 'users-api'
};
