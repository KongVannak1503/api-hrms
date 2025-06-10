const User = require("../models/User");

// Get all users
exports.getUsers = async (req, res) => {
    try {
        const getUsers = await User.find().populate('role', 'name').sort({ updatedAt: -1 });
        res.json(getUsers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};