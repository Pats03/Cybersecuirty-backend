const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  score: { type: Number, default: 0 },
});

const Score = mongoose.model('Score', scoreSchema);
module.exports = Score;
