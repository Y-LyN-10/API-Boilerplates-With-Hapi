const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');

exports.register = async function (server, pluginOptions) {
  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: pluginOptions
    }
  ]);
};

exports.name = 'swagger';