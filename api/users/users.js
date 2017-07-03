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
        return reply({ page, offset, total, items, next, prev });
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
      let created = user.profile;
      created.createdAt = user.get('createdAt');
      
      return reply(created).code(201);
    }).catch((err) => {
      return reply({
        statusCode: 400,
        message: err.message,
        errors: err.errors
      }).code(400);
    });
  }
};

module.exports.viewProfile = {
  tags: ['api', 'users'],
  auth: {scope: [ 'user', 'admin' ]},
  description: 'My Profile',
  notes: 'User can request his own profile data on this route',
  handler: function (request, reply) {
    const User = request.server.plugins['hapi-sequelize'].hapidb.models.User;
    const id   = request.auth.credentials.id.toString();

    const attributes = ['id', 'name', 'email', 'createdAt', 'updatedAt'];

    User.find({where: {id}, attributes}).then(function (user) {
      if (user === null) {
        return reply(Boom.badRequest('User not found'));
      }

      return reply(user);

    }).catch((err) => reply(err));
  }
};

module.exports.updateProfile = {
  tags: ['api', 'users'],
  auth: {scope: [ 'admin' ]},
  description: 'Update user',
  notes: 'Update an existing non-admin user. See below for details and examples.',
  validate: {
    payload: {
      name: Joi.string().min(2).max(255).optional().allow('').example('Foxy Lady')
    }
  },
  handler: function (request, reply) {
    const User = request.server.plugins['hapi-sequelize'].hapidb.models.User;
    const id   = request.auth.credentials.id.toString();
    const data = request.payload;

    const attributes = ['id', 'name', 'email', 'isAdmin', 'createdAt', 'updatedAt'];

    User.find({where: {id}, attributes}).then(function (user) {
      if (user === null) {
        return reply(Boom.badRequest('User not found'));
      }

      return user.update(data).then(function (updated) {

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
      return reply({
        statusCode: 400,
        message: err.message,
        errors: err.errors
      }).code(400);
    });
  }
};

module.exports.updatePassword = {
  tags: ['api', 'users'],
  auth: {scope: [ 'admin' ]},
  description: 'Update user',
  notes: 'Update an existing non-admin user. See below for details and examples.',
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
    const User = request.server.plugins['hapi-sequelize'].hapidb.models.User;
    const id   = request.auth.credentials.id.toString();
    const data = request.payload;

    User.find({where: {id}}).then(function (user) {
      if (user === null) {
        return reply(Boom.badRequest('User not found. This is strange'));
      }

      if(!user.validPassword(data.oldPassword)) {
        return reply(Boom.badRequest('Sorry, provided old password is incorrect'));
      }
      
      return user.update({password: data.newPassword}).then(function (updated) {

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
      return reply({
        statusCode: 400,
        message: err.message,
        errors: err.errors
      }).code(400);
    });
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
      return reply({
        statusCode: 400,
        message: err.message,
        errors: err.errors
      }).code(400);
    });
  }
};

module.exports.get = {
  tags: ['api', 'users'],
  auth: {scope: [ 'admin' ]},
  description: 'Get user',
  notes: 'Read single user\'s data',
  validate: {
    params: {
      id: Joi.string().guid()
    }
  },
  handler: function (request, reply) {
    const User = request.server.plugins['hapi-sequelize'].hapidb.models.User;
    const id   = request.params.id;
    const data = request.payload;

    const attributes = ['id', 'name', 'email', 'isAdmin', 'isActive', 'scope', 'createdAt', 'updatedAt'];

    User.find({where: {id}, attributes}).then(function (user) {
      if (user === null) {
        return reply(Boom.badRequest('User not found'));
      }

      return reply(user);
      
    }).catch((err) => reply(err));
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
        // TODO: Destroy user's session in case he is currently logged in. For that, session ID is needed and it's contained only in the token. So, it should be added to the user's model as well
        
        return reply(updated);
      });
    }).catch((err) => {
      return reply({
        statusCode: 400,
        message: err.message,
        errors: err.errors
      }).code(400);
    });
  }
};
