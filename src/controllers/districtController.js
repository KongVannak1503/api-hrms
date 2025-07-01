const District = require("../models/District");

// Get all 
exports.getDistricts = async (req, res) => {
    try {
        const getDistricts = await District.find().populate('createdBy', 'username').sort({ updatedAt: -1 });
        res.json(getDistricts);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getDistrict = async (req, res) => {
    const { id } = req.params;
    try {
        const getDistrict = await District.findById(id);
        if (!getDistrict) return res.status(404).json({ message: "District not found" });
        res.json(getDistrict);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
}

exports.createDistrict = async (req, res) => {
    const { name, isActive } = req.body;
    try {
        if (!name) {
            return res.status(400).json({ message: "name field is required" });
        }

        const createDistrict = new District({ name, isActive, createdBy: req.user.id });
        await createDistrict.save();
        await createDistrict.populate('createdBy', 'username');
        res.status(201).json({ message: 'success', data: createDistrict });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.updateDistrict = async (req, res) => {
    const { id } = req.params;
    const { name, isActive } = req.body;
    try {
        let getDistrict = await District.findById(id);
        if (!getDistrict) return res.status(404).json({ message: "District not found" });

        if (!name) return res.status(400).json({ message: "name field is required" });

        let updateDistrict = await District.findByIdAndUpdate(
            id,
            { name, isActive, updatedBy: req.user.id },
            { new: true }
        ).populate('createdAt', 'username').populate('updatedBy', 'username');

        res.status(200).json({ message: "success", data: updateDistrict });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteDistrict = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteDistrict = await District.findByIdAndDelete(id);
        if (!deleteDistrict) return res.status(404).json({ message: "District not found" });
        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}