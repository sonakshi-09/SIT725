const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const socketHandler = require('./socketHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Optional API route
app.get('/api', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Handle socket.io connections
io.on('connection', (socket) => {
  socketHandler(socket, io);
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
