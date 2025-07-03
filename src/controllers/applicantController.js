const Applicant = require('../models/Applicant');
const path = require('path');
const fs = require('fs');

// Create new applicant
exports.createApplicant = async (req, res) => {
  try {
    const {
      full_name_kh, full_name_en, gender, dob, material_status,
      phone_no, email, nationality,
      current_province, current_district, current_commune, current_village,
      job_posting_id, created_by
    } = req.body;

    const photo = req.files?.photo?.[0]?.filename || null;
    const cv = req.files?.cv?.[0]?.filename || null;

    const applicant = new Applicant({
      full_name_kh, full_name_en, gender, dob,
      material_status, phone_no, email, nationality,
      current_province, current_district, current_commune, current_village,
      job_posting_id,
      photo,
      cv,
      created_by,
      updated_by: created_by, // default same as creator
    });

    await applicant.save();
    res.status(201).json(applicant);
  } catch (error) {
    console.error("Error creating applicant:", error);
    res.status(500).json({ message: 'Failed to create applicant' });
  }
};

// Get all applicants
exports.getAllApplicants = async (req, res) => {
  try {
    const applicants = await Applicant.find()
      .populate('job_posting_id')
      .populate('created_by', 'name')
      .populate('updated_by', 'name');
    res.json(applicants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single applicant by ID
exports.getApplicantById = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id)
      .populate('job_posting_id')
      .populate('created_by', 'name')
      .populate('updated_by', 'name');
    if (!applicant) return res.status(404).json({ message: "Applicant not found" });
    res.json(applicant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update applicant status only
exports.updateApplicantStatus = async (req, res) => {
  try {
    const { status, updated_by } = req.body;
    const allowed = ['Review', 'Shortlist', 'Interview', 'Fail', 'Reserve', 'Hired'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      { status, updated_by },
      { new: true }
    );
    
    if (!applicant) return res.status(404).json({ message: "Applicant not found" });

    res.json(applicant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete applicant
exports.deleteApplicant = async (req, res) => {
  try {
    const applicant = await Applicant.findByIdAndDelete(req.params.id);
    if (!applicant) return res.status(404).json({ message: 'Not found' });

    // Optionally delete files
    if (applicant.photo) fs.unlinkSync(path.join('uploads', applicant.photo));
    if (applicant.cv) fs.unlinkSync(path.join('uploads', applicant.cv));

    res.json({ message: 'Applicant deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
