const mongoose = require('mongoose');

const SocketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true
  },
  building: {
    type: String,
    required: true
  },
  floor: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  socketType: {
    type: String,
    enum: ['AC', 'USB', 'USB-C', 'Ethernet'],
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  powerRating: {
    type: String,
    default: 'Standard'
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

// Create geospatial index for location-based queries
SocketSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Socket', SocketSchema); 