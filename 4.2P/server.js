const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const dotenv = require('dotenv');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');

// Load environment variables
dotenv.config({ path: './config/.env' });

// Import middleware
const { setCurrentUser } = require('./middleware/auth');

// Initialize Express app
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up EJS as the view engine with layouts
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret_key_for_development',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/locate-socket',
      collection: 'sessions'
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

// Flash messages middleware
app.use(flash());

// Set locals variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  
  // Set default title and description for all views
  res.locals.title = 'Locate a Socket';
  res.locals.description = 'Find and reserve power sockets near you';
  
  next();
});

// Set current user middleware
app.use(setCurrentUser);

// Define routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/sockets', require('./routes/sockets'));
app.use('/reservations', require('./routes/reservations'));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/locate-socket');
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';
  
  if (req.accepts('html')) {
    return res.status(statusCode).render('error', {
      title: `Error ${statusCode}`,
      description: 'An error occurred',
      statusCode,
      message
    });
  }
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  });
});

// 404 handler (must be after all routes)
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Not Found',
    description: 'Page not found',
    statusCode: 404,
    message: 'The page you requested could not be found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; 