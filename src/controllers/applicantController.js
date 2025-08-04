const Applicant = require('../models/Applicant');
const JobApplication = require('../models/JobApplication');
const JobPosting = require('../models/JobPosting');
const TestAssignment = require('../models/TestAssignment');
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

    // 2. Fetch job applications
    const jobApps = await JobApplication.find({ applicant_id: { $in: applicantIds } })
      .populate('job_id', 'job_title')
      .sort({ createdAt: -1 });

    // 3. Fetch test assignments (latest by createdAt)
    const testAssignments = await TestAssignment.find({ applicant_id: { $in: applicantIds } })
      .sort({ createdAt: -1 }); // latest first

    const jobAppMap = new Map();
    const testAssignmentMap = new Map();

    // 👉 Map first (latest) job application per applicant
    jobApps.forEach(app => {
      const aid = app.applicant_id.toString();
      if (!jobAppMap.has(aid)) jobAppMap.set(aid, app);
    });

    // 👉 Map first (latest) test assignment per applicant
    testAssignments.forEach(ta => {
      const aid = ta.applicant_id.toString();
      if (!testAssignmentMap.has(aid)) testAssignmentMap.set(aid, ta.status); // only status needed
    });

    // 4. Map final response
    const mappedApplicants = applicants.map(applicant => {
      const aid = applicant._id.toString();
      const jobApp = jobAppMap.get(aid);
      const testStatus = testAssignmentMap.get(aid);

      return {
        ...applicant.toObject(),
        job_title: jobApp?.job_id?.job_title || null,
        job_id: jobApp?.job_id?._id || null,
        status: jobApp?.status || 'applied',
        job_application_id: jobApp?._id || null,
        applied_date: jobApp?.applied_date || null,
        test_assignment_status: testStatus || null,
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
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    // 👇 Find job application related to this applicant
    const jobApplications = await JobApplication.find({ applicant_id: id })
      .populate('job_id', 'job_title'); // optional: populate job title

    res.status(200).json({
      applicant,
      jobApplications, // array – use first if only one
    });
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
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    // ✅ Delete photo file if exists
    if (applicant.photo) {
      const photoPath = path.join(__dirname, '../uploads/applicants', applicant.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    // ✅ Delete CV file if exists
    if (applicant.cv) {
      const cvPath = path.join(__dirname, '../uploads/applicants', applicant.cv);
      if (fs.existsSync(cvPath)) {
        fs.unlinkSync(cvPath);
      }
    }

    // ✅ Delete related job applications
    await JobApplication.deleteMany({ applicant_id: id });

    // ✅ Delete the applicant
    await Applicant.findByIdAndDelete(id);

    res.status(200).json({ message: 'Applicant and related data deleted successfully' });
  } catch (err) {
    console.error('❌ Delete applicant failed:', err.message);
    res.status(500).json({ message: 'Failed to delete applicant', error: err.message });
  }
};

// ✅ Get only applicants with status "shortlisted"
exports.getShortlistedApplicants = async (req, res) => {
  try {
    console.log("✅ Fetching all applicants...");
    const applicants = await Applicant.find().sort({ createdAt: -1 });
    const applicantIds = applicants.map(app => app._id);

    console.log("✅ Fetching job applications with status 'shortlisted'...");
    const jobApps = await JobApplication.find({
      applicant_id: { $in: applicantIds },
      status: 'shortlisted'
    })
      .populate('job_id', 'job_title') // ✅ Make sure JobPosting model exists
      .sort({ createdAt: -1 });

    console.log("✅ Mapping job applications...");
    const jobAppMap = new Map();
    jobApps.forEach(app => {
      const applicantId = app.applicant_id?.toString(); // Make sure applicant_id is populated
      if (applicantId && !jobAppMap.has(applicantId)) {
        jobAppMap.set(applicantId, app);
      }
    });

    console.log("✅ Filtering shortlisted applicants...");
    const shortlistedApplicants = applicants
      .filter(applicant => jobAppMap.has(applicant._id.toString()))
      .map(applicant => {
        const jobApp = jobAppMap.get(applicant._id.toString());
        return {
          ...applicant.toObject(),
          job_title: jobApp?.job_id?.job_title || null,
          job_id: jobApp?.job_id?._id || null,
          status: jobApp?.status,
          job_application_id: jobApp?._id || null
        };
      });

    console.log("✅ Final result:", shortlistedApplicants.length);
    res.status(200).json(shortlistedApplicants);

  } catch (err) {
    console.error('❌ Error in getShortlistedApplicants:', err);
    res.status(500).json({
      message: 'Failed to fetch shortlisted applicants',
      error: err.message
    });
  }
};
