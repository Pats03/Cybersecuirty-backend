const { StatusCodes } = require('http-status-codes');
const bcrypt = require('bcryptjs');
const { comparePassword } = require('../utils/passwordUtils.js');
const {
  NotFoundError,
  UnauthenticatedError,
} = require('../errors/customErrors.js');
const { createJWT } = require('../utils/tokenUtils.js');

const User = require('../models/user.js');
const Legend = require('../models/legend.js');

const createuser = async (req, res) => {
  try {
    const { email, password, role, jobrole } = req.body;

    // Validate required fields
    if (!email || !password || !role || (role === 'user' && !jobrole)) {
      return res
        .status(400)
        .json({ error: 'All required fields must be provided' });
    }
    console.log(email);
    // Check if user already exists
    const existingUser =
      (await Legend.findOne({ email })) || (await User.findOne({ email }));
    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'User with this email already exists' });
    }

    // Check if it's the first account -> assign 'legend' role
    const isFirstAccount = (await Legend.countDocuments()) === 0;
    const assignedRole = isFirstAccount ? 'legend' : role;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user based on role
    let user;
    if (assignedRole === 'legend' || assignedRole === 'admin') {
      user = await Legend.create({
        email,
        password: hashedPassword,
        role: assignedRole,
      });
    } else if (assignedRole === 'user') {
      user = await User.create({
        email,
        password: hashedPassword,
        role: assignedRole,
        jobrole,
      });
    } else {
      return res.status(400).json({ error: 'Invalid role' });
    }

    res
      .status(StatusCodes.CREATED)
      .json({ message: `${assignedRole} created successfully` });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  // First, check in the User collection
  try {
    let user = await User.findOne({ email: req.body.email });

    // If not found in User, check in the Legend collection
    if (!user) {
      user = await Legend.findOne({ email: req.body.email });
    }

    // If the user is still not found in either collection, throw an error
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if the password is correct
    const isPasswordCorrect = await comparePassword(
      req.body.password,
      user.password
    );
    console.log(user.password);
    // var isPasswordCorrect = true;
    // If password is incorrect, throw an error
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Define a token variable
    let token;

    // Generate token based on the role of the user
    if (user.role === 'user') {
      // If the user is a 'user', generate the token with job role
      token = createJWT({
        userId: user._id,
        role: user.role,
        jobrole: user.jobrole, // Assuming jobrole is a valid property
      });
    } else if (user.role === 'admin' || user.role === 'legend') {
      // If the user is a 'legend', generate the token based only on role
      token = createJWT({
        userId: user._id,
        role: user.role,
      });
    } else {
      // If the role is neither 'user' nor 'legend', throw an error
      return res.status(401).json({ error: 'Invalid role' });
    }

    // Set the cookie with the JWT token, expires in one day
    const oneDay = 1000 * 60 * 60 * 24;
    res.cookie('token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + oneDay),
      secure: process.env.NODE_ENV === 'production',
    });

    // Respond with success
    if (user.role === 'user') {
      res
        .status(200)
        .json({
          msg: 'User logged in successfully',
          role: user.jobrole,
          role1: user.role
        });
    } else {
      res.status(200).json({
        msg: 'User logged in successfully',
        role1: user.role,
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const logout = (req, res) => {
  // Clear the token cookie on logout
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'User logged out successfully' });
};

module.exports = { createuser, login, logout };
