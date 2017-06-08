const Users = require('./users');

exports.register = (plugin, options, next) => {
  plugin.route([
    // Public
    { method: 'POST',   path: '/', config: Users.create },

    // For Users
    { method: 'GET', path: '/me',       config: Users.viewProfile },
    { method: 'PUT', path: '/profile',  config: Users.updateProfile },
    { method: 'PUT', path: '/password', config: Users.updatePassword },

    // For Admins
    { method: 'GET',    path: '/',     config: Users.list },
    { method: 'GET',    path: '/{id}', config: Users.get },
    { method: 'PUT',    path: '/{id}', config: Users.update },
    { method: 'DELETE', path: '/{id}', config: Users.delete }
  ]);

  next();
};

exports.register.attributes = {
  name: 'users-api'
};
