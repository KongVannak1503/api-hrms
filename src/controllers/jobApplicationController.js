const JobApplication = require('../models/JobApplication');


exports.createJobApplication = async (req, res) => {
  try {
    const { job_id, applicant_id, applied_date } = req.body;

    const existing = await JobApplication.findOne({ job_id, applicant_id });
    if (existing) {
      return res.status(400).json({ message: 'Application already exists.' });
    }

    const newApp = await JobApplication.create({
      job_id,
      applicant_id,
      applied_date: applied_date ? new Date(applied_date) : new Date(), // fallback to now
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

exports.getJobApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await JobApplication.findById(id)
      .populate('applicant_id')
      .populate('job_id');

    if (!application) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    res.status(200).json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateJobApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { job_id, applicant_id, applied_date } = req.body;

    const updated = await JobApplication.findByIdAndUpdate(
      id,
      {
        job_id,
        applicant_id,
        applied_date: applied_date ? new Date(applied_date) : undefined,
        updated_by: req.user._id
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update job application', error: err.message });
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

