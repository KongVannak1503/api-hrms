const Interview = require('../models/Interview');
const JobApplication = require('../models/JobApplication');

// 1️⃣ Schedule interview (create interview record)
exports.scheduleInterview = async (req, res) => {
  try {
    const { applicant_id, job_id, interview_date, interviewers } = req.body;

    const interview = new Interview({
      applicant_id,
      job_id,
      interview_date,
      interviewers, // array of { interviewer_id, score, comment } (optional initially)
      status: 'scheduled'
    });

    await interview.save();
    res.status(201).json(interview);
  } catch (err) {
    console.error('Error scheduling interview:', err);
    res.status(500).json({ message: 'Failed to schedule interview' });
  }
};

// 2️⃣ Update interview (add scores, comments)
exports.completeInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    const total = interview.interviewers.reduce((sum, i) => sum + (i.score || 0), 0);
    const avg = interview.interviewers.length ? total / interview.interviewers.length : 0;

    interview.status = 'completed';
    interview.total_score = avg;
    await interview.save();

    const application = await JobApplication.findOne({
      applicant_id: interview.applicant_id,
      job_id: interview.job_id,
    });

    if (application) {
      application.interview_score = avg;
      if (application.status === 'test') {
        application.status = 'interview';
      }
      await application.save();
    }

    res.json(interview);
  } catch (err) {
    console.error('Error completing interview:', err);
    res.status(500).json({ message: 'Failed to complete interview' });
  }
};

// 3️⃣ Get all interviews by job
exports.getInterviewsByJob = async (req, res) => {
  try {
    const interviews = await Interview.find({ job_id: req.params.jobId })
      .populate('applicant_id')
      .populate('interviewers.interviewer_id');

    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching interviews' });
  }
};

// 4️⃣ Get all interviews by applicant
exports.getInterviewsByApplicant = async (req, res) => {
  try {
    const interviews = await Interview.find({ applicant_id: req.params.applicantId })
      .populate('job_id')
      .populate('interviewers.interviewer_id');

    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching applicant interviews' });
  }
};

// 5️⃣ Get one interview by ID
exports.getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate('applicant_id')
      .populate('job_id')
      .populate('interviewers.interviewer_id');

    if (!interview) return res.status(404).json({ message: 'Not found' });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching interview' });
  }
};
