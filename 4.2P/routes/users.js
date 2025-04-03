const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { isAuthenticated } = require('../middleware/auth');
const { AuthenticationError } = require('../utils/errors');

// Import controllers
const userController = require('../controllers/userController');

// @route   GET /users/register
// @desc    Display registration form
// @access  Public
router.get('/register', (req, res) => {
  res.render('users/register', {
    title: 'Register',
    description: 'Create a new account'
  });
});

// @route   POST /users/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  userController.registerUser
);

// @route   GET /users/login
// @desc    Display login form
// @access  Public
router.get('/login', (req, res) => {
  res.render('users/login', {
    title: 'Login',
    description: 'Login to your account'
  });
});

// @route   POST /users/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  userController.loginUser
);

// @route   GET /users/logout
// @desc    Logout user
// @access  Private
router.get('/logout', isAuthenticated, userController.logoutUser);

// @route   GET /users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', isAuthenticated, userController.getUserProfile);

// @route   PUT /users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  isAuthenticated,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail()
  ],
  userController.updateUserProfile
);

module.exports = router;