const TestType = require('../models/TestType');

// ✅ Create Test Type
exports.createTestType = async (req, res) => {
  try {
    const { name_kh, name_en, description } = req.body;

    const newTestType = await TestType.create({
      name_kh,
      name_en,
      description,
      created_by: req.user._id,
      updated_by: req.user._id,
    });

    res.status(201).json(newTestType);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create test type', error: err.message });
  }
};

// ✅ Get All Test Types
exports.getAllTestTypes = async (req, res) => {
  try {
    const types = await TestType.find().sort({ createdAt: -1 });
    res.status(200).json(types);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch test types', error: err.message });
  }
};

// ✅ Get Single Test Type by ID
exports.getTestTypeById = async (req, res) => {
  try {
    const type = await TestType.findById(req.params.id);
    if (!type) return res.status(404).json({ message: 'Test type not found' });

    res.status(200).json(type);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch test type', error: err.message });
  }
};

// ✅ Update Test Type
exports.updateTestType = async (req, res) => {
  try {
    const { name_kh, name_en, description } = req.body;

    const updated = await TestType.findByIdAndUpdate(
      req.params.id,
      {
        name_kh,
        name_en,
        description,
        updated_by: req.user._id,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Test type not found' });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update test type', error: err.message });
  }
};

// ✅ Delete Test Type
exports.deleteTestType = async (req, res) => {
  try {
    const deleted = await TestType.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Test type not found' });

    res.status(200).json({ message: 'Test type deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete test type', error: err.message });
  }
};
