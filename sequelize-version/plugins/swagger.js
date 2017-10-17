'use strict';

const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');

exports.register = function (server, pluginOptions, next) {
  server.register([
    Inert,
    Vision,
    {
      'register': HapiSwagger,
      'options': pluginOptions
    }
  ], (err) => {
    next(err);
  });
};

exports.register.attributes = {
  name: 'swagger'
};
