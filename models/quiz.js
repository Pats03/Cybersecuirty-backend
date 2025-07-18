const mongoose = require('mongoose');

// Define question schema
const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true, // Question text is required
    },
    options: {
      type: mongoose.Schema.Types.Mixed, // Can be an array of strings or a boolean
      required: true,
    },
    answer: {
      type: String,
      required: true, // The correct answer is required
    },
    description: {
      type: String,
      required: true, // Explanation is required
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'], // Restrict difficulty levels
      required: true, // Difficulty level is required
    },
    role: {
      type: String,
      required: true, // Role is required
    },
    category: {
      type: String,
      required: true, // Category is required
    },
    link: {
      type: String,
      required: true, // External resource link
    },
  },
  { timestamps: true }
); // Automatically add createdAt & updatedAt

// Create and export the model for the Question schema
const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
