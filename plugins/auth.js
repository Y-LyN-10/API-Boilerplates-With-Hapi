'use strict';

const JWT  = require('jsonwebtoken');
const Boom = require('boom');
const Joi  = require('joi');
const uuid = require('uuid/v4');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,255}$/;
const RESET_PASS_SECRET = 'add another ENV variable later';

exports.register = function (server, pluginOptions, next) {
  const generateResetPasswordToken = function(user, done) {
    let session = {
      id: user._id,
      exp: Date.now() / 1000 + (60 * 30) * 12 // 6 hours
    };

    let resetPasswordToken = JWT.sign(session, RESET_PASS_SECRET, {algorithm: 'HS256'});

    done(resetPasswordToken);
  };
  
  const generateTokens = function (user, done) {
    let session = {
      email : user.email,
      name  : user.name,
      id    : user._id,

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
  };

  const authenticate = function (request, account, done) {
    const sid = uuid();
    account.sid = sid;
    request.yar.set(account._id.toString(), {account});

    server.methods.generateTokens(account, tokens => {
      done(tokens);
    });
  };

  const validateToken = function (decoded, request, callback) {
    if (request.yar.get(decoded.id)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
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
        // TODO: Test that! Maybe request.auth.credentials should be ckecked
        if (request.auth.isAuthenticated) {
          return reply({message: 'Already logged in!'});
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
      auth: false,
      notes: 'Autnenticate with email and password to request JWT access token',
      plugins: { 'hapi-rate-limit': { pathLimit: 3 } },
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
        const User = request.server.plugins['hapi-mongo-models'].User;
        const body = request.payload;

        // Validations
        if (request.auth.isAuthenticated) {
          return reply('Already logged in !');
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

              User.findById(decoded.id, (err, user) => {
                if (err) return reply(err);
                if (!user) return reply(Boom.notFound('User not found.'));

                server.methods.authenticate(request, user, tokens => {
                  return reply(tokens).header('Authorization', 'Bearer ' + tokens.accessToken);
                });
              });
            });
          });
        } else {
          User.findByEmail(body.email, (err, user) => {
            if (err) return reply(err);
            
            if (!user || !User.validPassword(body.password, user.password)) {
              return reply(Boom.badRequest('Sorry, wrong email or password'));
            }

            server.methods.authenticate(request, user, tokens => {
              reply(tokens).header('Authorization', 'Bearer ' + tokens.accessToken);
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
        request.yar.clear(request.auth.credentials.id);
        reply('User successfully logged out');
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/auth/forgotPassword',
    config: {
      tags: ['api', 'auth', 'password'],
      description: 'Forgot Password',
      auth: false,
      notes: 'Generate temporary URI that allows to set a new password',
      plugins: { 'hapi-rate-limit': { pathLimit: 5 } },
      validate: {
        payload: Joi.object()
          .keys({ email: Joi.string().email().required() })
      },
      handler: function (request, reply) {
        const User = request.server.plugins['hapi-mongo-models'].User;
      
        User.findByEmail(request.payload.email, (err, user) => {
          if (err) return reply(err);
          
          if (!user) {
            // Please, use the following reply when ready!
            // return reply(`Email is sent to ${request.payload.email} if that user exists`);
            return reply(Boom.notFound('User with this email does not exist'));
          }

          generateResetPasswordToken(user, token => {
            const resetPasswordRoute = '/auth/resetPassword?token=';  
            const uri = request.connection.info.protocol 
                  + '://' 
                  + request.info.host 
                  + resetPasswordRoute
                  + token;
            
            // TODO: Implement node-mailer and sent it by email
            
            reply({uri});
          });
        });
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/auth/resetPassword',
    config: {
      tags: ['api', 'auth'],
      description: 'Set a new password',
      auth: false,
      notes: 'Set a new password using temporary token, requested by the user',
      validate: {
        payload: Joi.object()
          .keys({
            token: Joi.string().required(),
            password: Joi.string().regex(passwordRegex).required(),
            passwordConfirmation: Joi.string().min(8).max(200).required().valid(Joi.ref('password'))
          })
      },
      handler: function (request, reply) {
        const User = request.server.plugins['hapi-mongo-models'].User;

        JWT.verify(request.payload.token, RESET_PASS_SECRET, {algorithm: 'HS256'}, function (err, valid) {
          if (err) return reply(Boom.unauthorized(err));

          console.log('error?', err);
          
          const decoded = JWT.decode(request.payload.token);
          const id = decoded.id;
          const update = {
            password: User.generatePasswordHash(request.payload.password)
          };

          User.findByIdAndUpdate(id, { $set: update }, (err, user) => {
            if (err) return reply(err);
            if (!user) return reply(Boom.notFound('User not found'));

            // TODO: Immediately invalidate the token after usage
            reply(user);
          });
        });
      } 
    }
  });
  
  next();
};

exports.register.attributes = {
  name: 'auth'
};
