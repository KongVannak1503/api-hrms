const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
    job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting' },
    applicant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant' },
    status: {
        type: String,
        enum: ['applied', 'shortlisted', 'test', 'interview', 'hired', 'reserve', 'rejected'],
        default: 'applied'
    },
    test_score: { type: Number }, // average of tests
    interview_score: { type: Number }, // average of interviews
    final_score: { type: Number },
    notes: { type: String },

    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},{
    timestamps: true,
});

module.exports = mongoose.model("JobApplication", jobApplicationSchema);