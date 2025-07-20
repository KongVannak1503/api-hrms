const Position = require("../models/Position");

// Get all position
exports.getPositions = async (req, res) => {
    try {
        const positions = await Position.find().populate('department', 'title').populate('createdBy', 'username');

        res.json(positions);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

exports.getPosition = async (req, res) => {
    const { id } = req.params;
    try {
        const position = await Position.findById(id).populate('department', 'title');

        if (!position) return res.status(404).json({ message: "Position not found" });

        res.json(position);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: error.message });
    }
}

// Get positions by department ID
exports.getPositionsByDepartment = async (req, res) => {
    const { departmentId } = req.params;
    try {
        const positions = await Position.find({ department: departmentId });
        res.json(positions);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

exports.createPosition = async (req, res) => {
    const { title_en, title_kh, description, department, isActive } = req.body;
    try {
        console.log(req.body);

        if (!title_en || !title_kh || !department) {
            return res.status(400).json({ message: "Title and department are required" });
        }

        const newPosition = new Position({
            title_en, title_kh,
            description,
            department,
            isActive,
            createdBy: req.user.id,
        });
        await newPosition.save();
        await newPosition.populate('department', 'title');
        await newPosition.populate('createdBy', 'username');

        res.status(201).json({ message: 'success', data: newPosition });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.updatePosition = async (req, res) => {
    const { id } = req.params;
    const { title_en, title_kh, description, department, isActive } = req.body;
    try {
        const position = await Position.findById(id);
        if (!position) return res.status(404).json({ message: "Position not found" });

        if (!title_en || !title_kh || !department) {
            return res.status(400).json({ message: "Title and department are required" });
        }

        const updated = await Position.findByIdAndUpdate(
            id,
            {
                title_en, title_kh,
                description,
                department,
                isActive,
                updatedBy: req.user.id
            },
            { new: true }
        ).populate('department', 'title')
            .populate('updatedBy', 'username');

        res.status(200).json({ message: "success", data: updated });
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