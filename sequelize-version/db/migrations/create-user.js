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
      google_id: {
        allowNull: true,
        primaryKey: false,
        type: Sequelize.STRING,
        unique:true
      },
      name: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      firstName: {
        allowNull: true,
        type: Sequelize.STRING,
        validate: {
          notEmpty: true,
          len: [2,255]
        }
      },
      lastName: {
        allowNull: true,
        type: Sequelize.STRING,
        validate: {
          notEmpty: true,
          len: [2,255]
        }
      },
      image: {
        allowNull: true,
        type: Sequelize.STRING,
        validate: {
          isUrl: { msg: 'Invalid URL' }
        }
      },
      language: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: 'en'
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
        type: Sequelize.ENUM('user', 'admin'),
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
      }, deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Users');
  }
};
