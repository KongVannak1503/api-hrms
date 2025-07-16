const JobPosting = require('../models/JobPosting');
const JobApplication = require('../models/JobApplication');

// Create new job posting
exports.createJobPosting = async (req, res) => {
  try {
    const {
      job_title, department, position, job_type,
      quantity_available, responsibilities, requirements,
      open_date, close_date, status
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
      createdBy: req.user?._id,
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all job postings with top candidates
exports.getAllJobPostings = async (req, res) => {
  try {
    const jobs = await JobPosting.find()
      .populate('department', 'title')
      .populate('position', 'title')
      .populate('job_type', 'title')
      .sort({ createdAt: -1 });

    const jobsWithCandidates = await Promise.all(
      jobs.map(async (job) => {
        const applications = await JobApplication.find({ job_id: job._id })
          .populate('applicant_id', 'full_name_en photo')
          .limit(3);

        const candidates = applications.map(app => ({
          name: app.applicant_id?.full_name_en || 'Unknown',
          avatar: app.applicant_id?.photo || null
        }));

        return {
          ...job.toObject(),
          candidates,
          candidates_count: await JobApplication.countDocuments({ job_id: job._id })
        };
      })
    );

    res.status(200).json(jobsWithCandidates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get job posting by ID
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

// Update full job posting
exports.updateJobPosting = async (req, res) => {
  try {
    const {
      job_title, department, position, job_type,
      quantity_available, responsibilities, requirements,
      open_date, close_date, status
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
        updatedBy: req.user?._id,
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

// ✅ Update only job posting status
exports.updateJobPostingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ['Draft', 'Open', 'Close'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const job = await JobPosting.findByIdAndUpdate(
      id,
      { status, updatedBy: req.user?._id },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    res.status(200).json({
      message: 'Status updated successfully',
      job
    });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ message: 'Failed to update status' });
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
