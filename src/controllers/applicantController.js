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
      .populate('updated_by', 'name')
      .sort({ createdAt: -1 });;
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

exports.getApplicantsByJob = async (req, res) => {
  try {
    const applicants = await Applicant.find({ job_posting_id: req.params.jobId });
    res.status(200).json(applicants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applicants' });
  }
};

// Update entire applicant
exports.updateApplicant = async (req, res) => {
  try {
    const id = req.params.id;

    const {
      full_name_kh, full_name_en, gender, dob, material_status,
      phone_no, email, nationality,
      current_province, current_district, current_commune, current_village,
      job_posting_id, updated_by
    } = req.body;

    const existingApplicant = await Applicant.findById(id);
    if (!existingApplicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    // Check if new files uploaded
    const newPhoto = req.files?.photo?.[0]?.filename || null;
    const newCv = req.files?.cv?.[0]?.filename || null;

    // Remove old photo if replaced
    if (newPhoto && existingApplicant.photo) {
      const oldPhotoPath = path.join('uploads', existingApplicant.photo);
      if (fs.existsSync(oldPhotoPath)) fs.unlinkSync(oldPhotoPath);
    }

    // Remove old CV if replaced
    if (newCv && existingApplicant.cv) {
      const oldCvPath = path.join('uploads', existingApplicant.cv);
      if (fs.existsSync(oldCvPath)) fs.unlinkSync(oldCvPath);
    }

    // Update fields
    existingApplicant.full_name_kh = full_name_kh;
    existingApplicant.full_name_en = full_name_en;
    existingApplicant.gender = gender;
    existingApplicant.dob = dob;
    existingApplicant.material_status = material_status;
    existingApplicant.phone_no = phone_no;
    existingApplicant.email = email;
    existingApplicant.nationality = nationality;
    existingApplicant.current_province = current_province;
    existingApplicant.current_district = current_district;
    existingApplicant.current_commune = current_commune;
    existingApplicant.current_village = current_village;
    existingApplicant.job_posting_id = job_posting_id;
    existingApplicant.updated_by = updated_by;

    if (newPhoto) existingApplicant.photo = newPhoto;
    if (newCv) existingApplicant.cv = newCv;

    await existingApplicant.save();

    res.json(existingApplicant);
  } catch (err) {
    console.error("Error updating applicant:", err);
    res.status(500).json({ message: 'Failed to update applicant' });
  }
};

// Delete applicant
exports.deleteApplicant = async (req, res) => {
  try {
    const applicant = await Applicant.findByIdAndDelete(req.params.id);
    if (!applicant) return res.status(404).json({ message: 'Not found' });

    const basePath = path.join(__dirname, '../uploads/applicants');

    // Remove photo safely
    if (applicant.photo) {
      const photoPath = path.join(basePath, applicant.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // Remove CV safely
    if (applicant.cv) {
      const cvPath = path.join(basePath, applicant.cv);
      if (fs.existsSync(cvPath)) {
        fs.unlinkSync(cvPath);
      }
    }

    return res.status(200).json({ message: 'Applicant deleted successfully' });
  } catch (err) {
    console.error('Error deleting applicant:', err);
    return res.status(500).json({ message: 'Failed to delete applicant' });
  }
};

