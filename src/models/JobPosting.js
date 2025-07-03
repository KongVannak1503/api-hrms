const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema({
  job_title: { type: String, required: true },

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  position: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position',
    required: true,
  },
  job_type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobType',
    required: true,
  },

  quantity_available: { type: Number, required: true },
  responsibilities: {type: String},
  requirements: {type: String},
  open_date: { type: Date, required: true },
  close_date: { type: Date, required: true },
  status: { type: Boolean, default: true }, // true = open

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('JobPosting', jobPostingSchema);
