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
    // base
    const user = {
      scope: 'user',
      isActive: true,
      isAdmin: false,
      profile: {},
      timeCreated: new Date()
    };

    if (strategy === 'local') {
      user.email    = profile.email.toLowerCase();
      user.password = profile.password;
      user.profile.firstName = profile.firstName;
      user.profile.lastName = profile.lastName;
    }

    // if authenticated via google
    if (strategy === 'google') {
      console.log(profile);

      user.email = profile.emails[0].value.toLowerCase();
      user.google_id = profile.id;

      user.profile = {
        emails   : profile.emails,
        firstName: profile.name.givenName,
        lastName : profile.name.familyName,
        gender   : profile.gender,
        language : profile.language,
        image    : profile.image.url,
        ageRange : profile.ageRange
      };
    }

    // To set default values
    Joi.validate(user, this.schema, (err, value) => {
      if (err) console.log(err); //

      this.insertOne(value, (err, results) => {
        delete results[0].password;
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
  google_id:Joi.string(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().allow(null),
  profile: {
    emails: Joi.array(),
    firstName: Joi.string().allow(''),
    lastName: Joi.string().allow(''),
    gender: Joi.string(),
    image: Joi.string(),
    language: Joi.string(),
    ageRange: Joi.object()
  },
  scope: Joi.string().allow('admin', 'user').default('user'),
  timeCreated: Joi.date(),
  isActive: true,
  isAdmin: false
});

User.indexes = [
  { key: { email: 1, unique: true }}
];

module.exports = User;
