const fs = require('fs');
const path = require('path');
const File = require('../models/upload');
const Organization = require("../models/Organization");

// Get all 
exports.getOrganizations = async (req, res) => {
    try {
        const getOrganizations = await Organization.find().populate('createdBy', 'username').sort({ createdAt: -1 });
        res.json(getOrganizations);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getActiveOrganization = async (req, res) => {
    try {
        const activeOrganization = await Organization.findOne({ isActive: true }).populate('createdBy', 'username');
        res.json(activeOrganization);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: error.message });
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
    const { fullname, name, email, phone, address, website_name, log, social_media, image_id, isActive } = req.body;

    if (!name || !fullname) {
        return res.status(400).json({ message: "Name field is required" });
    }
    try {
        let document = null;

        if (req.file) {
            const { filename, size, mimetype, originalname } = req.file;
            const folder = 'organization';
            document = {
                name: originalname,
                filename,
                size: (size / (1024 * 1024)).toFixed(2) + 'MB',
                type: mimetype,
                path: `uploads/${folder}/${filename}`,
                createdBy: req.user?._id,
            };
        }

        if (isActive) {
            await Organization.updateMany(
                { isActive: true },
                { $set: { isActive: false } }
            );
        }

        // Step 2: Create organization with file id as image_id
        const createOrganization = new Organization({
            name,
            fullname,
            email,
            phone,
            address,
            website_name,
            log,
            social_media,
            documents: document,
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
    const { fullname, name, email, phone, address, website_name, log, social_media, isActive, existingDocumentsJson } = req.body;
    console.log(req.body);
    try {
        let organization = await Organization.findById(id);
        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }

        if (!name || !fullname) {
            return res.status(400).json({ message: "Name field is required" });
        }

        let existingDocument = null;
        if (existingDocumentsJson) {
            try {
                existingDocument = JSON.parse(existingDocumentsJson);
            } catch (err) {
                console.warn('Error parsing existingDocumentsJson', err);
            }
        }

        // Handle file upload
        if (req.file) {
            const { filename, size, mimetype, originalname } = req.file;
            const folder = 'organization'; // keep consistent with createOrganization

            const newDocument = {
                name: originalname,
                filename,
                size: (size / (1024 * 1024)).toFixed(2) + 'MB',
                type: mimetype,
                path: `uploads/${folder}/${filename}`,
                createdBy: req.user?._id,
                extension: originalname.split('.').pop(),
            };

            // Delete old file if exists
            if (organization.documents && organization.documents.path) {
                const oldPath = path.join(__dirname, '..', organization.documents.path);
                fs.unlink(oldPath, (err) => {
                    if (err) console.error('Failed to delete old file:', oldPath, err);
                });
            }

            organization.documents = newDocument;

        } else if (existingDocument) {
            organization.documents = existingDocument;
        }

        if (isActive) {
            await Organization.updateMany(
                { _id: { $ne: id }, isActive: true },
                { $set: { isActive: false } }
            );
        }


        // Update other fields
        organization.fullname = fullname;
        organization.name = name;
        organization.email = email;
        organization.phone = phone;
        organization.address = address;
        organization.website_name = website_name;
        organization.log = log;
        organization.social_media = social_media;
        organization.isActive = isActive;

        await organization.save();
        await organization.populate('createdBy', 'username');

        res.status(200).json({ message: "success", data: organization });

    } catch (error) {
        console.error('Error updating organization:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteOrganization = async (req, res) => {
    const { id } = req.params;
    try {
        const organization = await Organization.findById(id);
        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }

        // Delete image file if exists
        if (organization.documents && organization.documents.path) {
            const filePath = path.join(__dirname, '..', organization.documents.path);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Failed to delete file:', filePath, err);
                    // You may choose to continue deleting organization even if file deletion fails
                }
            });
        }

        // Delete organization record
        await Organization.findByIdAndDelete(id);

        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};
