const jwt = require('jsonwebtoken');

const createJWT = (payload) => {
  console.log("Signing token with secret:", process.env.JWT_SECRET); // Debug log
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const verifyJWT = (token) => {
  console.log("Verifying token with secret:", process.env.JWT_SECRET); // Debug log
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { createJWT, verifyJWT };
