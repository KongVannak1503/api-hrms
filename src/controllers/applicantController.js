const Applicant = require('../models/Applicant');
const JobApplication = require('../models/JobApplication');
const JobPosting = require('../models/JobPosting');
const fs = require('fs');
const path = require('path');

// ✅ Create applicant (unchanged)
exports.createApplicant = async (req, res) => {
  try {
    const {
      full_name_kh,
      full_name_en,
      gender,
      dob,
      marital_status,
      phone_no,
      email,
      current_province,
      current_district,
      current_commune,
      current_village,
    } = req.body;

    const photo = req.files?.photo?.[0]?.filename || null;
    const cv = req.files?.cv?.[0]?.filename || null;

    const newApplicant = await Applicant.create({
      full_name_kh,
      full_name_en,
      gender,
      dob,
      marital_status,
      phone_no,
      email,
      current_province,
      current_district,
      current_commune,
      current_village,
      photo,
      cv,
      created_by: req.user._id,
      updated_by: req.user._id
    });

    res.status(201).json(newApplicant);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create applicant', error: err.message });
  }
};

// ✅ Get all applicants (enhanced with job title and status)
exports.getAllApplicants = async (req, res) => {
  try {
    // 1. Fetch all applicants
    const applicants = await Applicant.find().sort({ createdAt: -1 });
    const applicantIds = applicants.map(app => app._id);

    // 2. Fetch job applications for all applicants
    const jobApps = await JobApplication.find({ applicant_id: { $in: applicantIds } })
      .populate('job_id', 'job_title')
      .sort({ createdAt: -1 });

    // 3. Create a lookup map for faster matching
    const jobAppMap = new Map();

    jobApps.forEach(app => {
      const applicantId = app.applicant_id.toString();
      if (!jobAppMap.has(applicantId)) {
        jobAppMap.set(applicantId, app); // first found is the latest due to sort
      }
    });

    // 4. Map applicants to include job info
    const mappedApplicants = applicants.map(applicant => {
      const jobApp = jobAppMap.get(applicant._id.toString());

      return {
        ...applicant.toObject(),
        job_title: jobApp?.job_id?.job_title || null,
        job_id: jobApp?.job_id?._id || null, 
        status: jobApp?.status || 'applied',
        job_application_id: jobApp?._id || null
      };
    });

    res.status(200).json(mappedApplicants);
  } catch (err) {
    console.error('Error in getAllApplicants:', err);
    res.status(500).json({ message: 'Failed to fetch applicants', error: err.message });
  }
};

// ✅ Get single applicant by ID (unchanged)
exports.getApplicantById = async (req, res) => {
  try {
    const { id } = req.params;
    const applicant = await Applicant.findById(id);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });
    res.status(200).json(applicant);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch applicant', error: err.message });
  }
};

// ✅ Update applicant (unchanged)
exports.updateApplicant = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_by: req.user._id };

    const existingApplicant = await Applicant.findById(id);
    if (!existingApplicant) return res.status(404).json({ message: 'Applicant not found' });

    if (req.files?.photo?.[0]) {
      if (existingApplicant.photo) {
        fs.unlinkSync(path.join(__dirname, '../uploads/applicants', existingApplicant.photo));
      }
      updates.photo = req.files.photo[0].filename;
    }

    if (req.files?.cv?.[0]) {
      if (existingApplicant.cv) {
        fs.unlinkSync(path.join(__dirname, '../uploads/applicants', existingApplicant.cv));
      }
      updates.cv = req.files.cv[0].filename;
    }

    const updated = await Applicant.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update applicant', error: err.message });
  }
};

// ✅ Delete applicant (unchanged)
exports.deleteApplicant = async (req, res) => {
  try {
    const { id } = req.params;
    const applicant = await Applicant.findById(id);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

    if (applicant.photo) {
      fs.unlinkSync(path.join(__dirname, '../uploads/applicants', applicant.photo));
    }
    if (applicant.cv) {
      fs.unlinkSync(path.join(__dirname, '../uploads/applicants', applicant.cv));
    }

    await Applicant.findByIdAndDelete(id);
    res.status(200).json({ message: 'Applicant deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete applicant', error: err.message });
  }
};
