'use strict';

const Boom  = require('boom');
const Joi   = require('joi');

module.exports.login = {
  tags: ['api', 'auth'],
  description: 'Login',
  auth: false,
  notes: 'Autnenticate with email and password to request JWT access token',
  plugins: {
    // will be working after Redis is installed
    'hapi-attempts-limiter': {
      limit: 3,
      duration: 120 // in seconds
    }
  },
  validate: {
    payload: Joi.object()
      .keys({
        email: Joi.string().email(),
        password: Joi.string().min(8).max(200),
        refreshToken: Joi.string().optional().allow('')
      })
      .with('email', 'password')
      .without('password', 'refreshToken')
      .or('refreshToken', ['email', 'password'])
  },
  handler: function (request, reply) {
    return reply(Boom.badRequest());
  }
};

module.exports.logout = {
  tags: ['api', 'auth'],
  description: 'Logout',
  notes: 'Log out from the server to force token invalidation and revoke access',
  handler: function (request, reply) {
    return reply(Boom.notImplemented());
  }
};
