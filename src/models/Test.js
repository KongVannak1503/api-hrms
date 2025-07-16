const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting' },
    test_type: { type: mongoose.Schema.Types.ObjectId, ref: 'TestType', required: true },
    title: { type: String, required: true },
    description: { type: String },
    max_score: { type: Number, default: 0},

    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},{
    timestamps: true
});

module.exports = mongoose.model("Test", testSchema);