const Department = require("../models/Department");

// Get all 
exports.getDepartments = async (req, res) => {
    try {
        const getDepartments = await Department.find().populate('createdBy', 'username');
        res.json(getDepartments);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getDepartment = async (req, res) => {
    const { id } = req.params;
    try {
        const getDepartment = await Department.findById(id);
        if (!getDepartment) return res.status(404).json({ message: "Department not found" });
        res.json(getDepartment);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
}

exports.createDepartment = async (req, res) => {
    const { title, description, isActive } = req.body;
    try {
        if (!title) {
            return res.status(400).json({ message: "Title field is required" });
        }

        const createDepartment = new Department({ title, description, isActive, createdBy: req.user.id });
        await createDepartment.save();
        await createDepartment.populate('createdBy', 'username');
        res.status(201).json({ message: 'success', data: createDepartment });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.updateDepartment = async (req, res) => {
    const { id } = req.params;
    const { title, description, isActive } = req.body;
    try {
        let getDepartment = await Department.findById(id);
        if (!getDepartment) return res.status(404).json({ message: "Department not found" });

        if (!title) return res.status(400).json({ message: "Title field is required" });

        let updateDepartment = await Department.findByIdAndUpdate(
            id,
            { title, description, isActive, updatedBy: req.user.id },
            { new: true }
        ).populate('createdAt', 'username').populate('updatedBy', 'username');

        res.status(200).json({ message: "success", data: updateDepartment });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteDepartment = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteDepartment = await Department.findByIdAndDelete(id);
        if (!deleteDepartment) return res.status(404).json({ message: "Department not found" });
        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}