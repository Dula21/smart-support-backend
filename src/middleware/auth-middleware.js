const jwt = require('jsonwebtoken');
require('@dotenvx/dotenvx').config();

// Middleware to authenticate JWT token
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach user info (e.g., id, role) to req
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Middleware to authorize based on roles
const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
  }
  next();
};

module.exports = { authenticate, authorize };