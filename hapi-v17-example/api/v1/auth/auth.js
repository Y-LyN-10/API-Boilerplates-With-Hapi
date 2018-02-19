const Joi   = require('joi');
const Boom  = require('boom');

module.exports.login = {
  tags: ['api', 'auth'],
  description: 'Login',
  auth: false,
  notes: 'Authenticate with email/password',
  handler: function (request, h) {
    return Boom.notImplemented();
  }
};

module.exports.logout = {
  description: 'Logout',
  notes: 'Remove cookies and redirect to the "next" page, given as query param',
  tags: ['api', 'auth'],
  handler: function (request, h) {
    request.cookieAuth.clear();
    let response = h.unstate('session');
    return response.redirect('/');
  }
};