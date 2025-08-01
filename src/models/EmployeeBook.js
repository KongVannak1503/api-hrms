const mongoose = require('mongoose');

const employeeBookSchema = new mongoose.Schema({
    title: String,
    name: String,
    filename: String,
    type: String,
    size: String,
    path: String,
    extension: String,
    start_date: Date,
    end_date: Date,
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('EmployeeBooks', employeeBookSchema);
