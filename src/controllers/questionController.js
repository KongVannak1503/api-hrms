const Question = require('../models/Question');

exports.createQuestion = async (req, res) => {
  try {
    const { test_type_id, question_text, type, options, correct_answer, score, order } = req.body;
    const question = new Question({
      test_type_id,
      question_text,
      type,
      options,
      correct_answer,
      score,
      order
    });
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create question', error: err.message });
  }
};

exports.getQuestionsByTestType = async (req, res) => {
  try {
    const { testTypeId } = req.params;
    const questions = await Question.find({ test_type_id: testTypeId }).sort({ order: 1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get questions', error: err.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { question_text, type, options, correct_answer, score, order } = req.body;
    const updated = await Question.findByIdAndUpdate(
      req.params.id,
      { question_text, type, options, correct_answer, score, order },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Question not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Question not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
