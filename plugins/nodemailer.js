'use strict';

const nodemailer = require('nodemailer');

exports.register = function (server, pluginOptions, next) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport(pluginOptions);

  // verify connection configuration
  transporter.verify(function (err, success) {
    if (err) return next(err);
    next();
  });

  // Make it accessible in requests via "request.server.plugins.nodemailer.client"
  server.expose('client', transporter);
};

exports.register.attributes = {
  name: 'nodemailer'
};
