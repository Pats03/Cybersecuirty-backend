const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {verifyJWT}= require('../utils/tokenUtils')
const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.header('Authorization')?.split(' ')[1];
    if (!token)
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' });

    console.log('Received Token in Middleware:', token);

    const decoded = verifyJWT(token); // Decode token
    console.log('Decoded Token:', decoded); // Debugging

    req.user = await User.findById(decoded.userId).select('-password');

    if (!req.user) {
      console.log('User not found in DB');
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};


module.exports = authMiddleware;
