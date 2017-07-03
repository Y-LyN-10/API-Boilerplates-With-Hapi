'use strict';

const Bcrypt = require('bcrypt');

module.exports = function (sequelize, DataTypes) {
  let User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    google_id: DataTypes.STRING,
    name: {
      type: new DataTypes.VIRTUAL(DataTypes.STRING, ['firstName', 'lastName']),
      get: function() {
        return this.get('firstName') + ' ' + this.get('lastName');
      },
      set: function(fullName) {
        let names = fullName.split(' ');
        this.setDataValue('firstName', names[0]);
        this.setDataValue('lastName', names[1]);
      }
    },
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    image: DataTypes.STRING,
    language: DataTypes.STRING,
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
    getterMethods: {
      name: function() {
        return this.firstName + ' ' + this.lastName;
      },
      profile: function() {
        return {
          id: this.id,
          email: this.email,
          fullName: this.fullName,
          image: this.image
        }
      },
      preferences: function() {
        return {
          language: this.language
        }
      }
    },
    setterMethods: {
      name: function(fullname) {
        let names = fullname.split(' ');
        this.firstName = split[0];
        this.lastName = split[1];
      }
    },
    
    // classMethods: {
      // associate: function (models) {
        // associations can be defined here
        // User.hasOne(models.Session);
      // }
    // },
    
    indexes: [ {unique: true, fields: [ 'id', 'google_id', 'email' ]} ],
    
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
        if(user.password) {
          user.password = user.generateHash(user.password);
        }
        
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
