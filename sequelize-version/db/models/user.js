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
    name: DataTypes.STRING,
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
    defaultScope: {
      where: {
        isActive: true
      }
    },
    getterMethods: {
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
        this.setDataValue('name', fullname);
        this.setDataValue('firstName', names[0]);
        this.setDataValue('lastName', names[1]);
      }
    },
    classMethods: {
      // associate: function (models) {
        // associations can be defined here
        // User.hasOne(models.Session);
      // }
    },
    
    indexes: [ {unique: true, fields: [ 'id', 'google_id', 'email' ]} ],

    timestamps: true,
    paranoid: true,
    
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

  // instance level methods in latest sequelize version
  User.prototype.generateHash = function (password) {
    return Bcrypt.hashSync(password, Bcrypt.genSaltSync(8), null);
  };
  
  User.prototype.validPassword = function (password) {
    return Bcrypt.compareSync(password, this.password);
  };

  return User;
};
