const mongoose = require('mongoose');

const employeeNssfSchema = new mongoose.Schema({
    claimTitle: String,
    claimType: String,
    claimOther: String,
    claimDate: Date,
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('EmployeeNssf', employeeNssfSchema);
