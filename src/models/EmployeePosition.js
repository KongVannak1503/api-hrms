const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    name: String,
    filename: String,
    type: String,
    size: String,
    path: String,
    extension: String,
}, { _id: false });  // no _id needed for subdocuments if you want

const employeePositionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    positionId: { type: String },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    joinDate: { type: Date, required: true },
    documents: [documentSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('EmployeePosition', employeePositionSchema);
