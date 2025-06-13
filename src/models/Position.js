const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    description: String,
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Position', positionSchema);
