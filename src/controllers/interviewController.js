const Interview = require('../models/Interview');
const JobApplication = require('../models/JobApplication');
const Employee = require('../models/Employee');
const fs = require('fs');
const path = require('path');

exports.createInterview = async (req, res) => {
  try {
    const { job_id, applicant_id, interviewer_ids, start_at, duration_min, location } = req.body;

    // Convert to match schema structure
    const interviewers = interviewer_ids.map(id => ({
      employee: id,
      score: 0,
      comment: ''
    }));

    const newInterview = await Interview.create({
      job_id,
      applicant_id,
      interviewers, // ✅ mapped correctly
      start_at,
      duration_min,
      location,
      status: 'scheduled'
    });

    // ✅ Update job application status to 'interview'
    await JobApplication.findOneAndUpdate(
      { job_id, applicant_id },
      { status: 'interview' }
    );

    res.status(201).json(newInterview);
  } catch (err) {
    console.error('❌ Interview Create Error:', err.message);
    res.status(500).json({ message: 'Failed to create interview', error: err.message });
  }
};

// Get all interviews
exports.getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate('job_id', 'job_title')
      .populate({
        path: 'applicant_id',
        select: 'full_name_en full_name_kh photo gender phone_no email marital_status current_province current_district current_commune current_village'
      })
      .populate({
        path: 'interviewers.employee',
        select: 'first_name_en last_name_en positionId image_url',
        populate: [
          { path: 'positionId', select: 'title_en title_kh description' },
          { path: 'image_url', select: 'path filename' },
        ]
      })
      .sort({ start_at: -1 });

      // ✅ Attach current_address to each applicant
      const transformed = interviews.map((interview) => {
      const applicant = interview.applicant_id;
      if (applicant && applicant._doc) {
        const addressParts = [
          applicant.current_province,
          applicant.current_district,
          applicant.current_commune,
          applicant.current_village
        ].filter(Boolean);

        // Attach combined address
        interview.applicant_id = {
          ...applicant._doc,
          current_address: addressParts.join(', ')
        };
      }
      return interview;
    });

    res.status(200).json(transformed);
  } catch (err) {
    console.error("Error fetching interviews:", err);
    res.status(500).json({ message: 'Failed to fetch interviews', error: err.message });
  }
};

// Get interview by ID
exports.getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('job_id', 'job_title')
      .populate('applicant_id', 'full_name_en full_name_kh phone_no email photo')
      .populate({
        path: 'interviewers.employee',
        select: 'first_name_en last_name_en positionId',
        populate: { path: 'positionId', select: 'title_en title_kh' }
      });

    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    res.status(200).json(interview);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get interview', error: err.message });
  }
};

exports.updateInterview = async (req, res) => {
  try {
    const updated = await Interview.findByIdAndUpdate(
      req.params.id,
      {
        start_at: req.body.start_at,
        duration_min: req.body.duration_min,
        location: req.body.location,
        interviewers: req.body.interviewer_ids.map(id => ({
          employee: id,
          score: 0,
          comment: ''
        }))
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Interview not found' });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update interview', error: err.message });
  }
};

exports.rescheduleInterview = async (req, res) => {
  try {
    const { start_at } = req.body;

    const updated = await Interview.findByIdAndUpdate(
      req.params.id,
      { start_at },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Interview not found' });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to reschedule interview', error: err.message });
  }
};

// Update interview score, feedback, status, attachment
exports.updateInterviewResult = async (req, res) => {
  try {

    const { id } = req.params;
    const { interviewers, status } = req.body;

    let parsedInterviewers = [];
    try {
      parsedInterviewers = JSON.parse(interviewers);
    } catch (err) {
      console.error("❌ Failed to parse interviewers JSON:", err.message);
      return res.status(400).json({ message: 'Invalid interviewers format' });
    }

    const interview = await Interview.findById(id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    const uploadedFiles = req.files || {};
    const updatedInterviewers = parsedInterviewers.map((i, idx) => {
      const fieldKey = `interviewer_${idx}`;
      const files = uploadedFiles[fieldKey] || [];
      const filePaths = files.map(file =>
        path.join('uploads/interview-attachments/', file.filename)
      );

      const current = interview.interviewers?.[idx] || {};
      const mergedAttachments = (current.attachments || []).concat(filePaths);

      return {
        employee: i.employee,
        score: i.score,
        comment: i.comment,
        attachments: mergedAttachments,
      };
    });

    interview.interviewers = updatedInterviewers;
    interview.status = status || interview.status;

    await interview.save();

    res.status(200).json({ message: 'Interview result updated successfully', interview });
  } catch (err) {
    console.error('❌ Error updating interview result:', err);
    res.status(500).json({ message: 'Failed to update result', error: err.message });
  }
};

exports.updateInterviewDecision = async (req, res) => {
  try {
    const { id } = req.params; // Interview ID
    const { decision } = req.body;

    // Validate decision
    if (!['hired', 'reserve', 'rejected'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision value' });
    }

    // Find Interview
    const interview = await Interview.findById(id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    // Update related Job Application
    const jobApp = await JobApplication.findOneAndUpdate(
      {
        job_id: interview.job_id,
        applicant_id: interview.applicant_id
      },
      { status: decision },
      { new: true }
    );

    if (!jobApp) {
      return res.status(404).json({ message: 'Job Application not found' });
    }

    // ✅ Save final decision AND mark interview as completed
    interview.final_decision = decision;
    interview.status = 'completed'; // ✅ Add this line
    await interview.save();

    return res.status(200).json({
      message: `Decision "${decision}" has been applied.`,
      interview,
      jobApplication: jobApp
    });

  } catch (err) {
    console.error('❌ Error in updateInterviewDecision:', err.message);
    return res.status(500).json({ message: 'Failed to update decision', error: err.message });
  }
};

// Cancel interview
exports.cancelInterview = async (req, res) => {
  try {
    const updated = await Interview.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', updated_by: req.user._id },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Interview not found' });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel interview', error: err.message });
  }
};
