'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  
  class User extends Model {}

  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'A first name is required' },
        notEmpty: { msg: 'A first name is required' }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'A last name is required' },
        notEmpty: { msg: 'A last name is required' }
      },
    },
    emailAddress: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: { msg: `'User is already found in the system'` },
      validate: {
        notNull: { msg: 'An email is required' },
        notEmpty: { msg: 'An email is required' },
        isEmail: { msg: 'Please enter a valid email' }
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'A password is required' },
        notEmpty: { msg: 'A password is required' },
        len: {
          arg: [6, 20],
          msg: 'Password must be between 6 and 20 characters'
        },
        is: {
          arg: /[A-Z]/,
          msg: 'Password must contain at least one capital letter'
        },
        is: {
          arg: /[a-z]/,
          msg: 'Password must contain at least one lowercase letter'
        },
        is: {
          arg: /[^\d\w\s]/,
          msg: 'Password must contain at least one special character'
        },
        is: {
          arg: /\d/,
          msg: 'Password must contain at least one number'
        },
        set(value) {
          this.setDataValue('password', bcrypt.hashSync(value, 10));
        }
      },
    }
  }, { sequelize });

  User.associate = (models) => {
    User.Course = User.hasMany(models.Course)
  };

  return User;
}