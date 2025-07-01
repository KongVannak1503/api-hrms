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

const GeneralEducationSchema = new mongoose.Schema({
    university: { type: String },
    major: { type: String },
    supervisor_name: { type: String },
    start_date: { type: Date },
    end_date: { type: Date },
    level_id: { type: String }, // can change to ObjectId if referencing another model
    title_thesis: { type: String }
}, { _id: false });

const LanguageSchema = new mongoose.Schema({
    name: { type: String },

    // Reading Skills
    read_poor: { type: Boolean, default: false },
    read_fair: { type: Boolean, default: false },
    read_good: { type: Boolean, default: false },

    // Writing Skills
    write_poor: { type: Boolean, default: false },
    write_fair: { type: Boolean, default: false },
    write_good: { type: Boolean, default: false },

    // Speaking Skills
    speak_poor: { type: Boolean, default: false },
    speak_fair: { type: Boolean, default: false },
    speak_good: { type: Boolean, default: false },

    // Listening Skills
    listen_poor: { type: Boolean, default: false },
    listen_fair: { type: Boolean, default: false },
    listen_good: { type: Boolean, default: false }
}, { _id: false });

const ShortCourseSchema = new mongoose.Schema({
    institution: { type: String },
    subject: { type: String },
    start_date: { type: Date },
    end_date: { type: Date },
    level_id: { type: String }, // or Number, if referencing a level
    certificate: { type: String }, // could be the file name or title
}, { _id: false });

const employmentHistorySchema = new mongoose.Schema({
    position: { type: String, required: true },
    company: { type: String, required: true },
    supervisor_name: { type: String },
    start_date: { type: Date },
    end_date: { type: Date }
}, { _id: false });

const employeeSchema = new mongoose.Schema({
    employee_id: { type: String },
    first_name_kh: { type: String },
    first_name_en: { type: String },
    last_name_kh: { type: String },
    last_name_en: { type: String },
    gender: { type: String },
    height: { type: String },
    image_url: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
    date_of_birth: { type: Date },
    place_of_birth: { type: String },
    nationality: { type: String },
    maritalStatus: { type: String },
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
    district: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
    commune: { type: mongoose.Schema.Types.ObjectId, ref: 'Commune' },
    village: { type: mongoose.Schema.Types.ObjectId, ref: 'Village' },
    present_address: addressSchema,
    permanent_address: addressSchema,
    family_member: [familyMemberSchema],
    emergency_contact: [emergencyContactSchema],
    general_education: [GeneralEducationSchema],
    language: [LanguageSchema],
    short_course: [ShortCourseSchema],
    employment_history: [employmentHistorySchema],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
