const EducationLevel = require("../models/EducationLevel");

// Get all 
exports.getEducationLevels = async (req, res) => {
    try {
        const getEducationLevels = await EducationLevel.find().populate('createdBy', 'username').sort({ updatedAt: -1 });
        res.json(getEducationLevels);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getEducationLevel = async (req, res) => {
    const { id } = req.params;
    try {
        const getEducationLevel = await EducationLevel.findById(id);
        if (!getEducationLevel) return res.status(404).json({ message: "Education Level not found" });
        res.json(getEducationLevel);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
}

exports.createEducationLevel = async (req, res) => {
    const { name, isActive } = req.body;
    try {
        if (!name) {
            return res.status(400).json({ message: "name field is required" });
        }

        const createEducationLevel = new EducationLevel({ name, isActive, createdBy: req.user.id });
        await createEducationLevel.save();
        await createEducationLevel.populate('createdBy', 'username');
        res.status(201).json({ message: 'success', data: createEducationLevel });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.updateEducationLevel = async (req, res) => {
    const { id } = req.params;
    const { name, isActive } = req.body;
    try {
        let getEducationLevel = await EducationLevel.findById(id);
        if (!getEducationLevel) return res.status(404).json({ message: "EducationLevel not found" });

        if (!name) return res.status(400).json({ message: "name field is required" });

        let updateEducationLevel = await EducationLevel.findByIdAndUpdate(
            id,
            { name, isActive, updatedBy: req.user.id },
            { new: true }
        ).populate('createdAt', 'username').populate('updatedBy', 'username');

        res.status(200).json({ message: "success", data: updateEducationLevel });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteEducationLevel = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteEducationLevel = await EducationLevel.findByIdAndDelete(id);
        if (!deleteEducationLevel) return res.status(404).json({ message: "EducationLevel not found" });
        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}