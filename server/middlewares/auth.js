// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

  // Verify token
  const secret = process.env.JWT_SECRET || 'defaultsecret';
  const decoded = jwt.verify(token, secret);
    
    // Attach user to request
    req.user = decoded;
    
    next();
  } catch (err) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

module.exports = { authenticate };