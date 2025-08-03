const mongoose = require('mongoose');

const SubKpiItemSchema = new mongoose.Schema({
    title: { type: String, required: true }
});

const MainKpiSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subs: [SubKpiItemSchema]
});

const KpiTemplateSchema = new mongoose.Schema({
    subs: [MainKpiSchema],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });


module.exports = mongoose.model('KpiTemplateDay', KpiTemplateSchema);
