const mongoose = require("mongoose");

const testAssignmentSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting', required: true },
  applicant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant', required: true },
  test_type_scores: [{
    test_type: { type: mongoose.Schema.Types.ObjectId, ref: 'TestType', required: true },
    score: { type: Number, default: 0 }
  }],
  start_at: { type: Date, required: true },
  duration_min: { type: Number, default: 60 },
  location: { type: String },
  status: { type: String, enum: ['scheduled', 'completed'], default: 'scheduled' },
  score: { type: Number },
  feedback: { type: String },
  attachment: { type: String },

  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, { timestamps: true });

module.exports = mongoose.model('TestAssignment', testAssignmentSchema);
