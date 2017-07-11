'use strict';

const Bcrypt = require('bcrypt');

module.exports = function (sequelize, DataTypes) {
  let Bar = sequelize.define('Bar', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: DataTypes.STRING,
    address: DataTypes.STRING
  }, {
    // classMethods: {
      // associate: function (models) {
        // associations can be defined here
        // Bar.hasOne(models.Admin);
        // Bar.hasMany(models.Visitor);
      // }
    // },
    
    indexes: [ {unique: true, fields: [ 'id' ]} ],
    
    timestamps: true,
    // paranoid: false,
    
    // instanceMethods: {
      
    // },
    
    // hooks: {
    //   beforeCreate: function (user, options) {
    //     return;
    //   },
    //   beforeUpdate: function (user, options) {
    //     return;
    //   }
    // }
  });

  return Bar;
};
