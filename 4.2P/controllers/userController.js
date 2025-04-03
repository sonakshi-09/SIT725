const { validationResult } = require('express-validator');
const User = require('../models/User');
const Reservation = require('../models/Reservation');

// @desc    Register a new user
// @route   POST /users/register
// @access  Public
exports.registerUser = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('users/register', {
      title: 'Register',
      description: 'Create a new account',
      errors: errors.array(),
      name: req.body.name,
      email: req.body.email
    });
  }

  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.render('users/register', {
        title: 'Register',
        description: 'Create a new account',
        errors: [{ msg: 'User already exists' }],
        name,
        email
      });
    }

    // Create new user
    user = new User({
      name,
      email,
      password
    });

    // Save user to the database
    await user.save();

    req.flash('success', 'Registration successful! You can now log in.');
    res.redirect('/users/login');
  } catch (err) {
    console.error(err.message);
    req.flash('error', 'Server error');
    res.redirect('/users/register');
  }
};

// @desc    Login user
// @route   POST /users/login
// @access  Public
exports.loginUser = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('users/login', {
      title: 'Login',
      description: 'Login to your account',
      errors: errors.array(),
      email: req.body.email
    });
  }

  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('users/login', {
        title: 'Login',
        description: 'Login to your account',
        errors: [{ msg: 'Invalid credentials' }],
        email
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.render('users/login', {
        title: 'Login',
        description: 'Login to your account',
        errors: [{ msg: 'Invalid credentials' }],
        email
      });
    }

    // Store user info in session
    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;

    req.flash('success', 'You are now logged in');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err.message);
    req.flash('error', 'Server error');
    res.redirect('/users/login');
  }
};

// @desc    Logout user
// @route   GET /users/logout
// @access  Private
exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err.message);
      return res.redirect('/dashboard');
    }
    res.redirect('/');
  });
};

// @desc    Get user profile
// @route   GET /users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    const reservations = await Reservation.find({ user: req.session.userId })
      .populate('socket')
      .sort({ createdAt: -1 });

    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/dashboard');
    }

    res.render('users/profile', {
      title: 'My Profile',
      description: 'Manage your profile and reservations',
      user,
      reservations
    });
  } catch (err) {
    console.error(err.message);
    req.flash('error', 'Server error');
    res.redirect('/dashboard');
  }
};

// @desc    Update user profile
// @route   PUT /users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email } = req.body;

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== req.session.userId) {
      return res.status(400).json({ errors: [{ msg: 'Email already in use' }] });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.session.userId,
      { name, email },
      { new: true }
    ).select('-password');

    // Update session
    req.session.userName = updatedUser.name;
    req.session.userEmail = updatedUser.email;

    res.json({ user: updatedUser, msg: 'Profile updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};