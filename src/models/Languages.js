const mongoose = require('mongoose');

const languagesSchema = new mongoose.Schema({
    name_en: { type: String, required: true },
    name_kh: { type: String, required: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('LanguagesSelect', languagesSchema);
