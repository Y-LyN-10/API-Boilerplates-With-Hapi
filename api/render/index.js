const Render = require('./render');

exports.register = (plugin, options, next) => {
  plugin.route([
    { method: 'GET', path: '/', config: Render.home },
    { method: 'GET', path: '/login', config: Render.login },
    { method: 'GET', path: '/reset-password', config: Render.resetPassword },
  ]);

  next();
};

exports.register.attributes = {
  name: 'render-pages'
};
