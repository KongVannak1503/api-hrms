const fs = require('fs');
const path = require('path');
const File = require('../models/upload');
const Organization = require("../models/Organization");

// Get all 
exports.getOrganizations = async (req, res) => {
    try {
        const getOrganizations = await Organization.find().populate('createdBy', 'username');
        res.json(getOrganizations);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getOrganization = async (req, res) => {
    const { id } = req.params;
    try {
        const getOrganization = await Organization.findById(id);
        if (!getOrganization) return res.status(404).json({ message: "Organization not found" });
        res.json(getOrganization);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
}

exports.createOrganization = async (req, res) => {
    const { name, email, phone, address, website_name, log, social_media, image_id, isActive } = req.body;
    const { filename, size, mimetype } = req.file || {};
    if (!name) {
        return res.status(400).json({ message: "Name field is required" });
    }
    try {
        // Step 1: Save the file first
        if (req.file) {
            const file = new File({
                filename,
                size: (size / (1024 * 1024)).toFixed(2) + 'MB',
                type: mimetype,
                path: `\\uploads\\${filename}`,
                createdBy: req.user._id,
            });

            savedFile = await file.save();
        }

        // Step 2: Create organization with file id as image_id
        const createOrganization = new Organization({
            name,
            email,
            phone,
            address,
            website_name,
            log,
            social_media,
            image_id: savedFile?._id || null,
            isActive,
            createdBy: req.user._id,
        });

        await createOrganization.save();
        await createOrganization.populate('createdBy', 'username');

        res.status(201).json({ message: 'success', data: createOrganization });

    } catch (error) {
        console.error('Error:', error.message);
        // Step 3: Rollback — delete file from DB (and optionally disk)
        if (savedFile) {
            await File.findByIdAndDelete(savedFile._id);
            // Optional: delete physical file
            const filePath = path.join(__dirname, '..', 'uploads', filename);
            fs.unlink(filePath, (err) => {
                if (err) console.error('Failed to delete file from disk:', err.message);
            });
        }
        res.status(500).json({ message: 'Server error' });
    }
}

exports.updateOrganization = async (req, res) => {
    const { id } = req.params;
    const { title, description, isActive } = req.body;
    try {
        let getOrganization = await Organization.findById(id);
        if (!getOrganization) return res.status(404).json({ message: "Organization not found" });

        if (!title) return res.status(400).json({ message: "Title field is required" });

        let updateOrganization = await Category.findByIdAndUpdate(
            id,
            { title, description, isActive, updatedBy: req.user.id },
            { new: true }
        ).populate('createdAt', 'username').populate('updatedBy', 'username');

        res.status(200).json({ message: "success", data: updateOrganization });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteOrganization = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteOrganization = await Category.findByIdAndDelete(id);
        if (!deleteOrganization) return res.status(404).json({ message: "Organization not found" });
        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}