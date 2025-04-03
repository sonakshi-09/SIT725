// Authentication middleware

/**
 * Check if user is authenticated
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  
  req.flash('error', 'Please log in to access this resource');
  return res.redirect('/users/login');
};

/**
 * Check if user is an admin
 */
exports.isAdmin = (req, res, next) => {
  if (req.session && req.session.userRole === 'admin') {
    return next();
  }
  
  req.flash('error', 'Access denied. Admin privileges required');
  return res.redirect('/');
};

/**
 * Set current user in locals for access in templates
 */
exports.setCurrentUser = (req, res, next) => {
  res.locals.currentUser = null;
  
  if (req.session && req.session.userId) {
    res.locals.currentUser = {
      id: req.session.userId,
      name: req.session.userName,
      email: req.session.userEmail,
      role: req.session.userRole
    };
  }
  
  next();
}; 