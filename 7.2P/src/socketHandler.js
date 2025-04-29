module.exports = (socket, io) => {
    console.log(`User connected: ${socket.id}`);
  
    socket.on('message', (msg) => {
      console.log(`Message from ${socket.id}: ${msg}`);
  
      io.emit('message', { sender: socket.id, text: msg });
    });
  
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  };
  