const mongoose = require('mongoose');
const User = require('../models/User');
const Socket = require('../models/Socket');
const Reservation = require('../models/Reservation');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: './config/.env' });

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/locate-socket');
    console.log('MongoDB Connected for seeding...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Regular User',
    email: 'user@example.com',
    password: 'user123',
    role: 'user'
  }
];

const sockets = [
  {
    name: 'Library Main Hall Socket',
    location: 'New York Public Library',
    building: 'Main Library Building',
    floor: '1',
    roomNumber: 'Main Hall',
    socketType: 'AC',
    powerRating: '120V',
    isAvailable: true
  },
  {
    name: 'Computer Lab Socket',
    location: 'New York Public Library',
    building: 'Main Library Building',
    floor: '2',
    roomNumber: 'Computer Lab',
    socketType: 'AC',
    powerRating: '240V',
    isAvailable: true
  },
  {
    name: 'Study Room Socket',
    location: 'New York Public Library',
    building: 'Main Library Building',
    floor: '3',
    roomNumber: 'Study Room 301',
    socketType: 'USB',
    powerRating: 'USB 3.0',
    isAvailable: false
  },
  {
    name: 'Conference Room Socket',
    location: 'New York Public Library',
    building: 'Annex Building',
    floor: '10',
    roomNumber: 'Conference Room A',
    socketType: 'USB-C',
    powerRating: '100W PD',
    isAvailable: true
  }
];

// Seed database
const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Socket.deleteMany({});
    await Reservation.deleteMany({});
    console.log('Cleaned up existing data');

    // Create users with hashed passwords
    let createdUsers = [];
    for (const user of users) {
      const newUser = new User(user);
      await newUser.save();
      createdUsers.push(newUser);
      console.log(`Created user: ${user.email}`);
    }

    // Create sockets
    let createdSockets = [];
    for (const socket of sockets) {
      const newSocket = new Socket(socket);
      await newSocket.save();
      createdSockets.push(newSocket);
      console.log(`Created socket: ${socket.name}`);
    }

    // Create a sample reservation
    if (createdUsers.length > 0 && createdSockets.length > 0) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const reservation = new Reservation({
        user: createdUsers[1]._id, // Regular user
        socket: createdSockets[0]._id, // First socket
        date: tomorrow,
        startTime: '10:00',
        endTime: '12:00',
        status: 'confirmed',
        notes: 'Sample reservation for testing'
      });
      
      await reservation.save();
      console.log('Created sample reservation');
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB(); 