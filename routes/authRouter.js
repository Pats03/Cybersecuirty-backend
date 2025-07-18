const express = require('express');
const router = express.Router();

const {
  createuser,
  login,
  logout,
} = require('../controller/authController.js');

router.post('/register', createuser);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;
