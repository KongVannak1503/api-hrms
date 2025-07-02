const path = require('path');
const fs = require('fs');
const EmployeeDocument = require("../models/EmployeeDocument");
const File = require('../models/upload');
// Get all 
exports.getEmployeeDocuments = async (req, res) => {
    try {
        const getEmployeeDocuments = await EmployeeDocument.find().populate('createdBy', 'username').sort({ updatedAt: -1 });
        res.json(getEmployeeDocuments);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getEmployeeDocument = async (req, res) => {
    const { id } = req.params;
    try {
        const getEmployeeDocument = await EmployeeDocument.findById(id);
        if (!getEmployeeDocument) return res.status(404).json({ message: "EmployeeDocument not found" });
        res.json(getEmployeeDocument);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
}

exports.createEmployeeDocument = async (req, res) => {
    const { name, employeeId } = req.body;

    try {
        if (!name) {
            return res.status(400).json({ message: "name field is required" });
        }
        // Save uploaded files info and collect their IDs
        let fileIds = [];
        console.log(req.file);

        if (req.files && req.files.length > 0) {
            for (const uploadedFile of req.files) {
                const { filename, size, mimetype, originalname } = uploadedFile;
                const folder = 'employee-document'; // folder where you save files

                const fileDoc = new File({
                    name: originalname,
                    filename,
                    size: (size / (1024 * 1024)).toFixed(2) + 'MB',
                    type: mimetype,
                    path: `uploads/${folder}/${filename}`,
                    createdBy: req.user?._id,
                });

                await fileDoc.save();
                fileIds.push(fileDoc._id);
            }
        }

        // Create EmployeeDocument with file references
        const createEmployeeDocument = new EmployeeDocument({
            name,
            employeeId,
            file_urls: fileIds,  // array of ObjectId references to File docs
            createdBy: req.user._id,
        });

        await createEmployeeDocument.save();

        await createEmployeeDocument.populate('createdBy', 'username');
        await createEmployeeDocument.populate('file_urls'); // populate file info if needed

        res.status(201).json({ message: 'success', data: createEmployeeDocument });

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateEmployeeDocument = async (req, res) => {
    const { id } = req.params;
    const { name, isActive } = req.body;
    try {
        let getEmployeeDocument = await EmployeeDocument.findById(id);
        if (!getEmployeeDocument) return res.status(404).json({ message: "EmployeeDocument not found" });

        if (!name) return res.status(400).json({ message: "name field is required" });

        let updateEmployeeDocument = await EmployeeDocument.findByIdAndUpdate(
            id,
            { name, isActive, updatedBy: req.user.id },
            { new: true }
        ).populate('createdAt', 'username').populate('updatedBy', 'username');

        res.status(200).json({ message: "success", data: updateEmployeeDocument });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteEmployeeDocument = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteEmployeeDocument = await EmployeeDocument.findByIdAndDelete(id);
        if (!deleteEmployeeDocument) return res.status(404).json({ message: "EmployeeDocument not found" });
        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}