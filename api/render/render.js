'use strict';

module.exports.home = {
  tags: ['view'],
  description: 'Index',
  notes: 'Home page',
  handler: function (request, reply) {
    let username = 'Stranger';

    console.log(request.auth);
    
    if(request.auth.isAuthenticated) {;
      username = request.auth.credentials.name;
    }
    
    reply.view('index', {username});
  }
};

module.exports.login = {
  tags: ['view', 'auth'],
  description: 'Login',
  notes: 'Login Page',
  handler: function (request, reply) {
    let isLoggedIn = false;
    var loginURI = request.server.generate_google_oauth2_url();

    console.log(request.auth, request.headers);
    
    reply.view('login', {isLoggedIn: request.auth.isAuthenticated, loginURI});
  }
};

module.exports.resetPassword = {
  tags: ['view', 'password'],
  description: 'Reset Password',
  notes: 'Reset Password Page',
  auth: false,
  handler: function (request, reply) {
    reply.view('reset-password');
  }
};
