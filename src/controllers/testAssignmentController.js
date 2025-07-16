const TestAssignment = require('../models/TestAssignment');

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
      test_type,
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
      .populate('applicant_id', 'full_name_en')
      .populate('test_type', 'name_en') // populate test_type names
      .sort({ start_at: -1 });

    res.status(200).json(tests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch test assignments', error: err.message });
  }
};

// ✅ Get single test assignment by ID
exports.getTestAssignmentById = async (req, res) => {
  try {
    const test = await TestAssignment.findById(req.params.id)
      .populate('job_id', 'job_title')
      .populate('applicant_id', 'full_name_en')
      .populate('test_type', 'name_en');

    if (!test) return res.status(404).json({ message: 'Test assignment not found' });

    res.status(200).json(test);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get test assignment', error: err.message });
  }
};

// ✅ Update test assignment
exports.updateTestAssignment = async (req, res) => {
  try {
    const updates = { ...req.body, updated_by: req.user._id };

    const updated = await TestAssignment.findByIdAndUpdate(req.params.id, updates, { new: true });

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
