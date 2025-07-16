const mongoose = require('mongoose');

const testTypeSchema = new mongoose.Schema({
    name_kh: { type: String, required: true },
    name_en: {type: String, required: true},
    description: { type: String },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('TestType', testTypeSchema);