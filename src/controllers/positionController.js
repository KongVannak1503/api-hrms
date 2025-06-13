const Position = require("../models/Position");

// Get all position
exports.getPositions = async (req, res) => {
    try {
        const positions = await Position.find().populate('createdBy', 'username');
        res.json(positions);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getPosition = async (req, res) => {
    const { id } = req.params;
    try {
        const position = await Position.findById(id);
        if (!position) return res.status(404).json({ message: "Position not found" });
        res.json(position);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
}

exports.createPosition = async (req, res) => {
    const { title, description, isActive } = req.body;
    try {
        console.log(req.body);

        if (!title) {
            return res.status(400).json({ message: "Title field is required" });
        }

        const position = new Position({ title, description, isActive, createdBy: req.user.id });
        await position.save();
        await position.populate('createdBy', 'username');
        res.status(201).json({ message: 'success', data: position });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.updatePosition = async (req, res) => {
    const { id } = req.params;
    const { title, description, isActive } = req.body;
    try {
        let positionModel = await Position.findById(id);
        if (!positionModel) return res.status(404).json({ message: "Position not found" });

        if (!title) return res.status(400).json({ message: "Title field is required" });

        let position = await Position.findByIdAndUpdate(
            id,
            { title, description, isActive, updatedBy: req.user.id },
            { new: true }
        ).populate('createdAt', 'username').populate('updatedBy', 'username');

        res.status(200).json({ message: "success", data: position });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deletePosition = async (req, res) => {
    const { id } = req.params;
    try {
        const position = await Position.findByIdAndDelete(id);
        if (!position) return res.status(404).json({ message: "Position not found" });
        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}