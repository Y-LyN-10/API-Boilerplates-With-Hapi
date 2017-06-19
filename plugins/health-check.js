'use strict';

exports.register = function (server, pluginOptions, next) {
  server.route({
    method: 'GET',
    path: '/health',
    config: {
      description: 'Health Check',
      auth: false,
      notes: 'Does nothing. Just returns 200 OK',
      handler: function (request, reply) {
        reply();
      }
    }
  });

  next();
};

exports.register.attributes = {
  name: 'healthy'
};
