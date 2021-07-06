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
      allowNull: false,
      validate: {
        notNull: { msg: 'A course title is required' },
        notEmpty: { msg: 'A course title is required' }
      }
    },
    description: {
      allowNull: false,
      type: Sequelize.TEXT,
      validate: {
        notNull: { msg: 'A course description is required' },
        notEmpty: { msg: 'A course description is required' },
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
    Course.User = Course.belongsTo(models.User);
  };

  return Course;
}