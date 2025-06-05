const Permission = require('../models/Permission');

// Get all roles
exports.getRoles = async (req, res) => {
    try {
        const Permissions = await Permission.find();
        res.json(Permissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};