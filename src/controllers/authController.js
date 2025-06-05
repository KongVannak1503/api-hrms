const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require('dotenv').config();

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const user = new User({ username, email, password });

        await user.save(); // Password will be hashed automatically by the model

        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                },
            },
        });
    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.correctPassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = signToken(user._id);

        res.json({
            status: 'success',
            token,
            data: { user: { id: user._id, username: user.username } },
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


exports.accessToken = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id).populate({
            path: 'role',
            populate: {
                path: 'permissions.permissionId',
            },
        });


        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Clean permissions structure for frontend
        const cleanPermissions = user.role.permissions.map(p => ({
            route: p.permissionId.route,
            actions: p.actions,
        }));

        const role = {
            name: user.role.name,
            permissions: cleanPermissions,
        };

        const userInfo = {
            id: user._id,
            username: user.username,
            email: user.email,
        };

        return res.status(200).json({
            status: 'success',
            user: userInfo,
            role: role,
        });
    } catch (error) {
        console.error('Access token fetch failed:', error.message);
        return res.status(500).json({ message: 'Server error' });
    }
};
