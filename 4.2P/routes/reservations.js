const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Import controllers
const reservationController = require('../controllers/reservationController');

// @route   GET /reservations
// @desc    Get user's reservations
// @access  Private
router.get('/', isAuthenticated, reservationController.getUserReservations);

// @route   POST /reservations
// @desc    Create a new reservation
// @access  Private
router.post('/',
  isAuthenticated,
  [
    check('socketId', 'Socket ID is required').not().isEmpty(),
    check('startTime', 'Start time is required').not().isEmpty(),
    check('endTime', 'End time is required').not().isEmpty()
  ],
  reservationController.createReservation
);

// @route   GET /reservations/:id
// @desc    Get reservation by ID
// @access  Private
router.get('/:id', isAuthenticated, reservationController.getReservationById);

// @route   PUT /reservations/:id
// @desc    Update reservation
// @access  Private
router.put('/:id',
  isAuthenticated,
  reservationController.updateReservation
);

// @route   DELETE /reservations/:id
// @desc    Cancel reservation
// @access  Private
router.delete('/:id',
  isAuthenticated,
  reservationController.cancelReservation
);

// Admin routes
// @route   GET /reservations/admin/all
// @desc    Get all reservations (admin only)
// @access  Private/Admin
router.get('/admin/all', isAuthenticated, isAdmin, reservationController.getAllReservations);

module.exports = router; 