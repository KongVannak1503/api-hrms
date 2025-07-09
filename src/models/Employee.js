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


const employeeSchema = new mongoose.Schema({
    employee_id: { type: String },
    first_name_kh: { type: String },
    first_name_en: { type: String },
    last_name_kh: { type: String },
    last_name_en: { type: String },
    name_kh: { type: String },
    name_en: { type: String },
    gender: { type: String },
    email: { type: String },
    phone: { type: String },
    id_card_no: { type: String },
    passport_no: { type: String },
    image_url: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
    date_of_birth: { type: Date },
    place_of_birth: { type: String },
    nationality: { type: String },
    maritalStatus: { type: String },
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
    district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
    commune: { type: mongoose.Schema.Types.ObjectId, ref: 'Commune' },
    village: { type: mongoose.Schema.Types.ObjectId, ref: 'Village' },
    present_city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
    present_district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
    present_commune: { type: mongoose.Schema.Types.ObjectId, ref: 'Commune' },
    present_village: { type: mongoose.Schema.Types.ObjectId, ref: 'Village' },
    // present_address: addressSchema,
    // permanent_address: addressSchema,
    family_member: [familyMemberSchema],
    emergency_contact: [emergencyContactSchema],

    post: {
        type: Boolean,
        default: false,
    },

    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
