// controllers/jobApplicationController.js

const JobApplication = require('../models/JobApplication');

// ✅ Create Job Application (when applicant applies)
exports.createJobApplication = async (req, res) => {
  try {
    const { job_id, applicant_id } = req.body;

    const existing = await JobApplication.findOne({ job_id, applicant_id });
    if (existing) {
      return res.status(400).json({ message: 'Application already exists.' });
    }

    const newApp = await JobApplication.create({
      job_id,
      applicant_id,
      status: 'applied',
      updated_by: req.user._id
    });

    res.status(201).json(newApp);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Get all applications for a job
exports.getApplicationsByJob = async (req, res) => {
  try {
    const { job_id } = req.params;
    const applications = await JobApplication.find({ job_id })
      .populate('applicant_id')
      .populate('job_id');

    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Update status (e.g., from shortlisted → test, etc.)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updated = await JobApplication.findByIdAndUpdate(
      id,
      { status, notes, updated_by: req.user._id },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
};

// ✅ Update test score
exports.updateTestScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { test_score } = req.body;

    const updated = await JobApplication.findByIdAndUpdate(
      id,
      { test_score, updated_by: req.user._id },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update test score', error: err.message });
  }
};

// ✅ Update interview score
exports.updateInterviewScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { interview_score } = req.body;

    const updated = await JobApplication.findByIdAndUpdate(
      id,
      { interview_score, updated_by: req.user._id },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update interview score', error: err.message });
  }
};

// ✅ Update final score
exports.updateFinalScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { final_score } = req.body;

    const updated = await JobApplication.findByIdAndUpdate(
      id,
      { final_score, updated_by: req.user._id },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update final score', error: err.message });
  }
};
