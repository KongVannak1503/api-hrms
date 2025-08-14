const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    name: String,
    filename: String,
    type: String,
    size: String,
    path: String,
    extension: String,
}, { _id: false });

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    fullname: { type: String, required: true },
    email: { type: String },
    documents: documentSchema,
    social_media: { type: String },
    website_name: { type: String },
    phone: { type: String },
    address: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Organization', categorySchema);
