const { validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const Socket = require('../models/Socket');

// @desc    Get user's reservations
// @route   GET /reservations
// @access  Private
exports.getUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.session.userId })
      .sort({ startTime: 1 })
      .populate('socket', 'name location powerCapacity isAvailable');

    const currentDate = new Date();
    
    // Split reservations into upcoming and past
    const upcomingReservations = reservations.filter(res => new Date(res.endTime) >= currentDate);
    const pastReservations = reservations.filter(res => new Date(res.endTime) < currentDate);

    res.render('reservations/index', {
      title: 'My Reservations',
      description: 'View all your socket reservations',
      upcomingReservations,
      pastReservations
    });
  } catch (err) {
    console.error(err.message);
    req.flash('error', 'Server error');
    res.redirect('/dashboard');
  }
};

// @desc    Create a new reservation
// @route   POST /reservations
// @access  Private
exports.createReservation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { socketId, startTime, endTime } = req.body;

    // Check if socket exists
    const socket = await Socket.findById(socketId);
    if (!socket) {
      return res.status(404).json({ msg: 'Socket not found' });
    }

    // Check if socket is available
    if (!socket.isAvailable) {
      return res.status(400).json({ msg: 'Socket is not available for reservation' });
    }

    // Check if the reservation time is valid
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);
    const currentDateTime = new Date();

    if (startDateTime < currentDateTime) {
      return res.status(400).json({ msg: 'Start time must be in the future' });
    }

    if (endDateTime <= startDateTime) {
      return res.status(400).json({ msg: 'End time must be after start time' });
    }

    // Check if the socket is available during the requested time
    const isAvailable = await Reservation.checkAvailability(socketId, startDateTime, endDateTime);
    if (!isAvailable) {
      return res.status(400).json({ msg: 'Socket is already reserved during this time' });
    }

    // Create reservation
    const reservation = new Reservation({
      user: req.session.userId,
      socket: socketId,
      startTime: startDateTime,
      endTime: endDateTime,
      status: 'confirmed'
    });

    await reservation.save();

    res.json({ reservation, msg: 'Reservation created successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get reservation by ID
// @route   GET /reservations/:id
// @access  Private
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('socket', 'name location powerCapacity isAvailable');

    if (!reservation) {
      req.flash('error', 'Reservation not found');
      return res.redirect('/reservations');
    }

    // Check if the reservation belongs to the current user
    if (reservation.user.toString() !== req.session.userId) {
      req.flash('error', 'Not authorized');
      return res.redirect('/reservations');
    }

    res.render('reservations/detail', {
      title: 'Reservation Details',
      description: 'View details of your reservation',
      reservation
    });
  } catch (err) {
    console.error(err.message);
    req.flash('error', 'Server error');
    res.redirect('/reservations');
  }
};

// @desc    Update reservation
// @route   PUT /reservations/:id
// @access  Private
exports.updateReservation = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    // Find the reservation
    let reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ msg: 'Reservation not found' });
    }

    // Check if the reservation belongs to the current user
    if (reservation.user.toString() !== req.session.userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Check if the reservation can be updated (not in the past)
    const currentDateTime = new Date();
    if (new Date(reservation.startTime) < currentDateTime) {
      return res.status(400).json({ msg: 'Cannot update a reservation that has already started' });
    }

    // Check if the new time is valid
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    if (startDateTime < currentDateTime) {
      return res.status(400).json({ msg: 'Start time must be in the future' });
    }

    if (endDateTime <= startDateTime) {
      return res.status(400).json({ msg: 'End time must be after start time' });
    }

    // Check if the socket is available during the new requested time
    const isAvailable = await Reservation.checkAvailability(
      reservation.socket,
      startDateTime,
      endDateTime,
      reservation._id
    );

    if (!isAvailable) {
      return res.status(400).json({ msg: 'Socket is already reserved during this time' });
    }

    // Update reservation
    reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { 
        startTime: startDateTime,
        endTime: endDateTime
      },
      { new: true }
    );

    res.json({ reservation, msg: 'Reservation updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Cancel reservation
// @route   DELETE /reservations/:id
// @access  Private
exports.cancelReservation = async (req, res) => {
  try {
    // Find the reservation
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ msg: 'Reservation not found' });
    }

    // Check if the reservation belongs to the current user
    if (reservation.user.toString() !== req.session.userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Check if the reservation can be cancelled (not in the past)
    const currentDateTime = new Date();
    if (new Date(reservation.startTime) < currentDateTime) {
      return res.status(400).json({ msg: 'Cannot cancel a reservation that has already started' });
    }

    // Update reservation status to cancelled
    await Reservation.findByIdAndUpdate(req.params.id, { status: 'cancelled' });

    res.json({ msg: 'Reservation cancelled successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Admin Controllers

// @desc    Get all reservations (admin only)
// @route   GET /reservations/admin/all
// @access  Private/Admin
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .sort({ startTime: 1 })
      .populate('socket', 'name location')
      .populate('user', 'name email');

    res.render('admin/all-reservations', {
      title: 'All Reservations',
      description: 'Admin view of all reservations',
      reservations
    });
  } catch (err) {
    console.error(err.message);
    req.flash('error', 'Server error');
    res.redirect('/dashboard');
  }
}; 