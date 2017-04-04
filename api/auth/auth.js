'use strict';

const Boom  = require('boom');
const Joi   = require('joi');

module.exports.login = {
  tags: ['api', 'auth'],
  description: 'Login',
  auth: false,
  notes: 'Autnenticate with email and password to request JWT access token',
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
  /*eslint-disable */
  /* response: {
    schema: {
      accessToken: Joi.string().required().example('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN1cGVyLnl1QHdlYmlkcTYsImFnZW50IjoiTW9...'),
      refreshToken: Joi.string().required().example('e7dba717-0a0d-43c3-b4e3-ebf398bb678e.b87be58de1cd58fd4ffc00cc23e188a733c9c5f486ec4e16dc...')
    }
  }, */  
  /*eslint-enable */
  handler: function (request, reply) {
    return reply(Boom.notImplemented());
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
