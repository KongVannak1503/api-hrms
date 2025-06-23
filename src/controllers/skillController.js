const Skill = require("../models/Skill");

// Get all 
exports.getSkills = async (req, res) => {
    try {
        const getSkills = await Skill.find().populate('createdBy', 'username');
        res.json(getSkills);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getSkill = async (req, res) => {
    const { id } = req.params;
    try {
        const getSkill = await Skill.findById(id);
        if (!getSkill) return res.status(404).json({ message: "Skill not found" });
        res.json(getSkill);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
}

exports.createSkill = async (req, res) => {
    const { title, description, isActive } = req.body;
    try {
        console.log(req.body);

        if (!title) {
            return res.status(400).json({ message: "Title field is required" });
        }

        const createSkill = new Skill({ title, description, isActive, createdBy: req.user.id });
        await createSkill.save();
        await createSkill.populate('createdBy', 'username');
        res.status(201).json({ message: 'success', data: createSkill });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.updateSkill = async (req, res) => {
    const { id } = req.params;
    const { title, description, isActive } = req.body;
    console.log(isActive);

    try {
        let getSkill = await Skill.findById(id);
        if (!getSkill) return res.status(404).json({ message: "Skill not found" });

        if (!title) return res.status(400).json({ message: "Title field is required" });

        let updateSkill = await Skill.findByIdAndUpdate(
            id,
            { title, description, isActive, updatedBy: req.user.id },
            { new: true }
        ).populate('createdAt', 'username').populate('updatedBy', 'username');

        res.status(200).json({ message: "success", data: updateSkill });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteSkill = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteSkill = await Skill.findByIdAndDelete(id);
        if (!deleteSkill) return res.status(404).json({ message: "Skill not found" });
        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}