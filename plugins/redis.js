'use strict';

const Catbox = require('catbox');

exports.register = function (server, pluginOptions, next) {
  var client = new Catbox.Client(require('catbox-redis'), pluginOptions);
  var instance = client.start(err => {
    if (err)      {
      next (err);
    }

    next();
  });
};

exports.register.attributes = {
  name: 'redis-client'
};
