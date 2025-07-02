const mongoose = require('mongoose');

const employeeDocumentSchema = new mongoose.Schema({
    name: String,
    filename: String,
    type: String,
    size: String,
    path: String,
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('EmployeeDocument', employeeDocumentSchema);
