const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    payDate: { type: String },
    status: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);
