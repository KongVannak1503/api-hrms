const path = require('path');
const fs = require('fs');
const Employee = require("../models/Employee");
const File = require('../models/upload');

// Get all 
exports.getEmployees = async (req, res) => {
    try {
        const getEmployees = await Employee.find()
            .populate('image_url')
            .populate('createdBy', 'username');
        res.json(getEmployees);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        const getEmployee = await Employee.findById(id);
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
            first_name,
            last_name,
            gender,
            height,
            date_of_birth,
            place_of_birth,
            nationality,
            present_address,
            permanent_address,
            family_members,
            emergency_contact,
            staff_relationships,
            isActive,
            file,
        } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !date_of_birth) {
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

        // Parse JSON fields (sent via FormData)
        const parsedPresentAddress = present_address ? JSON.parse(present_address) : null;
        const parsedPermanentAddress = permanent_address ? JSON.parse(permanent_address) : null;
        const parsedFamilyMembers = family_members ? JSON.parse(family_members) : [];
        const parsedEmergencyContact = emergency_contact ? JSON.parse(emergency_contact) : [];
        const parsedStaffRelationships = staff_relationships ? JSON.parse(staff_relationships) : [];

        // Create employee
        const createEmployee = new Employee({
            first_name,
            last_name,
            gender,
            height,
            date_of_birth,
            place_of_birth,
            nationality,
            present_address: parsedPresentAddress,
            permanent_address: parsedPermanentAddress,
            family_member: parsedFamilyMembers,
            emergency_contact: parsedEmergencyContact,
            staff_relationships: parsedStaffRelationships,
            image_url: imageUrl,
            isActive: isActive ?? true,
            createdBy: req.user?._id,
        });

        await createEmployee.save();
        await createEmployee
            .populate('image_url')
            .populate('createdBy', 'username');

        res.status(201).json({ message: 'Employee created successfully', data: createEmployee });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            first_name,
            last_name,
            gender,
            height,
            date_of_birth,
            place_of_birth,
            nationality,
            present_address,
            permanent_address,
            family_members,
            emergency_contact,
            staff_relationships,
            isActive,
        } = req.body;

        // Parse nested fields
        const parsedPresentAddress = present_address ? JSON.parse(present_address) : null;
        const parsedPermanentAddress = permanent_address ? JSON.parse(permanent_address) : null;
        const parsedFamilyMembers = family_members ? JSON.parse(family_members) : [];
        const parsedEmergencyContact = emergency_contact ? JSON.parse(emergency_contact) : [];
        const parsedStaffRelationships = staff_relationships ? JSON.parse(staff_relationships) : [];

        // Find employee
        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Handle new file upload (if a new image is sent)
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
            employee.image_url = file.path;
        }

        // Update fields
        employee.first_name = first_name;
        employee.last_name = last_name;
        employee.gender = gender;
        employee.height = height;
        employee.date_of_birth = date_of_birth;
        employee.place_of_birth = place_of_birth;
        employee.nationality = nationality;
        employee.present_address = parsedPresentAddress;
        employee.permanent_address = parsedPermanentAddress;
        employee.family_member = parsedFamilyMembers;
        employee.emergency_contact = parsedEmergencyContact;
        employee.staff_relationships = parsedStaffRelationships;
        employee.isActive = isActive ?? employee.isActive;
        employee.updatedBy = req.user?._id;

        await employee.save();
        await employee.populate('updatedBy', 'username');

        res.status(200).json({ message: 'Employee updated successfully', data: employee });
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
        console.log(fileRecord);

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