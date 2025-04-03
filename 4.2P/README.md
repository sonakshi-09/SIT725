# Locate a Socket

A web application that helps users find and reserve available power sockets in specified locations.

## Features

- User authentication system (login/registration)
- Socket availability detection based on user location
- Interactive map showing available sockets
- Socket reservation system
- Detailed socket information (location, power capacity, etc.)
- Responsive design (mobile and desktop support)
- Admin dashboard for managing sockets

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript, Materialize CSS Framework
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: Session-based with express-session
- **Maps**: Leaflet JS
- **Templating**: EJS

## Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/locate-socket.git
cd locate-socket
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file in the config folder with the following variables:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/locate-socket
SESSION_SECRET=your_secret_session_key
JWT_SECRET=your_secret_jwt_key
NODE_ENV=development
```

4. Start the server:
```
npm run dev
```

5. Access the application at `http://localhost:3000`

## Project Structure

```
locate-socket/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # MongoDB models
├── public/          # Static files (CSS, JS, images)
├── routes/          # Express routes
├── views/           # EJS templates
├── server.js        # Entry point
└── package.json     # Project metadata
```

## Use Cases

1. **Finding Available Sockets**: Users can find available outlets in their area.
2. **Socket Reservation**: Users can reserve a socket for a specific time period.
3. **Socket Information**: Users can view socket details including location and power availability.

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 