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

  const verifyToken = function (decoded, request, callback) {
    JWT.verify(request.auth.token, pluginOptions.secret, function (err, valid) {
      if (err) { return callback(err, false);}
      validateToken(decoded, request, callback);
    });
  };

  server.method('authenticate', authenticate);

  server.method('generateTokens', generateTokens);
  
  // JWT Token Auth - required for all routes by default
  server.auth.strategy('jwt', 'jwt', true, {
    verifyFunc: verifyToken,
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
          return reply('Already logged in !');
        } else {
          var url = request.server.generate_google_oauth2_url();
          console.log(url);
          return reply.redirect(url);
        }
      }
    }
  });
  
  server.route({
    method: 'POST',
    path: '/auth/login',
    config: {
      tags: ['api', 'auth'],
      description: 'Login',
      auth: false,
      notes: 'Autnenticate with email and password to request JWT access token',
      plugins: {
        'hapi-rate-limit': { pathLimit: 3 }
      },
      validate: {
        payload: Joi.object()
          .keys({
            email: Joi.string().email().example('john@company.com'),
            password: Joi.string().min(8).max(200).example('supersafe'),
            refreshToken: Joi.string().optional().allow('')
          })
          .with('email', 'password')
          .without('password', 'refreshToken')
          .or('refreshToken', ['email', 'password'])
      },
      handler: function (request, reply) {
        const User = require('../db/models/user');

        if (request.auth.isAuthenticated) {
          return reply('Already logged in !');
        }

        if (!request.payload || !request.payload.email || !request.payload.password) {
          return reply(Boom.unauthorized('Email or password invalid'));
        }

        let user = User.findByEmail(request.payload.email);

        if (request.payload.password !== user.password) {
          return reply(Boom.unauthorized('Email or Password invalid'));
        }

        server.methods.authenticate(request, user, tokens => {
          return reply(tokens).header('Authorization', 'Bearer ' + tokens.accessToken);
        });
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
        reply.redirect(request.query.next);
      }
    }
  });
                
  next();
};

exports.register.attributes = {
  name: 'auth'
};
