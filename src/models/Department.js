const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    title_en: { type: String, required: true },
    title_kh: { type: String, required: true },
    manager: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    employee: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    description: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
