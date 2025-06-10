const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path if needed

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('❌ JWT Error:', error.message);
            return res.status(401).json({ message: 'Unauthorized or token invalid' });
        }
    } else {
        return res.status(401).json({ message: 'No token provided' });
    }
};

module.exports = { protect };
