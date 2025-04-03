const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  socket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Socket',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to check if reservation time conflicts with existing reservations
ReservationSchema.statics.checkAvailability = async function(socketId, startTime, endTime, excludeReservationId = null) {
  const query = {
    socket: socketId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      // New reservation starts during an existing reservation
      { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
      // New reservation ends during an existing reservation
      { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
      // New reservation completely contains an existing reservation
      { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
    ]
  };

  // Exclude the current reservation when checking for updates
  if (excludeReservationId) {
    query._id = { $ne: excludeReservationId };
  }

  const conflictingReservations = await this.find(query).select('_id');
  return conflictingReservations.length === 0;
};

module.exports = mongoose.model('Reservation', ReservationSchema); 