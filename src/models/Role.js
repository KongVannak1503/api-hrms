const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['admin', 'line manager', 'manager', 'employee'],
    },
    permissions: [
        {
            permissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Permission' },
            actions: [{ type: String }],
            isActive: { type: Boolean, default: true },

        }
    ],
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
