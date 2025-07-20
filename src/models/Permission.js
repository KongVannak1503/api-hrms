const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    route: { type: String, required: true },
    actions: [{ type: String, required: true }],
    roles: {
        type: [String],
        enum: ['admin', 'line manager', 'manager', 'employee'],
        required: true,
        default: ['admin'], // optional default
    }

});

module.exports = mongoose.model('Permission', permissionSchema);
