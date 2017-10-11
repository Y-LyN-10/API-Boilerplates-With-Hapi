'use strict';

const Boom  = require('boom');
const Joi   = require('joi');

// Minimum 8 chars total with at least one upper case, one lower case and a digit
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,255}$/;

module.exports.list = {
  tags: ['api', 'users'],
  description: 'List users',
  notes: 'List users with pagination',
  validate: {
    query: {
      page: Joi.number().integer().min(1).max(100).default(1),
      pageSize: Joi.number().integer().min(1).max(100).default(30),
      order: Joi.string().valid('name', 'email', '"createdAt" desc', '"createdAt"').default('name')
    }
  },
  handler: function (request, reply) {
    return reply(Boom.notImplemented());
  }
};

module.exports.create = {
  tags: ['api', 'users'],
  description: 'Create a new user',
  notes: 'Create a new user (non-admin) with name, email and password.',
  validate: {
    payload: {
      name: Joi.string().min(2).max(255).required(),
      email: Joi.string().email().required(),
      password: Joi.string().regex(passwordRegex).required(),
      passwordConfirmation: Joi.string().min(8).max(200).required().valid(Joi.ref('password'))
    }
  },
  handler: function (request, reply) {
    return reply(Boom.notImplemented());
  }
};

module.exports.update = {
  tags: ['api', 'users'],
  description: 'Update user',
  notes: 'Change user\'s password',
  validate: {
    params: {
      id: Joi.number().integer()
    },
    payload: Joi.object()
      .keys({
        password: Joi.string().regex(passwordRegex).optional(),
        passwordConfirmation: Joi.string().valid(Joi.ref('password'))
      })
      .with('password', 'passwordConfirmation')
  },
  handler: function (request, reply) {
    return reply(Boom.notImplemented());
  }
};

module.exports.delete = {
  tags: ['api', 'users'],
  description: 'Delete user',
  notes: 'Delete user by ID (soft delete)',
  validate: {
    params: {
      id: Joi.number().integer()
    }
  },
  handler: function (request, reply) {
    return reply(Boom.notImplemented());
  }
};
