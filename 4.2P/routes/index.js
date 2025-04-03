const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// @route   GET /
// @desc    Home page
// @access  Public
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Locate a Socket',
    description: 'Find and reserve power sockets near you'
  });
});

// @route   GET /dashboard
// @desc    Dashboard page
// @access  Private
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard',
    description: 'Your personal dashboard'
  });
});

// @route   GET /about
// @desc    About page
// @access  Public
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About Us',
    description: 'Learn more about Locate a Socket'
  });
});

module.exports = router; 