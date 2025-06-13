const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    size: { type: String }, // You can use Number if you prefer bytes
    type: { type: String },  // e.g., 'image/jpeg'
    path: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', fileSchema);
