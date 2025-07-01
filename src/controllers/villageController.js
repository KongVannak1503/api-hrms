const Village = require("../models/Village");

// Get all 
exports.getVillages = async (req, res) => {
    try {
        const getVillages = await Village.find().populate('createdBy', 'username').sort({ updatedAt: -1 });
        res.json(getVillages);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getVillage = async (req, res) => {
    const { id } = req.params;
    try {
        const getVillage = await Village.findById(id);
        if (!getVillage) return res.status(404).json({ message: "Village not found" });
        res.json(getVillage);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
}

exports.createVillage = async (req, res) => {
    const { name, isActive } = req.body;
    try {
        if (!name) {
            return res.status(400).json({ message: "name field is required" });
        }

        const createVillage = new Village({ name, isActive, createdBy: req.user.id });
        await createVillage.save();
        await createVillage.populate('createdBy', 'username');
        res.status(201).json({ message: 'success', data: createVillage });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.updateVillage = async (req, res) => {
    const { id } = req.params;
    const { name, isActive } = req.body;
    try {
        let getVillage = await Village.findById(id);
        if (!getVillage) return res.status(404).json({ message: "Village not found" });

        if (!name) return res.status(400).json({ message: "name field is required" });

        let updateVillage = await Village.findByIdAndUpdate(
            id,
            { name, isActive, updatedBy: req.user.id },
            { new: true }
        ).populate('createdAt', 'username').populate('updatedBy', 'username');

        res.status(200).json({ message: "success", data: updateVillage });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteVillage = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteVillage = await Village.findByIdAndDelete(id);
        if (!deleteVillage) return res.status(404).json({ message: "Village not found" });
        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}