const Question = require('../models/quiz'); // Import the Question model
const User = require('../models/user');
const Score = require('../models/score');
/**
 * Fetches quiz questions based on role.
 *
 * @param {Object} req - The request object containing role as a URL parameter.
 * @returns {Object} An object containing the questions for the specified role.
 */
const getQuiz = async (req, res) => {
  try {
    const { role } = req.params; // Extract role from URL parameters

    // Validate inputs
    if (!role) {
      return res.status(400).json({ error: 'Role is required.' });
    }

    // Fetch questions that match the role
    const questions = await Question.find({ role });

    if (questions.length === 0) {
      return res
        .status(404)
        .json({ error: `No questions found for the role: ${role}` });
    }

    // Prepare questions for the response
    const result = questions.map((question) => ({
      question: question.question,
      options: question.options,
      answer: question.answer,
      description: question.description,
      category: question.category,
      difficulty: question.difficulty,
      link: question.link,
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    return res
      .status(500)
      .json({ error: 'Internal server error. Please try again later.' });
  }
};

/**
 * Fetches all quiz questions.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response with all quiz questions.
 */
const getAllQuizzes = async (req, res) => {
  try {
    // Fetch all questions
    const questions = await Question.find();

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No quiz questions found.' });
    }

    // Prepare questions for the response
    const result = questions.map((question) => ({
      id: question._id,
      question: question.question,
      options: question.options,
      answer: question.answer,
      description: question.description,
      category: question.category,
      difficulty: question.difficulty,
      link: question.link,
      role: question.role, // Including role for reference
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching all quiz questions:', error);
    return res
      .status(500)
      .json({ error: 'Internal server error. Please try again later.' });
  }
};

const createQuiz = async (req, res) => {
  try {
    const {
      question,
      options,
      answer,
      description,
      difficulty,
      role,
      category,
      link,
    } = req.body;

    // Validate required fields
    if (
      !question ||
      !options ||
      !answer ||
      !description ||
      !difficulty ||
      !role ||
      !category ||
      !link
    ) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Validate difficulty level
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty level.' });
    }

    // Create a new quiz question
    const newQuestion = new Question({
      question,
      options,
      answer,
      description,
      difficulty,
      role,
      category,
      link,
    });

    // Save to the database
    await newQuestion.save();

    return res.status(201).json({
      message: 'Quiz question created successfully.',
      data: newQuestion,
    });
  } catch (error) {
    console.error('Error creating quiz question:', error);
    return res
      .status(500)
      .json({ error: 'Internal server error. Please try again later.' });
  }
};
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params; // Extract question ID from the request parameters
    const updateData = req.body; // Get updated fields from request body

    // Validate if ID is provided
    if (!id) {
      return res.status(400).json({ error: 'Question ID is required.' });
    }

    // Validate if the question exists
    const existingQuestion = await Question.findById(id);
    if (!existingQuestion) {
      return res.status(404).json({ error: 'Quiz question not found.' });
    }

    // Validate difficulty if it is being updated
    if (updateData.difficulty) {
      const validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.includes(updateData.difficulty)) {
        return res.status(400).json({ error: 'Invalid difficulty level.' });
      }
    }

    // Update the quiz question
    const updatedQuestion = await Question.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validation rules are applied
    });

    return res.status(200).json({
      message: 'Quiz question updated successfully.',
      data: updatedQuestion,
    });
  } catch (error) {
    console.error('Error updating quiz question:', error);
    return res
      .status(500)
      .json({ error: 'Internal server error. Please try again later.' });
  }
};
const getScore = async (req, res) => {
  try {
    const scoreEntry = await Score.findOne({ userId: req.user._id });
    if (!scoreEntry) {
      return res.json({ message: 'No score found', score: 0 });
    }
    res.json({ score: scoreEntry.score });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; // <-- Fixed closing syntax

const updateScore = async (req, res) => {
  try {
    const { score } = req.body;
    if (typeof score !== 'number') {
      return res.status(400).json({ message: 'Score must be a number' });
    }

    let scoreEntry = await Score.findOne({ userId: req.user._id });

    if (scoreEntry) {
      scoreEntry.score += newScore; // Update existing score
    } else {
      scoreEntry = new Score({ userId: req.user._id, score: score }); // Create new entry
    }

    await scoreEntry.save();
    res.json({
      message: 'Score updated successfully',
      score: scoreEntry.score,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
    console.log(error);
  }
};

const getScoresByJobRole = async (req, res) => {
  try {
    // Ensure the user has a job role in the token
    console.log(req.user);
    if (!req.user || !req.user.jobrole) {
      return res.status(400).json({ message: 'Job role not found in token' });
    }

    const jobrole = req.user.jobrole;

    // Find all users with the same job role
    const users = await User.find({ jobrole });

    if (!users.length) {
      return res
        .status(404)
        .json({ message: 'No users found with this job role' });
    }

    // Get scores for those users
    console.log(users);
    const userIds = users.map((user) => user._id);
    const scores = await Score.find({ userId: { $in: userIds } }).populate(
      'userId',
      'name email jobrole'
    );
    console.log(scores);

    res.json({ scores });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuiz = await Question.findByIdAndDelete(id);

    if (!deletedQuiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Correct export statement
module.exports = {
  getQuiz,
  getAllQuizzes,
  createQuiz,
  updateQuiz,
  getScore,
  updateScore,
  getScoresByJobRole,
  deleteQuiz,
};
