const { validationResult } = require('express-validator');
const Socket = require('../models/Socket');
const Reservation = require('../models/Reservation');

// @desc    Get all sockets
// @route   GET /sockets
// @access  Public
exports.getAllSockets = async (req, res) => {
  try {
    const sockets = await Socket.find().sort({ createdAt: -1 });
    
    // Adapt sockets to the format expected by the view
    const adaptedSockets = sockets.map(socket => ({
      _id: socket._id,
      name: socket.name,
      powerCapacity: socket.powerRating,
      isAvailable: socket.isAvailable,
      location: {
        address: `${socket.building}, ${socket.location}`,
        floor: socket.floor,
        room: socket.roomNumber
      }
    }));

    res.render('sockets/index', {
      title: 'Available Sockets',
      description: 'Browse all available sockets',
      sockets: adaptedSockets
    });
  } catch (err) {
    console.error(err.message);
    req.flash('error', 'Server error');
    res.redirect('/');
  }
};

// @desc    Display sockets on map
// @route   GET /sockets/map
// @access  Public
exports.getSocketsMap = async (req, res) => {
  try {
    const sockets = await Socket.find();
    
    // Adapt sockets to the format expected by the view
    const adaptedSockets = sockets.map(socket => ({
      _id: socket._id,
      name: socket.name,
      powerCapacity: socket.powerRating,
      isAvailable: socket.isAvailable,
      location: {
        address: `${socket.building}, ${socket.location}`,
        coordinates: [0, 0] // Default coordinates since we changed the model
      }
    }));

    res.render('sockets/map', {
      title: 'Socket Map',
      description: 'View all sockets on the map',
      sockets: JSON.stringify(adaptedSockets)
    });
  } catch (err) {
    console.error(err.message);
    req.flash('error', 'Server error');
    res.redirect('/');
  }
};

// @desc    Get nearby sockets based on coordinates
// @route   GET /sockets/nearby
// @access  Public
exports.getNearbySockets = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Since we've changed the model structure, we'll return all sockets for now
    const sockets = await Socket.find();
    
    // Adapt sockets to the format expected by the client
    const adaptedSockets = sockets.map(socket => ({
      _id: socket._id,
      name: socket.name,
      powerCapacity: socket.powerRating,
      isAvailable: socket.isAvailable,
      location: {
        address: `${socket.building}, ${socket.location}`,
        floor: socket.floor,
        room: socket.roomNumber
      }
    }));

    res.json(adaptedSockets);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get socket by ID
// @route   GET /sockets/:id
// @access  Public
exports.getSocketById = async (req, res) => {
  try {
    const socket = await Socket.findById(req.params.id);

    if (!socket) {
      req.flash('error', 'Socket not found');
      return res.redirect('/sockets');
    }

    // Get future reservations for this socket
    const currentDate = new Date();
    const reservations = await Reservation.find({
      socket: socket._id,
      date: { $gte: currentDate },
      status: { $in: ['pending', 'confirmed'] }
    }).sort({ date: 1 }).populate('user', 'name');

    // Adapt socket to the format expected by the view
    const adaptedSocket = {
      _id: socket._id,
      name: socket.name,
      powerCapacity: socket.powerRating,
      isAvailable: socket.isAvailable,
      socketType: socket.socketType,
      notes: socket.notes,
      location: {
        address: `${socket.building}, ${socket.location}`,
        floor: socket.floor,
        room: socket.roomNumber
      }
    };

    res.render('sockets/detail', {
      title: socket.name,
      description: `Details about ${socket.name}`,
      socket: adaptedSocket,
      reservations
    });
  } catch (err) {
    console.error(err.message);
    req.flash('error', 'Server error');
    res.redirect('/sockets');
  }
};

// Admin Controllers

// @desc    Admin manage sockets page
// @route   GET /sockets/admin/manage
// @access  Private/Admin
exports.getAdminSocketsPage = async (req, res) => {
  try {
    const sockets = await Socket.find().sort({ createdAt: -1 });

    res.render('admin/manage-sockets', {
      title: 'Manage Sockets',
      description: 'Admin page to manage sockets',
      sockets
    });
  } catch (err) {
    console.error(err.message);
    req.flash('error', 'Server error');
    res.redirect('/dashboard');
  }
};

// @desc    Create a new socket
// @route   POST /sockets
// @access  Private/Admin
exports.createSocket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      location,
      building,
      floor,
      roomNumber,
      socketType,
      powerRating,
      notes,
      isAvailable
    } = req.body;

    // Create new socket
    const socket = new Socket({
      name,
      location,
      building,
      floor,
      roomNumber,
      socketType,
      powerRating,
      notes,
      isAvailable: isAvailable || true
    });

    await socket.save();

    res.json({ socket, msg: 'Socket created successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Update socket
// @route   PUT /sockets/:id
// @access  Private/Admin
exports.updateSocket = async (req, res) => {
  try {
    const {
      name,
      location,
      building,
      floor,
      roomNumber,
      socketType,
      powerRating,
      notes,
      isAvailable
    } = req.body;

    // Build socket object
    const socketFields = {};
    if (name) socketFields.name = name;
    if (location) socketFields.location = location;
    if (building) socketFields.building = building;
    if (floor) socketFields.floor = floor;
    if (roomNumber) socketFields.roomNumber = roomNumber;
    if (socketType) socketFields.socketType = socketType;
    if (powerRating) socketFields.powerRating = powerRating;
    if (notes !== undefined) socketFields.notes = notes;
    if (isAvailable !== undefined) socketFields.isAvailable = isAvailable;

    // Find and update socket
    let socket = await Socket.findById(req.params.id);

    if (!socket) {
      return res.status(404).json({ msg: 'Socket not found' });
    }

    socket = await Socket.findByIdAndUpdate(
      req.params.id,
      { $set: socketFields },
      { new: true }
    );

    res.json({ socket, msg: 'Socket updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Delete socket
// @route   DELETE /sockets/:id
// @access  Private/Admin
exports.deleteSocket = async (req, res) => {
  try {
    // Check if socket has any future reservations
    const currentDate = new Date();
    const reservations = await Reservation.find({
      socket: req.params.id,
      date: { $gte: currentDate },
      status: { $in: ['pending', 'confirmed'] }
    });

    if (reservations.length > 0) {
      return res.status(400).json({
        msg: 'Cannot delete socket with active reservations. Cancel all reservations first.'
      });
    }

    // Find and remove the socket
    const socket = await Socket.findById(req.params.id);

    if (!socket) {
      return res.status(404).json({ msg: 'Socket not found' });
    }

    await Socket.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Socket removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
}; 