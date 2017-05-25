'use strict';

const Boom  = require('boom');
const Joi   = require('joi');

const STRATEGY_LOCAL = 'local';

// Minimum 8 chars total with at least one upper case, one lower case and a digit
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,255}$/;

module.exports.list = {
  tags: ['api', 'users'],
  description: 'List users',
  notes: 'List users with pagination',
  auth: {scope: [ 'admin' ]},
  validate: {
    query: {
      firstName: Joi.string().token().lowercase(),
      isActive: Joi.string(),
      role: Joi.string(),
      fields: Joi.string(),
      sort: Joi.string().default('_id'),
      limit: Joi.number().default(20),
      page: Joi.number().default(1)
    }
  },
  handler: function (request, reply) {
    const User = request.server.plugins['hapi-mongo-models'].User;

    const query = {};

    if (request.query.username) {
      query.username = new RegExp('^.*?' + request.query.username + '.*$', 'i');
    }
    
    if (request.query.isActive) {
      query.isActive = request.query.isActive === 'true';
    }
    
    if (request.query.role) {
      query['roles.' + request.query.role] = { $exists: true };
    }
    
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

module.exports.get = {
  tags: ['api', 'users'],
  description: 'Get user',
  notes: 'Read single user\'s data',
  auth: {scope: [ 'admin' ]},
  validate: {
    params: {
      id: Joi.string()
    }
  },
  handler: function (request, reply) {
    const User = request.server.plugins['hapi-mongo-models'].User;

    User.findById(request.params.id, (err, user) => {
      if (err) { return reply(err); }

      if (!user) {
        return reply(Boom.notFound('User not found'));
      }

      return reply(user);
    });
  }
};

module.exports.me = {
  tags: ['api', 'users'],
  description: 'My profile',
  notes: 'User can request his own profile data on this route',
  auth: {scope: [ 'admin', 'user']},
  handler: function (request, reply) {
    const User = request.server.plugins['hapi-mongo-models'].User;
    
    const id = request.auth.credentials.id.toString();
    const fields = User.fieldsAdapter('firstName lastName email image');

    User.findById(id, fields, (err, user) => {
      if (err) { return reply(err); }

      if (!user) {
        return reply(Boom.notFound('Document not found. That is strange.'));
      }

      return reply(user);
    });
  }
};

module.exports.create = {
  tags: ['api', 'users'],
  description: 'Create a new user',
  notes: 'Create a new user (non-admin) with name, email and password.',
  auth: false,
  validate: {
    payload: {
      firstName: Joi.string().min(2).max(255).required(),
      lastName: Joi.string().min(2).max(255).required(),
      email: Joi.string().email().required(),
      password: Joi.string().regex(passwordRegex).required(),
      passwordConfirmation: Joi.string().min(8).max(200).required().valid(Joi.ref('password'))
    }
  },
  handler: function (request, reply) {
    const User = request.server.plugins['hapi-mongo-models'].User;

    User.findByEmail(request.payload.email, (err, user) => {
      if(err) { return reply(err); }
      if(user) { return reply(Boom.conflict('Email already in use.')); }

      let data = {
        name: request.payload.firstName + ' ' + request.payload.lastName,
        email: request.payload.email,
        password: User.generatePasswordHash(request.payload.password)
      }
      
      User.create(data, STRATEGY_LOCAL, (err, user) => {
        if (err) { return reply(err);}
        return reply(user);
      });
    });
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
  auth: {scope: [ 'admin' ]},
  validate: {
    params: {
      id: Joi.string() // TODO: Add joi-objectid npm module to validate mongodb IDs
    }
  },
  handler: function (request, reply) {
    const User = request.server.plugins['hapi-mongo-models'].User;

    // Issue: I deleted my own admin account and was still able to use the API with the access token, even though the user does not exist anymore

    // This is not 'soft delete' btw
    
    User.findByIdAndDelete(request.params.id, (err, user) => {
      if (err) { return reply(err); }

      if (!user) {
        return reply(Boom.notFound('Document not found.'));
      }

      return reply({ message: 'Success.' });
    });
  }
};
