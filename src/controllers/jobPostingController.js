const JobPosting = require('../models/JobPosting');

// Create new job posting
exports.createJobPosting = async (req, res) => {
  try {
    const {
      job_title,
      department,
      position,
      job_type,
      quantity_available,
      responsibilities,
      requirements,
      open_date,
      close_date,
      status
    } = req.body;

    const job = await JobPosting.create({
      job_title,
      department,
      position,
      job_type,
      quantity_available,
      responsibilities,
      requirements,
      open_date,
      close_date,
      status,
      createdBy: req.user?._id, // If using auth middleware
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all job postings
exports.getAllJobPostings = async (req, res) => {
  try {
    const jobs = await JobPosting.find()
      .populate('department', 'title')
      .populate('position', 'title')
      .populate('job_type', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single job posting by ID
exports.getJobPostingById = async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id)
      .populate('department', 'title')
      .populate('position', 'title')
      .populate('job_type', 'title');

    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    res.status(200).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update job posting
exports.updateJobPosting = async (req, res) => {
  try {
    const {
      job_title,
      department,
      position,
      job_type,
      quantity_available,
      responsibilities,
      requirements,
      open_date,
      close_date,
      status
    } = req.body;

    const job = await JobPosting.findByIdAndUpdate(
      req.params.id,
      {
        job_title,
        department,
        position,
        job_type,
        quantity_available,
        responsibilities,
        requirements,
        open_date,
        close_date,
        status,
        updatedBy: req.user?._id, // Optional
      },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    res.status(200).json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete job posting
exports.deleteJobPosting = async (req, res) => {
  try {
    const job = await JobPosting.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    res.status(200).json({ message: 'Job posting deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
