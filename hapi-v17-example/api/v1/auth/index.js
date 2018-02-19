const Auth = require('./auth');

exports.register = (server, options) => {
  server.route([
    { method: 'GET',  path: '/login',  options: Auth.login },
    { method: 'POST', path: '/logout', options: Auth.logout }
  ]);
};

exports.name = 'auth-api';