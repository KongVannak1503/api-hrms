const Commune = require("../models/Commune");

// Get all 
exports.getCommunes = async (req, res) => {
    try {
        const getCommunes = await Commune.find().populate('createdBy', 'username').sort({ updatedAt: -1 });
        res.json(getCommunes);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getCommune = async (req, res) => {
    const { id } = req.params;
    try {
        const getCommune = await Commune.findById(id);
        if (!getCommune) return res.status(404).json({ message: "Commune not found" });
        res.json(getCommune);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
}

exports.createCommune = async (req, res) => {
    const { name, isActive } = req.body;
    try {
        if (!name) {
            return res.status(400).json({ message: "name field is required" });
        }

        const createCommune = new Commune({ name, isActive, createdBy: req.user.id });
        await createCommune.save();
        await createCommune.populate('createdBy', 'username');
        res.status(201).json({ message: 'success', data: createCommune });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.updateCommune = async (req, res) => {
    const { id } = req.params;
    const { name, isActive } = req.body;
    try {
        let getCommune = await Commune.findById(id);
        if (!getCommune) return res.status(404).json({ message: "Commune not found" });

        if (!name) return res.status(400).json({ message: "name field is required" });

        let updateCommune = await Commune.findByIdAndUpdate(
            id,
            { name, isActive, updatedBy: req.user.id },
            { new: true }
        ).populate('createdAt', 'username').populate('updatedBy', 'username');

        res.status(200).json({ message: "success", data: updateCommune });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteCommune = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteCommune = await Commune.findByIdAndDelete(id);
        if (!deleteCommune) return res.status(404).json({ message: "Commune not found" });
        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}