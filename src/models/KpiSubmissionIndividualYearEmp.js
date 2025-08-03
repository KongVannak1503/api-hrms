const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KpiSubmissionSchema = new Schema({
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'KpiTemplate', required: true },
    scores: [
        {
            subId: { type: Schema.Types.ObjectId, required: true },
            score: { type: Number, required: true }
        }
    ],
    feedback: { type: String },
}, {
    timestamps: true
});

module.exports = mongoose.model('KpiSubmissionIndividualYearEmp', KpiSubmissionSchema);
