const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    read_poor: { type: Boolean, default: false },
    read_fair: { type: Boolean, default: false },
    read_good: { type: Boolean, default: false },
    write_poor: { type: Boolean, default: false },
    write_fair: { type: Boolean, default: false },
    write_good: { type: Boolean, default: false },
    speak_poor: { type: Boolean, default: false },
    speak_fair: { type: Boolean, default: false },
    speak_good: { type: Boolean, default: false },
    listen_poor: { type: Boolean, default: false },
    listen_fair: { type: Boolean, default: false },
    listen_good: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Language', languageSchema);
