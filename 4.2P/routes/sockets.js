const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Import controllers
const socketController = require('../controllers/socketController');

// @route   GET /sockets
// @desc    Get all sockets
// @access  Public
router.get('/', socketController.getAllSockets);

// @route   GET /sockets/map
// @desc    Display sockets on map
// @access  Public
router.get('/map', socketController.getSocketsMap);

// @route   GET /sockets/nearby
// @desc    Get nearby sockets based on coordinates
// @access  Public
router.get('/nearby', [
  check('lat', 'Latitude is required').not().isEmpty(),
  check('lng', 'Longitude is required').not().isEmpty(),
  check('maxDistance', 'Maximum distance is required').optional().isNumeric()
], socketController.getNearbySockets);

// @route   GET /sockets/:id
// @desc    Get socket by ID
// @access  Public
router.get('/:id', socketController.getSocketById);

// Admin routes
// @route   GET /sockets/admin/manage
// @desc    Admin manage sockets page
// @access  Private/Admin
router.get('/admin/manage', isAuthenticated, isAdmin, socketController.getAdminSocketsPage);

// @route   POST /sockets
// @desc    Create a new socket
// @access  Private/Admin
router.post('/',
  isAuthenticated,
  isAdmin,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('location', 'Location is required').not().isEmpty(),
    check('building', 'Building is required').not().isEmpty(),
    check('floor', 'Floor is required').not().isEmpty(),
    check('roomNumber', 'Room number is required').not().isEmpty(),
    check('socketType', 'Socket type is required').not().isEmpty()
  ],
  socketController.createSocket
);

// @route   PUT /sockets/:id
// @desc    Update socket
// @access  Private/Admin
router.put('/:id', 
  isAuthenticated, 
  isAdmin,
  socketController.updateSocket
);

// @route   DELETE /sockets/:id
// @desc    Delete socket
// @access  Private/Admin
router.delete('/:id', 
  isAuthenticated, 
  isAdmin,
  socketController.deleteSocket
);

module.exports = router; 