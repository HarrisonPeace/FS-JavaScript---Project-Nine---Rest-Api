var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const auth = require('basic-auth');

const User = require('../models').User;
const Course = require('../models').Course;

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      if(error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") { // checking the error
        const errors = error.errors.map(err => err.message);
        user = await User.build(req.body);
        res.status(400).json({ user, errors})
      } else {
        next(error); // Forward error to the global error handler
      }
    }
  }
}

/* Handler function to authenticate user */
async function authenticateUser(req, res, next) {
  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req);

  // If the user's credentials are available...
  if (credentials) {
    const user = await User.findOne({ where: {username: credentials.name} });
    if (user) {
      const authenticated = bcrypt.compareSync(credentials.pass, user.confirmedPassword);
      if (authenticated) {
        console.log(`Authentication successful for username: ${user.username}`);
        // Store the user on the Request object.
        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${user.username}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = 'Auth header not found';
  }
  if (message) {
    console.warn(message);
    res.status(401).json({ message: 'Access Denied' });
  } else {
    next();
  }
  }



/* Handler function to deal with sequelize errors */
// function sequelizeErr(error, cb) {
//   try {
//     await cb(req, res, next)
//   } catch (error) {
//     if(error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") { // checking the error
//       const errors = error.errors.map(err => err.message);
//       user = await User.build(req.body);
//       res.status(400).json({ user, errors})
//     } else {
//       throw error; // error caught in the asyncHandler's catch block
//     }
//   }
// }

/* GET show API instructions. */
router.get('/', function(req, res, next) {
  res.json({ 
    welcome: "You have made it to the REST API project!",
  })
});

/* GET current user */
router.get('/users', authenticateUser, asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.currentUser);
  res.status(200).json({
    name: `${user.firstName} ${user.lastName}`,
    email: user.emailAddress
  });
}));

/* POST add new user */
router.post('/users', asyncHandler(async (req, res, next) => {
  let user = await User.create(req.body);
  res.status(201);
}));

/* GET all courses and associated user */
router.get('/courses', asyncHandler(async (req, res, next) => {
  const courses = await Course.findAll({ order: [[ "title", "DESC" ]] });
  res.status(200).json({ courses });
}));

/* GET specific course and associated user */
router.get('/courses:id', asyncHandler(async (req, res, next) => {
  const course = await Course.findByPk(req.params.id);
  course
  ? res.status(200).json({ course })
  : res.status(404).json({ error: "No such course exists" });
}));

/* POST create a new course */
router.post('/courses:id', authenticateUser, asyncHandler(async (req, res, next) => {
  let course = await Course.create(req.body);
  res.status(201);
}));

/* PUT update course */
router.put('/courses:id', authenticateUser, asyncHandler(async (req, res, next) => {
  let course = await Course.findByPk(req.params.id);
  if (course) {
    await course.update(req.body);
    res.status(201);
  } else res.status(404).json({ error: "No such course exists" });
}));

/* DELETE delete course */
router.delete('/courses:id', authenticateUser, asyncHandler(async (req, res, next) => {
  const course = await Course.findByPk(req.params.id);
  if(course) {
    await book.destroy();
    res.status(204)
  } else {
    res.status(404).json({ error: "No such course exists" });
  }
}));

//NOT YET WORKING ****************************************************************************************
// setup a global error handler
router.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

module.exports = router;
