const mongoose = require('mongoose');


const GeneralEducationSchema = new mongoose.Schema({
    university: { type: String },
    major: { type: String },
    supervisor_name: { type: String },
    start_date: { type: Date },
    end_date: { type: Date },
    level_id: { type: mongoose.Schema.Types.ObjectId, ref: 'EducationLevel' },
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
    level_id: { type: mongoose.Schema.Types.ObjectId, ref: 'EducationLevel' },
    certificate: { type: String },
}, { _id: false });


const EducationSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    general_education: [GeneralEducationSchema],
    language: [LanguageSchema],
    short_course: [ShortCourseSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Education', EducationSchema);
