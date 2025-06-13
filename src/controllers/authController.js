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
        const { username, email, employeeId, role, password } = req.body;
        console.log(req.body);

        if (!username || !email || !password || !role) {
            console.log("error");

            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const user = new User({ username, email, employeeId, role, password });

        await user.save(); // Password will be hashed automatically by the model

        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    employeeId: user.employeeId,
                    role: user.role,
                    email: user.email,
                },
            },
        });
    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const signRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || !user.isActive) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.correctPassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const accessToken = signToken(user._id);
        const refreshToken = signRefreshToken(user._id);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            status: 'success',
            accessToken,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                },
            },
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.refreshToken = (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });

        const newAccessToken = signToken(decoded.id);
        res.json({ accessToken: newAccessToken });
    });
};

exports.logout = (req, res) => {
    res.clearCookie('refreshToken');
    res.status(204).send();
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


exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
