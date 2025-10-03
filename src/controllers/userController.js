const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require('bcrypt');
// Get all users
exports.getUsers = async (req, res) => {
    try {

        const getUsers = await User.find()
            .populate('role', 'role')
            .populate('createdBy', 'username')
            .select('-password').sort({ updatedAt: -1 });
        res.json(getUsers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get  user
exports.getUser = async (req, res) => {
    try {

        const getUsers = await User.findById(req.params.id)
            .populate({
                path: 'employeeId',
                populate: {
                    path: 'image_url',
                    model: 'File',
                },
                select: 'name name_kh image_url',
            })
            .populate({
                path: 'role',
                populate: {
                    path: 'permissions.permissionId',
                    model: 'Permission',
                    select: 'name',
                }
            })
            .select('-password');
        res.json(getUsers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { username, email, employeeId, role, password, isActive } = req.body;

        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const user = new User({ username, email, employeeId, role, password, isActive, createdBy: req.user.id, });

        let createUser = await user.save(); // Password will be hashed automatically by the model
        const getUser = await User.findById(createUser?._id).populate('role', 'name').select('-password');
        res.status(201).json({
            status: 'success',
            data: getUser
        });
    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update User by ID (Handles Image Replacement)
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, employeeId, password, role, isActive } = req.body;

    try {
        let user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found." });

        const existingUser = await User.findOne({
            $or: [{ username }],
            _id: { $ne: id }
        });
        if (existingUser) return res.status(400).json({ message: "Username  already taken." });
        let updatedPassword = user.password;
        if (password) {
            updatedPassword = await bcrypt.hash(password, 10);
        }
        // Update user
        user = await User.findByIdAndUpdate(
            id,
            { username, employeeId, password: updatedPassword, role, isActive, updatedBy: req.user.id, },
            { new: true }
        ).populate('role', 'role').select('-password');

        res.status(200).json({ message: "User updated successfully", data: user });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'user not found' });
        res.json({ message: 'user deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const File = require('../models/upload');

exports.uploadSingleFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { filename, size, mimetype, path: filePath, originalname } = req.file;
        const folder = 'users';

        const file = new File({
            name: originalname,
            filename,
            size: (size / (1024 * 1024)).toFixed(2) + 'MB',
            type: mimetype,
            path: `uploads/${folder}/${filename}`, // ← more accurate
            createdBy: req.user?._id // avoid crash if user is undefined
        });

        await file.save();

        res.status(201).json({ message: 'File uploaded', file });
    } catch (err) {
        console.error('Upload Error:', err); // <== ADD THIS
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
};


exports.uploadMultipleFiles = async (req, res) => {
    try {
        const files = await Promise.all(req.files.map(file => {
            return File.create({
                filename: file.filename,
                size: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
                type: file.mimetype,
                path: file.path,
                createdBy: req.user._id
            });
        }));

        res.status(201).json({ message: 'Files uploaded', files });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
