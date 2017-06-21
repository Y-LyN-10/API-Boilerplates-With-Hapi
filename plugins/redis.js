'use strict';

const Catbox = require('catbox');
const redis  = require('redis');

exports.register = function (server, pluginOptions, next) {
  var client = new Catbox.Client(require('catbox-redis'), pluginOptions);
  var instance = client.start(err => {
    if (err) next (err);    
    next();
  });

  var redisClient = redis.createClient(pluginOptions);
  redisClient.on("error", function (err) {
    console.log("Error " + err);
  });
  
  server.expose('client', redisClient);
};

exports.register.attributes = {
  name: 'redis'
};
