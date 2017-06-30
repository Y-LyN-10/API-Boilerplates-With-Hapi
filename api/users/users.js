'use strict';

const Boom  = require('boom');
const Joi   = require('joi');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,255}$/;

module.exports.list = {
  tags: ['api', 'users'],
  auth: {scope: [ 'admin' ]},
  description: 'List users',
  notes: 'List non-admin (and active) users with pagination. See the defaults below',
  validate: {
    query: {
      page: Joi.number().integer().min(1).max(100).default(1),
      pageSize: Joi.number().integer().min(1).max(100).default(30),
      order: Joi.string().valid('name', 'email', '"createdAt" desc', '"createdAt"').default('name')
    }
  },
  handler: function (request, reply) {
    const User = request.server.plugins['hapi-sequelize'].hapidb.models.User;
 
    // Destruct the query params to variables
    const q = request.query;
    const [page, limit, order] = [q.page, q.pageSize, q.order];
    const offset = (limit * (page - 1));

    // make it easier for the FE query building
    const next = `/api/users?page=${page + 1}&limit=${limit}`;
    const prev = `/api/users?page=${page - 1}&limit=${limit}`;

    const criteria = { isActive: true, isAdmin: false };
    const options = {
      where: criteria, limit, offset, order,
      attributes: ['id', 'name', 'email', 'createdAt', 'updatedAt']
    };

    User.count({where:criteria}).then(function (total) {
      User.findAll(options).then(function (items) {
        reply({ page, offset, total, items, next, prev });
      });
    }).catch((err) => reply(err));
 }
};

module.exports.create = {
  tags: ['api', 'users'],
  auth: false,
  description: 'Create a new user',
  notes: 'Create a new user (non-admin) with name, email and password.',
  validate: {
    payload: {
      name: Joi.string().min(2).max(255).required().example('Test User'),
      email: Joi.string().email().required().example('super.tester@hapi-api.lab'),
      password: Joi.string().regex(passwordRegex).required().example('testTEST1'),
      passwordConfirmation: Joi.string().min(8).max(200).required().example('testTEST1').valid(Joi.ref('password'))
    }
  },
  handler: function (request, reply) {
    const User = request.server.plugins['hapi-sequelize'].hapidb.models.User;
    const data = request.payload;
    data.email = data.email.toLowerCase();
    
    User.create(data).then(function (user) {

      // FIXME: research about scopes in sequelize schemas
      let plain = user.get({plain:true});

      delete plain.password;
      delete plain.isAdmin;
      delete plain.isActive;

      reply(plain);

    }).catch((err) => reply(err));
  }
};

module.exports.update = {
  tags: ['api', 'users'],
  auth: {scope: [ 'admin' ]},
  description: 'Update user',
  notes: 'Update an existing non-admin user. See below for details and examples.',
  validate: {
    params: {
      id: Joi.string().guid()
    },
    payload: Joi.object()
      .keys({
        name: Joi.string().min(2).max(255).optional().allow('').example('Carolyn Cox'),
        password: Joi.string().regex(passwordRegex).optional().example('testTEST3'),
        passwordConfirmation: Joi.string().example('testTEST3').valid(Joi.ref('password'))
      })
      .with('password', 'passwordConfirmation')
      .or('name', ['password', 'passwordConfirmation'])
  },
  handler: function (request, reply) {
    const User = request.server.plugins['hapi-sequelize'].hapidb.models.User;
    const id   = request.params.id;
    const data = request.payload;

    const attributes = ['id', 'name', 'email', 'isAdmin', 'createdAt', 'updatedAt'];

    User.find({where: {id}, attributes}).then(function (user) {
      if (user === null) {
        return reply(Boom.badRequest('User not found'));
      }

      if (user.get({plain:true}).isAdmin) {
        return reply(Boom.forbidden('Admin user can not be updated'));
      }

      return user.update(data).then(function (updated) {

        /* TODO: Find a better way to hide password in response - always.
           Like, having a 'public profile' set of attributes by default */

        let plain = updated.get({plain: true});
        if (plain.password) {
          plain.passwordUpdated = true;
          delete plain.password;
        } else {
          plain.passwordUpdated = false;
        }

        delete plain.isAdmin;

        return reply(plain);
      });
    }).catch((err) => {
      return reply(err);
    });
  }
};

module.exports.delete = {
  tags: ['api', 'users'],
  auth: {scope: [ 'admin' ]},
  description: 'Delete user',
  /*eslint-disable */
  notes: 'Delete user by ID (softly - updating the "isActive" property). User will not be able to login into the system anymore and user\'s email address can not be used for new accounts',
  /*eslint-enable */
  validate: {
    params: {
      id: Joi.string().guid()
    }
  },
  handler: function (request, reply) {
    const User = request.server.plugins['hapi-sequelize'].hapidb.models.User;
    const Session = request.server.plugins['hapi-sequelize'].hapidb.models.Session;
    const id   = request.params.id;

    const attributes = ['id', 'name', 'email', 'isActive', 'createdAt', 'updatedAt'];

    User.find({where: {id}, attributes}).then(function (user) {
      if (user === null) {
        return reply(Boom.notFound('User not found'));
      }

      return user.update({isActive: false}).then(function (updated) {
        // Destroy user's session in case he is currently logged in
        request.yar.clear(id);
        
        return reply(updated);
      });
    }).catch((err) => {
      return reply(err);
    });
  }
};
