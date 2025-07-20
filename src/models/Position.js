const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
    title_en: { type: String, required: true },
    title_kh: { type: String, required: true },
    description: String,
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Position', positionSchema);
