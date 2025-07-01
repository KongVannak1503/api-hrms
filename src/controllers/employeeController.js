const path = require('path');
const fs = require('fs');
const Employee = require("../models/Employee");
const File = require('../models/upload');

// Get all 
exports.getEmployees = async (req, res) => {
    try {
        const getEmployees = await Employee.find()
            .populate('image_url')
            .populate('createdBy', 'username').sort({ updatedAt: -1 });
        res.json(getEmployees);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        const getEmployee = await Employee.findById(id).populate('image_url')
            .populate('createdBy', 'username');
        if (!getEmployee) return res.status(404).json({ message: "Category not found" });
        res.json(getEmployee);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
}


exports.createEmployee = async (req, res) => {
    try {
        const {
            employee_id,
            first_name_en,
            last_name_en,
            first_name_kh,
            last_name_kh,
            gender,
            height,
            id_card_no,
            passport_no,
            date_of_birth,
            place_of_birth,
            nationality,
            maritalStatus,
            city,
            district,
            commune,
            village,
            isActive,
            present_address,
            permanent_address,
            family_members,
            emergency_contact,
            staff_relationships,
            language,
            employment_history,
            general_education,
            short_course,
            file
        } = req.body;

        // Validate required fields
        if (!employee_id) {
            return res.status(400).json({ message: 'First name, last name, and date of birth are required.' });
        }

        let imageUrl = null;
        console.log(file);

        if (req.file) {

            const { filename, size, mimetype, originalname } = req.file;
            const folder = 'employees';

            const file = new File({
                name: originalname,
                filename,
                size: (size / (1024 * 1024)).toFixed(2) + 'MB',
                type: mimetype,
                path: `uploads/${folder}/${filename}`,
                createdBy: req.user?._id,
            });

            await file.save();
            imageUrl = file._id;
        }

        // Parse JSON fields from FormData
        const parsedPresentAddress = present_address ? JSON.parse(present_address) : null;
        const parsedPermanentAddress = permanent_address ? JSON.parse(permanent_address) : null;
        const parsedFamilyMembers = family_members ? JSON.parse(family_members) : [];
        const parsedEmergencyContacts = emergency_contact ? JSON.parse(emergency_contact) : [];
        const parsedStaffRelationships = staff_relationships ? JSON.parse(staff_relationships) : [];
        const parsedLanguages = language ? JSON.parse(language) : [];
        const parsedEmploymentHistory = employment_history ? JSON.parse(employment_history) : [];
        const parsedGeneralEducation = general_education ? JSON.parse(general_education) : [];
        const parsedShortCourses = short_course ? JSON.parse(short_course) : [];

        // Create employee
        const createEmployee = new Employee({
            employee_id,
            first_name_en,
            last_name_en,
            first_name_kh,
            last_name_kh,
            gender,
            height,
            id_card_no,
            passport_no,
            date_of_birth,
            place_of_birth,
            nationality,
            maritalStatus,
            city,
            district,
            commune,
            village,
            isActive: isActive ?? true,
            image_url: imageUrl,
            present_address: parsedPresentAddress,
            permanent_address: parsedPermanentAddress,
            family_member: parsedFamilyMembers,
            emergency_contact: parsedEmergencyContacts,
            staff_relationships: parsedStaffRelationships,
            language: parsedLanguages,
            employment_history: parsedEmploymentHistory,
            general_education: parsedGeneralEducation,
            short_course: parsedShortCourses,
            createdBy: req.user?._id,
        });

        await createEmployee.save();
        const createEmployees = await Employee.findById(createEmployee._id)
            .populate('image_url')
            .populate('createdBy', 'username');

        res.status(201).json({ message: 'Employee created successfully', data: createEmployees });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("this is file", req.file);

        // Find existing employee
        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        // Destructure fields from request body
        const {
            employee_id,
            first_name_en,
            last_name_en,
            first_name_kh,
            last_name_kh,
            gender,
            height,
            date_of_birth,
            place_of_birth,
            nationality,
            maritalStatus,
            city,
            district,
            commune,
            village,
            isActive,
            present_address,
            permanent_address,
            family_members,
            emergency_contact,
            staff_relationships,
            language,
            employment_history,
            general_education,
            short_course,
            id_card_no,
            passport_no,
            file
            // file is handled via req.file (multipart)
        } = req.body;


        if (!employee_id || !first_name_en || !first_name_kh || !last_name_en || !last_name_kh) {
            return res.status(400).json({ message: 'First name, last name, and date of birth are required.' });
        }
        // Parse JSON fields
        const parsedPresentAddress = present_address ? JSON.parse(present_address) : null;
        const parsedPermanentAddress = permanent_address ? JSON.parse(permanent_address) : null;
        const parsedFamilyMembers = family_members ? JSON.parse(family_members) : [];
        const parsedEmergencyContacts = emergency_contact ? JSON.parse(emergency_contact) : [];
        const parsedStaffRelationships = staff_relationships ? JSON.parse(staff_relationships) : [];
        const parsedLanguages = language ? JSON.parse(language) : [];
        const parsedEmploymentHistory = employment_history ? JSON.parse(employment_history) : [];
        const parsedGeneralEducation = general_education ? JSON.parse(general_education) : [];
        const parsedShortCourses = short_course ? JSON.parse(short_course) : [];

        // Update the fields
        employee.employee_id = employee_id;
        employee.first_name_en = first_name_en;
        employee.last_name_en = last_name_en;
        employee.first_name_kh = first_name_kh;
        employee.last_name_kh = last_name_kh;
        employee.gender = gender;
        employee.height = height;
        employee.id_card_no = id_card_no;
        employee.passport_no = passport_no;
        employee.date_of_birth = date_of_birth;
        employee.place_of_birth = place_of_birth;
        employee.nationality = nationality;
        employee.maritalStatus = maritalStatus;
        employee.city = city;
        employee.district = district;
        employee.commune = commune;
        employee.village = village;
        employee.isActive = isActive ?? true;
        employee.present_address = parsedPresentAddress;
        employee.permanent_address = parsedPermanentAddress;
        employee.family_member = parsedFamilyMembers;
        employee.emergency_contact = parsedEmergencyContacts;
        employee.staff_relationships = parsedStaffRelationships;
        employee.language = parsedLanguages;
        employee.employment_history = parsedEmploymentHistory;
        employee.general_education = parsedGeneralEducation;
        employee.short_course = parsedShortCourses;

        // Handle image upload
        if (req.file) {
            // Delete old file if it exists
            if (employee.image_url) {
                const oldFile = await File.findById(employee.image_url);
                if (oldFile) {
                    const oldFilePath = path.join(__dirname, '..', oldFile.path);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                    await File.findByIdAndDelete(oldFile._id);
                }
            }

            // Save new file
            const { filename, size, mimetype, originalname } = req.file;
            const folder = 'employees';

            const newFile = new File({
                name: originalname,
                filename,
                size: (size / (1024 * 1024)).toFixed(2) + 'MB',
                type: mimetype,
                path: `uploads/${folder}/${filename}`,
                createdBy: req.user?._id,
            });

            await newFile.save();
            employee.image_url = newFile._id;
        }

        // Save updated employee
        await employee.save();

        // Populate image_url and createdBy if needed
        const updatedEmployee = await Employee.findById(employee._id)
            .populate('image_url')
            .populate('createdBy', 'username');

        res.json({ message: 'Employee updated successfully', data: updatedEmployee });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    const { id } = req.params;

    try {
        // Find employee
        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        // Assuming employee.image is a file reference ID or file data
        const fileId = employee.image_url; // if it's just an ID
        const fileRecord = await File.findById(fileId);

        // Delete the physical file if exists
        if (fileRecord?.path) {
            const filePath = path.join(__dirname, '..', fileRecord.path); // full server path
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Delete file record
        if (fileRecord) {
            await File.findByIdAndDelete(fileId);
        }

        // Delete employee record
        await Employee.findByIdAndDelete(id);

        res.json({ message: "Employee and associated file deleted successfully!" });

    } catch (error) {
        console.error('Error deleting employee:', error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};