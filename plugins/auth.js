'use strict';

const JWT  = require('jsonwebtoken');
const Boom = require('boom');
const Joi  = require('joi');
const uuid = require('uuid/v4');

exports.register = function (server, pluginOptions, next) {
  const redisInstance = server.plugins.redis.client;

  const generateTokens = function(user, done) {
    let session = {
      email : user.email,
      name  : user.name,
      id    : user.id,
      sid   : user.sid,

      // Scope determines user's access rules for auth
      scope : [ user.scope || user.isAdmin ? 'admin' : 'user' ]
    };

    // Short session - 30 minute
    session.exp = Date.now() / 1000 + (60 * 30);
    let accessToken = JWT.sign(session, process.env.JWT_SECRET, {algorithm: 'HS512'});

    // Refresh session - 15 more minutes
    session.exp += 60 * 15;
    let refreshToken = JWT.sign(session, process.env.JWT_SECRET, {algorithm: 'HS512'});

    done({ accessToken, refreshToken });
  }
  
  const authenticate = function(request, account, done) {
    const sid = uuid().toString();
    account.sid = sid;

    const ttl = 60 * 45; // 45 minutes in seconds

    redisInstance.set(sid, JSON.stringify(account), 'EX', ttl, (err) => {
      if (err) server.log(['err', 'redis'], err); return;
    });

    server.methods.generateTokens(account, tokens => {
      done(tokens);
    });
  }
  
  const validateToken = function (decoded, request, callback) {
    redisInstance.get(decoded.sid.toString(), (err, reply) => {
      if (err || !reply) callback(null, false);
      callback(null, true);
    });
  };

  server.method('authenticate', authenticate);

  server.method('generateTokens', generateTokens);
  
  // JWT Token Auth - required for all routes by default
  server.auth.strategy('jwt', 'jwt', true, {
    key: pluginOptions.secret,
    validateFunc: validateToken,
    verifyOptions: {
      ignoreExpiration: false,
      algorithms: [ 'HS512' ]
    },
    errorFunc: function (err) {
      let errorContext = {
        errorType: 'unauthorized',
        message: err.message
      };

      return errorContext;
    }
  });

  server.route({
    method: 'GET',
    path: '/auth/login',
    config: {
      tags: ['api', 'auth'],
      description: 'Login via Google',
      auth: false,
      notes: 'Autnenticate with Google',
      handler: function (request, reply) {
        if (request.auth.isAuthenticated) {
          return reply(Boom.forbidden('Already logged in!'));
        }

        var url = request.server.generate_google_oauth2_url();
        reply.redirect(url);
      }
    }
  });
  
  server.route({
    method: 'POST',
    path: '/auth/login',
    config: {
      tags: ['api', 'auth'],
      description: 'Login',
      auth: {mode: 'try'},
      notes: 'Autnenticate with email and password to request JWT access token',
      plugins: {
        'hapi-rate-limit': { pathLimit: 10 }
      },
      validate: {
        payload: Joi.object()
          .keys({
            email: Joi.string().email().example('admin@hapi-api.lab'),
            password: Joi.string().min(8).max(200).example('testTEST1'),
            refreshToken: Joi.string().optional().allow('')
          })
          .with('email', 'password')
          .without('password', 'refreshToken')
          .or('refreshToken', ['email', 'password'])
      },
      handler: function (request, reply) {
        const User = request.server.plugins['hapi-sequelize'].hapidb.models.User;
        const body = request.payload;
        
        if (request.auth.isAuthenticated) {
          return reply(Boom.forbidden('Already logged in !'));
        }

        if (body.refreshToken) {
          // Validate the refresh token
          JWT.verify(body.refreshToken, pluginOptions.secret, function (jwtErr, decoded) {
            if (jwtErr) {
              return reply(Boom.unauthorized(jwtErr));
            }

            validateToken(decoded, request, function (err, isValid) {
              if (err || !isValid) {
                return reply(Boom.unauthorized('Session expired or has been closed by the user'));
              }

              User.find({where: {id: decoded.id, isActive: true}}).then(function (user) {
                if (user === null) {
                  return reply(Boom.badRequest('User not found'));
                }

                server.methods.authenticate(request, user, tokens => {
                  return reply(tokens).header('Authorization', 'Bearer ' + tokens.accessToken);
                });
              }).catch(err => console.log); // FIXME: reply is called twice when there is err => reply(err)
            });
            
          });
        } else {
          User.findOne({where: {email: body.email.toLowerCase(), isActive: true}}).then(user => {
            if (!user || !user.validPassword(body.password)) {
              return reply(Boom.badRequest('Sorry, wrong email or password'));
            }

            server.methods.authenticate(request, user, tokens => {
              return reply(tokens).header('Authorization', 'Bearer ' + tokens.accessToken);
            });
          });
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/auth/logout',
    config: {
      tags: ['api', 'auth'],
      description: 'Logout',
      notes: 'Log out from the server to force token invalidation and revoke access',
      handler: function (request, reply) {
        redisInstance.DEL(request.auth.credentials.sid);
        return reply.redirect(request.query.next);
      }
    }
  });
                
  next();
};

exports.register.attributes = {
  name: 'auth'
};
