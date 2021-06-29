'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  
  class Course extends Sequelize.Model {}

  Course.init({
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: Sequelize.STRING,
      validate: {
        notEmpty: {
          msg: 'A course title is required'
        }
      }
    },
    description: {
      type: Sequelize.TEXT,
      validate: {
        notEmpty: {
          msg: 'A course description is required'
        },
        len: {
          arg: [20, 2000],
          msg: '"Course Description" should be between 20 and 2000 characters long '
        }
      },
    },
    estimatedTime: Sequelize.STRING,
    materialsNeeded: Sequelize.STRING,
    userId : Sequelize.INTEGER
  }, { sequelize });

  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      as: 'user', // alias
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
    });
  };

  return Course;
}