const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting', required: true },
  applicant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant', required: true },
  // ✅ Interviewers must come from Employee collection
  interviewers: [{
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    score: { type: Number, default: 0 },
    comment: { type: String },
    attachments: [{ type: String }],
  }],
  start_at: {
    type: Date,
    required: true
  },
  duration_min: {
    type: Number,
    default: 45
  },
  location: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed'],
    default: 'scheduled'
  },
  final_decision: {
    type: String,
    enum: ['hired', 'reserve', 'rejected'],
    default: null
  },

}, { timestamps: true });

module.exports = mongoose.model('InterviewSchedule', interviewSchema);
