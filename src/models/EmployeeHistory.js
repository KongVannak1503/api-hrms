const mongoose = require('mongoose');

const employmentHistorySchema = new mongoose.Schema({
    position: { type: String },
    company: { type: String },
    supervisor_name: { type: String },
    phone: { type: String },
    start_date: { type: Date },
    end_date: { type: Date }
}, { _id: false });

const employeeHistorySchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    employment_history: [employmentHistorySchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('EmployeeHistory', employeeHistorySchema);
