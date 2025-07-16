// models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  test_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TestType', required: true },
  question_text: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'multiple_choice', 'boolean'],
    default: 'text'
  },
  options: [String], // Optional if multiple_choice
  correct_answer: String,
  score: { type: Number, default: 1 },
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
