'use strict';

const Boom = require('boom');
const Joi  = require('joi');
const util = require('util');

// Minimum 8 chars total with at least one upper case, one lower case and a digit
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,255}$/;

module.exports.list = {
  tags: ['api', 'users'],
  description: 'List users',
  notes: 'List users with pagination',
  auth: {scope: [ 'admin' ]},
  validate: {
    query: {
      name: Joi.string(),
      isActive: Joi.boolean(),
      scope: Joi.string().valid(['admin', 'user']),
      fields: Joi.string(),
      sort: Joi.string().default('_id'),
      limit: Joi.number().default(20),
      page: Joi.number().default(1)
    }
  },
  handler: function (request, reply) {
    const User  = request.server.plugins['hapi-mongo-models'].User;
    const filterByKeys = ['isActive', 'name', 'scope'];

    // pass only 'search' criteria
    const criteria = filterByKeys.reduce((result, key) => {
      if (request.query[key]) {
        result[key] = request.query[key];
      }

      return result;
    }, {});

    const fields = request.query.fields;
    const sort   = request.query.sort;
    const limit  = request.query.limit;
    const page   = request.query.page;

    User.pagedFind(criteria, fields, sort, limit, page, (err, results) => {
      if (err) return reply(err);
      reply(results);
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
      if (err) return reply(err);

      // TODO: Merge google & local accounts
      if (user) return reply(Boom.conflict('Email already in use.'));

      let data = {
        name: request.payload.firstName + ' ' + request.payload.lastName,
        email: request.payload.email,
        password: User.generatePasswordHash(request.payload.password)
      };

      // Use the local strategy
      User.create(data, 'local', (onCreateError, newUser) => {
        if (onCreateError) return reply(onCreateError);
        reply(newUser).code(201);
      });
    });
  }
};

module.exports.viewProfile = {
  tags: ['api', 'users'],
  description: 'My profile',
  notes: 'User can request his own profile data on this route',
  auth: {scope: ['user', 'admin']},
  handler: function (request, reply) {
    const User = request.server.plugins['hapi-mongo-models'].User;
    const fields = User.fieldsAdapter('name email image timeCreated');
    const id = request.auth.credentials.id.toString();

    // Example how to use promises with Mongo Models:
    util
      .promisify(User.findById)
      .apply(User, [id, fields])
      .then(user => reply(user))
      .catch(err => reply(err));
  }
};

module.exports.updateProfile = {
  tags: ['api', 'users'],
  description: 'Update user',
  auth: {scope: ['user', 'admin']},
  notes: 'Logged in user is able to update his own profile: names and image',
  validate: {
    payload: Joi.object()
      .keys({
        firstName: Joi.string().min(2).max(255).required(),
        lastName: Joi.string().min(2).max(255).required(),
        image: Joi.string().uri().optional()
      })
  },
  handler: function (request, reply) {
    const User = request.server.plugins['hapi-mongo-models'].User;
    const id = request.auth.credentials.id.toString();
    const update = request.payload;

    // TODO: Fix name / firstName + lastName inconsistencies

    User.findByIdAndUpdate(id, { $set: update }, (err, user) => {
      if (err) return reply(err);
      if (!user) return reply(Boom.notFound('User not found'));

      reply(user);
    });
  }
};

module.exports.updatePassword = {
  tags: ['api', 'users'],
  description: 'Update user',
  auth: {scope: ['admin', 'user']},
  notes: 'Logged in user is able to update his own password',
  validate: {
    payload: Joi.object()
      .keys({
        oldPassword: Joi.string().regex(passwordRegex).optional(),
        newPassword: Joi.string().regex(passwordRegex).optional(),
        newPasswordConfirmation: Joi.string().valid(Joi.ref('newPassword'))
      })
      .with('oldPassword', 'newPassword', 'newPasswordConfirmation')
  },
  handler: function (request, reply) {
    const User = request.server.plugins['hapi-mongo-models'].User;
    const id = request.auth.credentials.id.toString();

    /* TODO:
       1. Limit to 3 failed attempts (with wrong old password) in a single day
       2. Send an email that the password had been changed or has 3 failed attempts
       3. More logging: The server should always log attempts to change passwords
       whether they are successful or not. It should log the user's information but
       not any passwords entered or their hashes. It should note whether the change
       succeeded or failed.
       4. Add CAPTCHA
    */

    User.findById(id, (err, user) => {
      if (err) return reply(err);
      if (!user || !User.validPassword(request.payload.oldPassword, user.password)) {
        return reply(Boom.badRequest('Sorry, provided old password is incorrect'));
      }

      const update = {
        password: User.generatePasswordHash(request.payload.newPassword)
      };

      User.findByIdAndUpdate(id, { $set: update }, (err, user) => {
        if (err) return reply(err);
        if (!user) return reply(Boom.notFound('User not found'));

        reply(user);
      });
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
    const fields = User.fieldsAdapter('_id name email image scope isActive timeCreated');
    const id = request.params.id;

    util
      .promisify(User.findById)
      .apply(User, [id])
      .then(user => reply(user))
      .catch(err => reply(err));
  }
};

module.exports.update = {
  tags: ['api', 'users'],
  description: 'Update user',
  auth: {scope: [ 'admin' ]},
  notes: 'Update user\'s data by Administrator',
  validate: {
    params: {
      id: Joi.string() // TODO: Add lib for validation mongoDB object IDs
    },
    payload: Joi.object()
      .keys({
        firstName: Joi.string().min(2).max(255),
        lastName: Joi.string().min(2).max(255),
        // email: Joi.string().email(),
        image: Joi.string().uri().optional(),
        isActive: Joi.boolean(),
        scope: Joi.string().valid(['admin', 'user'])
      })
  },
  handler: function (request, reply) {
    const User = request.server.plugins['hapi-mongo-models'].User;
    const id = request.params.id;
    const update = request.payload;

    // TODO: Fix name / firstName + lastName inconsistencies
    // TODO: Check email for uniqueness

    User.findByIdAndUpdate(id, { $set: update }, (err, user) => {
      if (err) return reply(err);
      if (!user) return reply(Boom.notFound('User not found'));

      reply(user);
    });
  }
};

module.exports.delete = {
  tags: ['api', 'users'],
  description: 'Delete user',
  notes: 'Delete user by ID (soft delete)',
  auth: {scope: [ 'admin' ]},
  validate: {
    params: {
      id: Joi.string()
    }
  },
  handler: function (request, reply) {
    const User = request.server.plugins['hapi-mongo-models'].User;
    const id = request.params.id;

    /* Issue: I deleted my own admin account and was still able to use
              the API with the access token, even though the user does
              not exist anymore */

    // This is not 'soft delete' btw

    User.findByIdAndDelete(id, (err, user) => {
      if (err) return reply(err);
      if (!user) return reply(Boom.notFound('User not found'));

      reply();
    });
  }
};
