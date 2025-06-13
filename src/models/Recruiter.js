const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    dob: { type: Date },
    phone: { type: String },
    email: { type: String, lowercase: true },
    address: { type: String },
    maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'] },

    position: { type: String },        // Job title
    department: { type: String },
    hireDate: { type: Date },
    salary: { type: Number },

    profilePhoto: { type: String },   // e.g. path to uploaded image

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
}, {
    timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);
