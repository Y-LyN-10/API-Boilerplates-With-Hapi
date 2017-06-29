'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        unique: true
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
        validate: {
          notEmpty: true,
          len: [2,255]
        }
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        primaryKey: true,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
          len: [5,255]
        }
      },
      password: {
        allowNull: true,
        type: Sequelize.STRING,
        validate: {
          notEmpty: true
        }
      },
      isActive: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isAdmin: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      scope: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: 'user'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Users');
  }
};



