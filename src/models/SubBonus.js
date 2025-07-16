const mongoose = require('mongoose');

const bonusSchema = new mongoose.Schema({
    bonusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bonus' },
    isSix: { type: Boolean },
    isTwelve: { type: Boolean },
    isSixTotal: { type: Number },
    isTwelveTotal: { type: Number },
    total: { type: Number },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('SubBonus', bonusSchema);
