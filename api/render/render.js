'use strict';

module.exports.home = {
  tags: ['view'],
  description: 'Index',
  notes: 'Home page',
  auth: false,
  handler: function (request, reply) {
    reply.view('index');
  }
};

module.exports.login = {
  tags: ['view', 'auth'],
  description: 'Login',
  notes: 'Login Page',
  auth: false,
  handler: function (request, reply) {
    reply.view('login');
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
