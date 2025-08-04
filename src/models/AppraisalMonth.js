const mongoose = require('mongoose');


const AppraisalMonthSchema = new mongoose.Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reminder: { type: Number, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    kpiTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'KpiTemplate' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });


module.exports = mongoose.model('AppraisalMonth', AppraisalMonthSchema);
