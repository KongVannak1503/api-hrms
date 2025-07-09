const mongoose = require('mongoose');

const employeeNssfDocumentSchema = new mongoose.Schema({
    title: String,
    name: String,
    filename: String,
    type: String,
    size: String,
    path: String,
    extension: String,
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('EmployeeNssfDocument', employeeNssfDocumentSchema);
