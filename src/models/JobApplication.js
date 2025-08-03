const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
    job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting' },
    applicant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant' },
    applied_date: { type: Date, required: true },
    status: {
        type: String,
        enum: ['applied', 'shortlisted', 'test', 'interview', 'hired', 'reserve', 'rejected'],
        default: 'applied'
    },
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},{
    timestamps: true,
});

module.exports = mongoose.model("JobApplication", jobApplicationSchema);