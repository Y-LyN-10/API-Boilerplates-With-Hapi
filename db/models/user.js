'use strict';

const Bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoModels = require('mongo-models');

class User extends MongoModels {
  static create(profile, callback) {
    // TODO: Add validation for mentormate.com domain. It's in profile.domain
    
    const user = {
      email     : profile.emails[0].value.toLowerCase(),
      firstName : profile.name.givenName,
      lastName  : profile.name.familyName,
      image     : profile.image.url,
      google_id : profile.id,
      language  : profile.language,
      scope: 'user',
      isActive: true,
      timeCreated: new Date()
    }

    Joi.validate(user, this.schema, (err, value) => {
      if(err) {
        // FIXME: In development. Just log the error for now
        console.log(err);
      }

      this.insertOne(value, (err, results) => {
        callback(err, results[0]);
      });
    });
  }

  static findByEmail(email, callback) {
    const query = { email: email.toLowerCase() };
    this.findOne(query, callback);
  }

  constructor(attrs) {
    super(attrs);
  }

}

User.collection = 'users';

User.schema = Joi.object().keys({
  _id: Joi.object(),
  firstName: Joi.string().allow(''),
  lastName: Joi.string().allow(''),
  google_id: Joi.string().required(),
  image: Joi.string(),
  email: Joi.string().email().lowercase().required(),
  scope: Joi.string().allow('admin', 'user').default('user'),
  timeCreated: Joi.date(),
  language: Joi.string().allow(''),
  isActive: true
});

User.indexes = [
  { key: { username: 1, unique: true } },
  { key: { email: 1, unique: true } }
];

module.exports = User;
