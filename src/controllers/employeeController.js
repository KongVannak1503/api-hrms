const Employee = require("../models/Employee");
const File = require('../models/upload');
// Get all 
exports.getEmployees = async (req, res) => {
    try {
        const getEmployees = await Employee.find().populate('createdBy', 'username');
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
    const {
        first_name, last_name,
        date_of_birth, place_of_birth,
        nationality, gender,
        height, maritalStatus,
        present_address, permanent_address,
        isActive,
    } = req.body;
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { filename, size, mimetype, path: filePath, originalname } = req.file;
        const folder = 'employees';

        const file = new File({
            name: originalname,
            filename,
            size: (size / (1024 * 1024)).toFixed(2) + 'MB',
            type: mimetype,
            path: `uploads/${folder}/${filename}`, // ← more accurate
            createdBy: req.user?._id // avoid crash if user is undefined
        });

        await file.save();
        if (!first_name, !last_name, !date_of_birth) {
            return res.status(400).json({ message: "Title field is required" });
        }

        const createEmployee = new Category({
            first_name, last_name,
            date_of_birth, place_of_birth,
            nationality, gender,
            height, maritalStatus,
            present_address, permanent_address,
            isActive, createdBy: req.user.id
        });
        await createEmployee.save();
        await createEmployee.populate('createdBy', 'username');
        res.status(201).json({ message: 'success', data: createEmployee });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { title, description, isActive } = req.body;
    try {
        let getEmployee = await Employee.findById(id);
        if (!getEmployee) return res.status(404).json({ message: "Category not found" });

        if (!title) return res.status(400).json({ message: "Title field is required" });

        let updateCategory = await Employee.findByIdAndUpdate(
            id,
            { title, description, isActive, updatedBy: req.user.id },
            { new: true }
        ).populate('createdAt', 'username').populate('updatedBy', 'username');

        res.status(200).json({ message: "success", data: updateCategory });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteCategory = await Employee.findByIdAndDelete(id);
        if (!deleteCategory) return res.status(404).json({ message: "Category not found" });
        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}