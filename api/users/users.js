'use strict';

const Boom  = require('boom');
const Joi   = require('joi');

// Minimum 8 chars total with at least one upper case, one lower case and a digit
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,255}$/;

module.exports.list = {
  tags: ['api', 'users'],
  description: 'List users',
  notes: 'List users with pagination',
  auth: {scope: [ 'admin' ]},
  validate: {
    query: {
      fields: Joi.string(),
      sort: Joi.string().default('_id'),
      limit: Joi.number().default(20),
      page: Joi.number().default(1)
    }
  },
  handler: function (request, reply) {
    const User = request.server.plugins['hapi-mongo-models'].User;

    const query = {};
    const fields = request.query.fields;
    const sort = request.query.sort;
    const limit = request.query.limit;
    const page = request.query.page;

    User.pagedFind(query, fields, sort, limit, page, (err, results) => {

      if (err) {
        return reply(err);
      }

      return reply(results);
    });
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
      id: Joi.string().guid()
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
      id: Joi.string().guid()
    }
  },
  handler: function (request, reply) {
    return reply(Boom.notImplemented());
  }
};
