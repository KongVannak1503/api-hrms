const mongoose = require('mongoose');


const AppraisalDaySchema = new mongoose.Schema({
    startDate: { type: Date, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    kpiTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'KpiTemplate' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });


module.exports = mongoose.model('AppraisalDay', AppraisalDaySchema);
