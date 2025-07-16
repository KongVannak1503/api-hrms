const mongoose = require("mongoose")

const interviewSchema = new mongoose.Schema({
  job_id:       { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting', required: true },
  applicant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant',   required: true },

  interviewer_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // panel
  start_at:     { type: Date, required: true },
  duration_min: { type: Number, default: 45 },
  location:     { type: String },

  status:       { type: String, enum: ['scheduled','completed'], default: 'scheduled' },
  score:        { type: Number },           // final / average
  feedback: { type: String },
  attachment: { type: String }

}, { timestamps:true });

module.exports = mongoose.model('InterviewSchedule', interviewSchema);
