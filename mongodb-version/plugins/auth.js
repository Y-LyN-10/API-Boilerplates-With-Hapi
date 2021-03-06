'use strict';

const JWT  = require('jsonwebtoken');
const Boom = require('boom');
const Joi  = require('joi');
const uuid = require('uuid/v4');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,255}$/;
const RESET_PASS_SECRET = 'add another ENV variable later';

exports.register = function (server, pluginOptions, next) {
  const redisInstance = server.plugins.redis.client;

  const generateResetPasswordToken = function (user, done) {
    let session = {
      id: user._id,
      exp: Date.now() / 1000 + (60 * 20) // 20 minutes
    };

    let resetPasswordToken = JWT.sign(session, RESET_PASS_SECRET, {algorithm: 'HS256'});

    done(resetPasswordToken);
  };

  const generateTokens = function (user, done) {
    let session = {
      email : user.email,
      name  : user.name,
      id    : user._id,
      sid   : user.sid,

      // Scope determines user's access rules for auth
      scope : [ user.scope || (user.isAdmin ? 'admin' : 'user') ]
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
    const sid = uuid().toString();
    account.sid = sid;

    const ttl = 60 * 45; // 45 minutes in seconds

    redisInstance.set(sid, JSON.stringify(account), 'EX', ttl, (err) => {
      if (err) server.log(['err', 'redis'], err); return;
    });

    server.methods.generateTokens(account, tokens => {
      done(tokens);
    });
  };

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
        // TODO: Test that! Maybe request.auth.credentials should be ckecked
        if (request.auth.isAuthenticated) {
          return reply(Boom.forbidden({message: 'Already logged in!'}));
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
      plugins: { 'hapi-rate-limit': { pathLimit: 10 } }, // limits even if the requests are successful
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

        // Validations - check for abailable session maybe)
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
        redisInstance.DEL(request.auth.credentials.sid);
        reply.redirect(request.query.next);
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/auth/forgotten',
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

          if (user) {
            generateResetPasswordToken(user, token => {
              const resetPasswordRoute = '/reset-password?token=';
              const uri = request.connection.info.protocol +
                    '://' +
                    request.info.host +
                    resetPasswordRoute +
                    token;

              const transporter = request.server.plugins.nodemailer.client;

              // TODO: Refactoring. Load email templates from somewhere else
              let options = {
                from: '"MentorMate Server" <happy.server@mentormate.com>',
                to: request.payload.email,
                subject: 'Forgot your password?',
                html: `<p>Hello. If you forgot your password, you can restore it using the following <a href="${uri}">LINK</a></p><br/><br/><p>In case that the URL is blocked by your mail client, please copy the following address into your browser: ${uri}</p>`,
                text: ''
              };

              transporter.sendMail(options, (sendEmailError, info) => {
                if (sendEmailError) request.server.log([], sendEmailError);
                request.server.log([], `Message ${info.messageId} sent: ${info.response}`);
              });
            });
          }

          // Note: If the service is not working, we are lying the users that the email is sent
          reply(`Email is sent to ${request.payload.email} (if that user exists)`);
        });
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/auth/reset',
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

        /* TODO: Integrate server-side checking for reCAPTCHA

           When your users submit the form where you integrated reCAPTCHA, you'll get as
           part of the payload a string with the name "g-recaptcha-response". In order to
           check whether Google has verified that user, send a POST request with these
           parameters:

           URL: https://www.google.com/recaptcha/api/siteverify
           secret (required)	6LdzJyUUAAAAANAnox4Voy-oMfUQ4z9I12SJd0v1
           response (required)	The value of 'g-recaptcha-response'.
           remoteip	        The end user's ip address.
        */

        JWT.verify(request.payload.token, RESET_PASS_SECRET, {algorithm: 'HS256'}, function (err, valid) {
          if (err) return reply(Boom.unauthorized(err));

          const decoded = JWT.decode(request.payload.token);
          const id = decoded.id;
          const update = {
            password: User.generatePasswordHash(request.payload.password)
          };

          User.findByIdAndUpdate(id, { $set: update }, (err, user) => {
            if (err) return reply(err);
            if (!user) return reply(Boom.notFound('User not found'));

            // TODO: Immediately invalidate the token after usage

            const transporter = request.server.plugins.nodemailer.client;

            // FIXME: in case there is no email address, the server shuts down due to error

            let options = {
              from: '"MentorMate Server" <happy.server@mentormate.com>',
              to: user.email,
              subject: 'Yout password has been changed',
              html: '<p>Your password in "Hapi API Boilerplate Project" has been changed successfully.</p><br/><p>If you did not change your password, then you\'re screwed.</p>',
              text: ''
            };

            transporter.sendMail(options, (sendEmailError, info) => {
              if (sendEmailError) request.server.log([], sendEmailError);
              request.server.log([], `Message ${info.messageId} sent: ${info.response}`);
            });

            // TODO on front-end: redirect to the login page
            // TODO: Also for the front-end: The page that accepts the new passwords from the user should not be refreshable in the user browser. E.g remove the query strings and keep the token in the memory
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
