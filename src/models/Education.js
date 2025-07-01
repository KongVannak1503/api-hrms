const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    level_id: { type: mongoose.Schema.Types.ObjectId, ref: 'EducationLevel' },
    university: { type: String, required: true },
    major: { type: String },
    degree: { type: String },
    title_thesis: { type: String },
    start_date: Date,
    end_date: Date,

    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Education', categorySchema);
