const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    permissions: [
        {
            permissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Permission' },
            actions: [{ type: String }], // subset of actions allowed
            isActive: { type: Boolean, default: true },

        }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
