const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    name: String,
    filename: String,
    type: String,
    size: String,
    path: String,
    extension: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const laborLawSchema = new mongoose.Schema({
    title: String,
    position: { type: mongoose.Schema.Types.ObjectId, ref: 'Position' },
    employee_type: String,
    duration: Date,
    file: [fileSchema],
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('EmployeeLaborLaw', laborLawSchema);
