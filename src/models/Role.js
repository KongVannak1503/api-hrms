const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    permissions: [
        {
            permissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Permission' },
            actions: [{ type: String }], // subset of actions allowed
            isActive: { type: Boolean, default: true },
            createdBy: [{ type: String }],
            updatedBy: [{ type: String }],
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
