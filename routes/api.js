let express = require('express');
let router = express.Router();

const {authenticateUser, asyncHandler} = require('./helpers');
const User = require('../models').User;
const Course = require('../models').Course;

/* GET show API instructions. */
router.get('/', function(req, res, next) {
  res.json({ 
    welcome: "You have made it to the REST API project!",
  })
});

/* GET current user */
router.get('/users', authenticateUser, asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.currentUser, {
    attributes: { exclude: ['password', 'createdAt', 'updatedAt'] } 
  });
  res.status(200).json({ user });
}));

/* POST add new user */
router.post('/users', asyncHandler(async (req, res, next) => {
  await User.create(req.body);
  res.location('/').status(201).end();
}));

/* GET all courses and associated user */
router.get('/courses', asyncHandler(async (req, res, next) => {
  const courses = await Course.findAll({
    include: [{ 
      model: User,
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }  
    }], 
    order: [[ "title", "DESC" ]],
    attributes: { exclude: ['createdAt', 'updatedAt', 'userId'] } 
  });
  res.status(200).json({ courses });
}));

/* GET specific course and associated user */
router.get('/courses/:id', asyncHandler(async (req, res, next) => {
  const course = await Course.findByPk(req.params.id, {
    attributes: { exclude: ['createdAt', 'updatedAt', 'userId'] }, 
    include: [{ 
      model: User,
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }  
    }], 
  });
  course
  ? res.status(200).json({ course })
  : res.status(404).json({ error: "No such course exists" });
}));

/* POST create a new course */
router.post('/courses', authenticateUser, asyncHandler(async (req, res, next) => {
  let course = await Course.create(req.body);
  res.location(`/api/courses/${course.dataValues.id}`).status(201).end();
}));

/* PUT update course */
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res, next) => {
  let course = await Course.findByPk(req.params.id, {
    include: [{ model: User }]
  });
  if (course) {
    if (course.User.dataValues.id === req.currentUser) {
      await course.update(req.body);
      res.status(204).end();

    } else res.status(403).json({ message: `You don't have permission to update this course` }).end();

  } else res.status(404).json({ error: "No such course exists" }).end();
}));

/* DELETE delete course */
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res, next) => {
  const course = await Course.findByPk(req.params.id, {
    include: [{ model: User }]
  });
  if(course) {
    if (course.User.dataValues.id === req.currentUser) {
      await course.destroy();
      res.status(204).end();

    } else res.status(403).json({ message: `You don't have permission to delete this course` });

  } else res.status(404).json({ error: "No such course exists" });
}));

module.exports = router;
