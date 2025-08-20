const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    // name: {
    //     type: String,
    //     required: true,
    //     enum: ['admin', 'hr', 'upper manager', 'manager', 'employee'],
    // },
    role: {
        type: String,
        required: true,
        unique: true,
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
