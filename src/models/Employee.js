const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    email: String,
    phone: String,
    description: String,
}, { _id: false });

const familyMemberSchema = new mongoose.Schema({
    name: String,
    phone: String,
    position: String,
    relationship: String,
}, { _id: false });

const emergencyContactSchema = new mongoose.Schema({
    name: String,
    phone: String,
    position: String,
    relationship: String,
}, { _id: false });

const staffRelationshipsSchema = new mongoose.Schema({
    name: String,
    date_of_birth: Date,
    position: String,
    relationship: String
}, { _id: false });

const employeeSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    gender: { type: String },
    height: { type: String },
    image_url: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
    date_of_birth: { type: Date },
    place_of_birth: { type: String },
    nationality: { type: String },
    maritalStatus: { type: String },
    present_address: addressSchema,
    permanent_address: addressSchema,
    family_member: [familyMemberSchema],
    emergency_contact: [emergencyContactSchema],
    staff_relationships: [staffRelationshipsSchema],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
