const mongoose = require('mongoose');

const LegendSchema = new mongoose.Schema({
  email: { type: String, required: true},
  password: { type: String, required: true },
  role: { type: String },
});

module.exports = mongoose.model('Legend', LegendSchema);
