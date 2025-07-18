const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 4000; // Set the port, default is 3000
const quizRouter = require('./routes/quizRouter');
const authRoute = require('./routes/authRouter');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // Import the cors package
require('dotenv').config();

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Ensure cookie parsing
const corsOptions = {
  origin: 'https://cyberquestions-9z9n.vercel.app', // Allow frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
  credentials: true, // Important: Allow cookies and Authorization headers
};

app.use(cors(corsOptions));
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err);
  });

// Sample route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Use quizRouter for quiz-related routes
app.use('/api/v1/quiz', quizRouter);
app.use('/api/v1/auth', authRoute);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
