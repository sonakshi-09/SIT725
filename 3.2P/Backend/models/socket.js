const mongoose = require('mongoose');

const socketSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  available: {
    type: Boolean,
    default: true
  }
});

// Only register model if not already registered
module.exports = mongoose.models.Socket || mongoose.model('Socket', socketSchema);
