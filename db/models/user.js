'use strict';

const Bcrypt = require('bcrypt');
const Async = require('async');
const Joi = require('joi');
const MongoModels = require('mongo-models');

class User extends MongoModels {
  static generatePasswordHash (password) {
    return Bcrypt.hashSync(password, Bcrypt.genSaltSync(8), null);
  }

  static validPassword (password, hash) {
    return Bcrypt.compareSync(password, hash);
  }

  static create (profile, strategy, callback) {
    // TODO: Add validation for mentormate.com domain. It's in profile.domain

    // base
    const user = {
      scope: 'user',
      isActive: true,
      timeCreated: new Date()
    };

    if (strategy === 'local') {
      user.email    = profile.email.toLowerCase();
      user.name     = profile.name;
      user.password = profile.password;
    }

    // if authenticated via google
    if (strategy === 'google') {
      user.email = profile.emails[0].value.toLowerCase();
      user.name  = profile.name.givenName + ' ' +  profile.name.familyName;

      user.google_profile = {
        emails   : profile.emails,
        firstName: profile.name.givenName,
        lastName : profile.name.familyName,
        id       : profile.id,
        image    : profile.image.url,
        language : profile.language
      };
    }

    Joi.validate(user, this.schema, (err, value) => {
      if (err)

        // FIXME: In development. Just log the error for now
        {
        console.log(err);
      }

      // TODO: Filter the response keys and do not send the password back      
      this.insertOne(value, (err, results) => {
        callback(err, results[0]);
      });
    });
  }

  static findByEmail (email, callback) {
    const query = { email: email.toLowerCase() };
    this.findOne(query, callback);
  }

  constructor (attrs) {
    super(attrs);
  }

}

User.collection = 'users';

User.schema = Joi.object().keys({
  _id: Joi.object(),
  email: Joi.string().email().lowercase().required(),
  name: Joi.string(),
  password: Joi.string().allow(null),
  google_profile: {
    emails: Joi.array(),
    firstName: Joi.string().allow(''),
    lastName: Joi.string().allow(''),
    id: Joi.string(),
    image: Joi.string(),
    language: Joi.string().allow('')
  },
  scope: Joi.string().allow('admin', 'user').default('user'),
  timeCreated: Joi.date(),
  isActive: true
});

User.indexes = [
  { key: { email: 1, unique: true }}
];

module.exports = User;
