const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  full_name_kh: { type: String, required: true },
  full_name_en: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  dob: { type: Date, required: true },
  marital_status: { type: String, enum: ['Single', 'Married', 'Other'] },
  phone_no: { type: String, required: true },
  email: { type: String },
  current_province: { type: String },
  current_district: { type: String },
  current_commune: { type: String },
  current_village: { type: String },

  photo: { type: String },
  cv: { type: String }, 
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, {
  timestamps: true
});

module.exports = mongoose.model('Applicant', applicantSchema);
