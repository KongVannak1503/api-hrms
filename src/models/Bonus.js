const mongoose = require('mongoose');

const bonusSchema = new mongoose.Schema({
    payDate: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Bonus', bonusSchema);
