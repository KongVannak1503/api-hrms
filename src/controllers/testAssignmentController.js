const TestAssignment = require('../models/TestAssignment');
const fs = require('fs');
const path = require('path');

// ✅ Create a new test assignment
exports.createTestAssignment = async (req, res) => {
  try {
    const {
      job_id,
      applicant_id,
      test_type,
      start_at,
      duration_min,
      location
    } = req.body;

    console.log("Incoming payload:", req.body);

    const assignment = await TestAssignment.create({
      job_id,
      applicant_id,
      test_type_scores: test_type.map(t => ({ test_type: t })),
      start_at,
      duration_min,
      location,
      created_by: req.user._id,
      updated_by: req.user._id
    });

    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create test assignment', error: err.message });
  }
};

// ✅ Get all test assignments
exports.getAllTestAssignments = async (req, res) => {
  try {
    const tests = await TestAssignment.find()
      .populate('job_id', 'job_title')
      .populate({
        path: 'applicant_id',
        select: 'full_name_en full_name_kh photo gender phone_no email'
      })
      .populate('test_type_scores.test_type', 'name_en')
      .sort({ start_at: -1 });

      // Add average_score manually
      const withAverage = tests.map(t => {
        const scores = t.test_type_scores || [];
        const total = scores.reduce((sum, s) => sum + (parseFloat(s.score) || 0), 0);
        const avg = scores.length ? (total / scores.length).toFixed(2) : null;

        return {
          ...t.toObject(), // flatten mongoose doc
          average_score: avg
        };
      });

    res.status(200).json(withAverage);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch test assignments', error: err.message });
  }
};

// ✅ Get single test assignment by ID
exports.getTestAssignmentById = async (req, res) => {
  try {
    const test = await TestAssignment.findById(req.params.id)
      .populate('job_id', 'job_title')
      .populate('test_type_scores.test_type', 'name_en')
      .populate({
        path: 'applicant_id',
        select: 'full_name_en email phone_no marital_status current_province current_district current_commune current_village'
      });

    if (!test) return res.status(404).json({ message: 'Test assignment not found' });

    // 👉 Build current_address from applicant_id fields
    const applicant = test.applicant_id;
    const addressParts = [
      applicant.current_province,
      applicant.current_district,
      applicant.current_commune,
      applicant.current_village
    ].filter(Boolean); // remove empty/null values

    // Attach to response
    test.applicant_id = {
      ...applicant._doc, // flatten Mongoose document
      current_address: addressParts.join(', ')
    };

    res.status(200).json(test);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get test assignment', error: err.message });
  }
};

// ✅ Update test assignment
exports.updateTestAssignment = async (req, res) => {
  try {
    const {
      test_type, // array of ObjectId from frontend
      start_at,
      duration_min,
      location
    } = req.body;

    const updates = {
      start_at,
      duration_min,
      location,
      updated_by: req.user._id
    };

    // 👇 Map test_type into test_type_scores if provided
    if (test_type && Array.isArray(test_type)) {
      updates.test_type_scores = test_type.map(tid => ({
        test_type: tid,
        score: 0 // or preserve existing scores if needed
      }));
    }

    const updated = await TestAssignment.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Test assignment not found' });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update test assignment', error: err.message });
  }
};

// Update schedule of test assignment
exports.updateScheduleTestAssignment = async (req, res) => {
  try {
    const {start_at} = req.body;

    if (!start_at) {
      return res.status(400).json({message: "Start time is required."});
    }

    const updated = await TestAssignment.findByIdAndUpdate(
      req.params.id, 
      {
        start_at,
        updated_by: req.user._id
      }, 
      {new: true}
    );

    if (!updated) {
      return res.status(404).json({message: "Test assignment not found"});
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete test assignment', error: error.message });
  }
}

// ✅ Delete test assignment
exports.deleteTestAssignment = async (req, res) => {
  try {
    const deleted = await TestAssignment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Test assignment not found' });

    res.status(200).json({ message: 'Test assignment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete test assignment', error: err.message });
  }
};

// ❗ Recommended: Separate route for cancel
exports.cancelTestAssignment = async (req, res) => {
  try {
    const updated = await TestAssignment.findByIdAndUpdate(
      req.params.id,
      {
        status: 'cancelled',
        updated_by: req.user._id
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Test assignment not found' });

    // 👉 Optional: update applicant status to 'cancelled' or 'rejected'
    // await Applicant.findByIdAndUpdate(updated.applicant_id, { status: 'cancelled' });

    res.status(200).json({ message: 'Test cancelled', data: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel test', error: err.message });
  }
};

// ✅ Get full detail of a test assignment
exports.getTestAssignmentDetail = async (req, res) => {
  try {
    const test = await TestAssignment.findById(req.params.id)
      .populate({
        path: 'applicant_id',
        select: 'full_name_en full_name_kh phone email gender photo cv'
      })
      .populate({
        path: 'job_id',
        select: 'job_title job_description department'
      })
      .populate({
        path: 'test_type',
        select: 'name_en description'
      });

    if (!test) {
      return res.status(404).json({ message: 'Test assignment not found' });
    }

    res.status(200).json(test);
  } catch (err) {
    console.error("Get test detail error:", err);
    res.status(500).json({ message: 'Failed to get test assignment detail', error: err.message });
  }
};

// ✅ Update feedback, attachment, scores, status
exports.updateTestResult = async (req, res) => {
  try {
    const { feedback, status, test_type_scores, existing_attachment } = req.body;

    // 🔁 Parse test_type_scores if string
    let parsedScores = [];
    if (typeof test_type_scores === 'string') {
      parsedScores = JSON.parse(test_type_scores);
    } else if (Array.isArray(test_type_scores)) {
      parsedScores = test_type_scores;
    }

    // 🧮 Calculate average score
    const averageScore = parsedScores.length
      ? parsedScores.reduce((sum, t) => sum + (parseFloat(t.score) || 0), 0) / parsedScores.length
      : 0;

    const updatePayload = {
      feedback,
      status,
      score: averageScore,
      test_type_scores: parsedScores,
      updated_by: req.user._id,
    };

    // ✅ Handle attachment logic
    if (req.file && req.file.filename) {
      updatePayload.attachment = req.file.filename; // new file
    } else if (existing_attachment) {
      updatePayload.attachment = existing_attachment; // keep old file
    }

    const updated = await TestAssignment.findByIdAndUpdate(
      req.params.id,
      { $set: updatePayload },
      { new: true }
    ).populate('test_type_scores.test_type', 'name_en');

    if (!updated) return res.status(404).json({ message: 'Test assignment not found' });

    res.status(200).json(updated);
  } catch (err) {
    console.error('Update Test Result Error:', err);
    res.status(500).json({ message: 'Failed to update test result', error: err.message });
  }
};

