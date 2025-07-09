const mongoose = require('mongoose');

const employeeBodyBookSchema = new mongoose.Schema({
    title: String,
    name: String,
    filename: String,
    type: String,
    size: String,
    path: String,
    extension: String,
    start_date: Date,
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('EmployeeBodyBooks', employeeBodyBookSchema);
