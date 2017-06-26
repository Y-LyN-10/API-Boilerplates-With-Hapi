const JWT = require('jsonwebtoken'); // session stored as a JWT cookie
const Boom = require('boom');

const STRATEGY_GOOGLE = 'google';

module.exports = function (request, reply, googleTokens, profile) {
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

    const User = request.server.plugins['hapi-mongo-models'].User;

    User.findByEmail(session.email, (err, user) => {
      if (err) {
        request.server.log([], err);
        return reply(Boom.badRequest());
      }
      
      // This user already exist in the database
      if (user) {
        // Merge local account with google+
        if(!user.google_id) {
          let update = {
            google_id: profile.id,
            profile: {
              emails   : profile.emails,
              firstName: user.profile.firstName || profile.name.givenName,
              lastName : user.profile.lastName || profile.name.familyName,
              gender   : profile.gender,
              language : profile.language,
              image    : profile.image.url,
              ageRange : profile.ageRange
            }
          }

          util.promisify(User.findByIdAndUpdate).apply(User, [user._id,  {$set: update}]);
        }
        
        request.server.methods.authenticate(request, user, tokens => {
          return reply
            .redirect('/', tokens)
            .header('Authorization', 'Bearer ' + tokens.accessToken);
        });
      } else {
        User.create(profile, STRATEGY_GOOGLE, (err, newUser) => {
          if (err) {
            request.server.log([], err);
            return reply(Boom.badRequest('Failed to create a user'));
          }

          request.server.methods.authenticate(request, newUser, tokens => {
            return reply
              .redirect('/', tokens)
              .header('Authorization', 'Bearer ' + tokens.accessToken);
          });
        });
      }
    });
  } else {
    return reply(Boom.badRequest());
  }
};
