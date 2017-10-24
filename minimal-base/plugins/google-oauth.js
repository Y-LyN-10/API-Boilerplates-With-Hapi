const JWT = require('jsonwebtoken'); // session stored as a JWT cookie
const Boom = require('boom');

module.exports = function (request, reply, tokens, profile) {

  if (profile) {

    // extract the relevant data from Profile to store in JWT object
    let session = {
      email     : profile.emails[0].value,
      firstName : profile.name.givenName,
      lastName  : profile.name.familyName,
      image     : profile.image.url,
      id        : profile.id,
      exp       : Math.floor(new Date().getTime() / 1000) + 7 * 24 * 60 * 60,
      agent     : request.headers['user-agent']
    };

    const User = require('../db/models/user');
    const user = User.findByEmail(session.email);

    console.log(session.email);

    // This user already exist in the database
    if (user) {
      request.server.methods.authenticate(request, user, tokens => {
        return reply(tokens).header('Authorization', 'Bearer ' + tokens.accessToken);
      });
    } else {
      console.log(profile);

      User.create(profile, (err, user) => {
        if (err) {
          request.server.log([], err);
          return reply(Boom.badRequest('Failed to create a user'));
        }

        request.server.methods.authenticate(request, user, tokens => {
          return reply(tokens).header('Authorization', 'Bearer ' + tokens.accessToken);
        });

      });
    }
  } else {
    return reply(Boom.badRequest());
  }
};
