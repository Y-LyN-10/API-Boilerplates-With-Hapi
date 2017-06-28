'use strict';

const Bcrypt = require('bcrypt');

module.exports = function (sequelize, DataTypes) {
  let User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    scope: {
      type: DataTypes.STRING,
      defaultValue: 'user'
    }
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
        // User.hasOne(models.Session);
      }
    },
    indexes: [ {unique: true, fields: [ 'email' ]} ],
    // timestamps: true,
    // paranoid: false,
    instanceMethods: {
      generateHash: function (password) {
        return Bcrypt.hashSync(password, Bcrypt.genSaltSync(8), null);
      },
      validPassword: function (password) {
        return Bcrypt.compareSync(password, this.password);
      }
    },
    hooks: {
      beforeCreate: function (user, options) {
        user.password = user.generateHash(user.password);
        return;
      },
      beforeUpdate: function (user, options) {
        if (user.password) {
          user.password = user.generateHash(user.password);
        }

        return;
      }
    }
  });

  return User;
};

// Temporary dababase mock to implement auth and session storage logic in a database-independent way

const users = [{
  id: 1,
  email: 'john@company.com',
  password: 'supersafe',
  name: 'John'
}, {
  id: 2,
  email: 'jack@company.com',
  password: 'megasafe',
  name: 'Jack'
}];

module.exports = {
  findAll: () => (users.map((user) => ({ id: user.id, email: user.email, name: user.name }))),
  findByEmail: (email) => (
    users.find((user) => user.email === email)
  ),
  create: (user, cb) => {
    users.push(user);
    cb(null, user);
  }
};
