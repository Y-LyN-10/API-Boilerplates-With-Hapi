const JWT = require('jsonwebtoken'); // session stored as a JWT cookie
const Boom = require('boom');

module.exports = function(request, reply, tokens, profile) {
  
  if(profile) {
    // extract the relevant data from Profile to store in JWT object
    let session = {
      email     : profile.emails[0].value,
      firstName : profile.name.givenName,
      lastName  : profile.name.familyName,
      image     : profile.image.url,
      id        : profile.id,
      exp       : Math.floor(new Date().getTime()/1000) + 7*24*60*60,
      agent     : request.headers['user-agent']
    };

    const User = request.server.plugins['hapi-sequelize'].hapidb.models.User;

    const attributes = ['id', 'name', 'email'];

    User.find({where: {email: session.email}, attributes}).then(function (user) {
      if (user === null) {
        let data = {
          name: session.firstName + ' ' + session.lastName,
          email: session.email,
          google_id: session.id
        };
        
        return User.create(data).then(function (user) {
          let plain = user.get({plain:true});
         
          request.server.methods.authenticate(request, plain, tokens => {
            return reply(tokens).header('Authorization', 'Bearer ' + tokens.accessToken);
          });
          
        }).catch((err) => {
          return reply({
            statusCode: 400,
            message: err.message,
            errors: err.errors
          }).code(400);
        });
      } else {
        // TODO: Update user if found
        request.server.methods.authenticate(request, user, tokens => {
          return reply(tokens).header('Authorization', 'Bearer ' + tokens.accessToken);
        });
      }
    }).catch((err) => reply(err));
  } else {
    return reply(Boom.badRequest());
  }
};
