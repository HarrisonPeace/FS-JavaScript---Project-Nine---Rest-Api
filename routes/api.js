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
  const user = await User.findByPk(req.currentUser);
  console.log(user);
  res.status(200).json({
    name: `${user.firstName} ${user.lastName}`,
    email: user.emailAddress
  });
}));

/* POST add new user */
router.post('/users', asyncHandler(async (req, res, next) => {
  let user = await User.create(req.body);
  res.status(201).end();
}));

/* GET all courses and associated user */
router.get('/courses', asyncHandler(async (req, res, next) => {
  const coursesInfo = await Course.findAll({
    include: [{ model: User }], 
    order: [[ "title", "DESC" ]] 
  });
  let courses = coursesInfo.map(course => {
    return {
      title: course.title,
      description: course.description,
      estimatedTime: course.estimatedTime,
      materialsNeeded: course.materialsNeeded,
      user: `${course.User.dataValues.firstName} ${course.User.dataValues.lastName}`,
      userEmailAddress: course.User.dataValues.emailAddress
    }
  })
  res.status(200).json({ courses });
}));

/* GET specific course and associated user */
router.get('/courses/:id', asyncHandler(async (req, res, next) => {
  const course = await Course.findByPk(req.params.id, {
    include: [{ model: User }]
  });
  course
  ? res.status(200).json({ 
    title: course.title,
    description: course.description,
    estimatedTime: course.estimatedTime,
    materialsNeeded: course.materialsNeeded,
    user: `${course.User.dataValues.firstName} ${course.User.dataValues.lastName}`,
    userEmailAddress: course.User.dataValues.emailAddress
  })
  : res.status(404).json({ error: "No such course exists" });
}));

/* POST create a new course */
router.post('/courses', authenticateUser, asyncHandler(async (req, res, next) => {
  let course = await Course.create(req.body);
  res.status(201).end();
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
c
    } else res.status(403).json({ message: `You don't have permission to update this course` });

  } else res.status(404).json({ error: "No such course exists" });
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
