const path = require('path');
const fs = require('fs');
const Employee = require("../models/Employee");
const Education = require("../models/Education");
const EmployeeHistory = require("../models/EmployeeHistory");
const File = require('../models/upload');
const EmployeeLaborLaw = require('../models/LaborLaw');
const EmpDocument = require('../models/EmployeeDocument');
const EmpBook = require('../models/EmployeeBook');
const EmpBodyBook = require('../models/EmployeeBodyBook');
const EmpNssfDoc = require('../models/EmployeeNssfDocument');
const EmpNssf = require('../models/EmployeeNssf');
const EmpHealthBook = require('../models/EmployeeHealthBook');
const EmpPosition = require('../models/EmployeePosition');
const languages = require('../models/Languages');
const iconv = require('iconv-lite');
const Languages = require('../models/Languages');
const Department = require('../models/Department')
const Position = require('../models/Position')
const { model } = require('mongoose');

exports.getEmployeeDocuments = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const documents = await EmpDocument.find({ employeeId })
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 })
            .select('title name filename path type size createdAt');

        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.uploadDocuments = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const uploadedFiles = req.files;
        const { title } = req.body;

        if (!uploadedFiles || uploadedFiles.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const savedFiles = [];

        console.log(req.files);

        for (const file of uploadedFiles) {
            const fixedName = iconv.decode(Buffer.from(file.originalname, 'latin1'), 'utf8');
            const newFile = new EmpDocument({
                title: title,
                name: fixedName,
                filename: file.filename,
                type: file.mimetype,
                size: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
                path: `uploads/documents/${file.filename}`,
                employeeId,
                createdBy: req.user?._id,
            });

            await newFile.save();
            savedFiles.push(newFile);
        }

        res.status(200).json({
            message: 'Files uploaded successfully',
            files: savedFiles,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteDocument = async (req, res) => {
    const { id } = req.params;

    try {
        const document = await EmpDocument.findById(id);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Delete the file from the filesystem
        const filePath = path.join(__dirname, '..', document.path);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.warn('File not found or already deleted:', document.path);
            }
        });

        // Delete from DB
        await EmpDocument.findByIdAndDelete(id);

        res.json({ message: "Document deleted successfully" });
    } catch (error) {
        console.error('Error deleting:', error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Position

exports.getEmployeePositions = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const empPosition = await EmpPosition.find({ employeeId })
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });

        res.json(empPosition);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.createEmployeePosition = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { name, positionId, joinDate } = req.body;


        let document = null;

        if (req.file) {
            const { filename, size, mimetype, originalname } = req.file;
            const folder = 'positions';
            document = {
                name: originalname,
                filename,
                size: (size / (1024 * 1024)).toFixed(2) + 'MB',
                type: mimetype,
                path: `uploads/${folder}/${filename}`,
                createdBy: req.user?._id,
            };
        }

        const newPosition = new EmpPosition({
            name,
            positionId,
            employeeId,
            joinDate: new Date(joinDate),
            documents: document,
            createdBy: req.user?._id
        });

        await newPosition.save();

        res.status(201).json({
            message: 'Employee position created successfully',
            data: newPosition
        });
    } catch (error) {
        console.error('Create error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.updateEmployeePosition = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, positionId, joinDate, existingDocumentsJson } = req.body;

        const existing = await EmpPosition.findById(id);
        if (!existing) return res.status(404).json({ message: 'Position not found' });

        let existingDocument = null;
        if (existingDocumentsJson) {
            try {
                existingDocument = JSON.parse(existingDocumentsJson);
            } catch (err) {
                console.warn('Error parsing existingDocumentsJson', err);
            }
        }

        let newDocument = null;

        if (req.file) {
            // New file uploaded
            const { filename, size, mimetype, originalname } = req.file;
            const folder = 'positions';

            newDocument = {
                name: originalname,
                filename,
                size: (size / (1024 * 1024)).toFixed(2) + 'MB',
                type: mimetype,
                path: `uploads/${folder}/${filename}`,
                createdBy: req.user?._id,
                extension: originalname.split('.').pop(),
            };

            // Delete old file if exists
            if (existing.documents && existing.documents.path) {
                const oldPath = path.join(__dirname, '..', existing.documents.path);
                fs.unlink(oldPath, (err) => {
                    if (err) console.error('Failed to delete old file:', oldPath, err);
                    else console.log('Deleted old file:', oldPath);
                });
            }

            existing.documents = newDocument;

        } else if (existingDocument) {
            // Keep old document data if provided
            existing.documents = existingDocument;

        } else {
            // No new file and no document info sent - keep existing or null
            existing.documents = existing.documents || null;
        }


        existing.name = name;
        existing.positionId = positionId;
        existing.joinDate = new Date(joinDate);

        await existing.save();

        return res.status(200).json({
            message: 'Employee position updated successfully',
            data: existing,
        });
    } catch (error) {
        console.error('Update error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.deleteEmployeePosition = async (req, res) => {
    const { id } = req.params;

    try {
        const document = await EmpPosition.findById(id);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Delete the file from the filesystem
        const filePath = path.join(__dirname, '..', document.path);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.warn('File not found or already deleted:', document.path);
            }
        });

        // Delete from DB
        await EmpPosition.findByIdAndDelete(id);

        res.json({ message: "Document deleted successfully" });
    } catch (error) {
        console.error('Error deleting:', error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
// end position
// NSSF
exports.getEmployeeNssfDoc = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const documents = await EmpNssfDoc.find({ employeeId })
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 })
            .select('title name filename path type size createdAt');

        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getEmployeeNssf = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const documents = await EmpNssf.find({ employeeId })
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });

        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.uploadNssf = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const uploadedFiles = req.files?.documents || [];
        const { title, claimTitle, claimDate, claimType, claimOther } = req.body;
        // ✅ Always save NSSF record first
        console.log(uploadedFiles);

        const nssfRecord = new EmpNssf({
            employeeId,
            claimTitle,
            claimDate,
            claimType,
            claimOther,
            createdBy: req.user?._id,
        });

        if (claimDate || claimTitle || claimDate || claimOther) {
            await nssfRecord.save();
        }
        const savedFiles = [];

        // ✅ If files are present, save them

        if (uploadedFiles.length > 0) {
            for (const file of uploadedFiles) {
                const fixedName = iconv.decode(Buffer.from(file.originalname, 'latin1'), 'utf8');
                const newFile = new EmpNssfDoc({
                    title,
                    name: fixedName,
                    filename: file.filename,
                    type: file.mimetype,
                    size: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
                    path: `uploads/documents/${file.filename}`,
                    employeeId,                  // ✅ links to Employee
                    createdBy: req.user?._id,
                });
                await newFile.save();
                savedFiles.push(newFile);
            }
        }



        res.status(200).json({
            message: 'Claim created successfully',
            nssf: nssfRecord,
            files: savedFiles,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateNssf = async (req, res) => {
    try {
        const data = req.body[0]; // Access the first item in the array
        const { title, claimTitle, claimDate, claimType, claimOther, _id } = data;


        if (!_id) {
            return res.status(400).json({ message: 'Missing NSSF record ID' });
        }

        const updatedNssf = await EmpNssf.findByIdAndUpdate(
            _id,
            {
                title,
                claimTitle,
                claimDate,
                claimType,
                claimOther,
                updatedBy: req.user?._id,
            },
            { new: true } // Return the updated document
        );

        if (!updatedNssf) {
            return res.status(404).json({ message: 'NSSF record not found' });
        }
        console.log('_id:', updatedNssf);

        res.status(200).json({
            message: 'Claim updated successfully',
            data: updatedNssf,
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



exports.deleteNssfDoc = async (req, res) => {
    const { id } = req.params;

    try {
        const document = await EmpNssfDoc.findById(id);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Delete the file from the filesystem
        const filePath = path.join(__dirname, '..', document.path);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.warn('File not found or already deleted:', document.path);
            }
        });

        // Delete from DB
        await EmpNssfDoc.findByIdAndDelete(id);

        res.json({ message: "Document deleted successfully" });
    } catch (error) {
        console.error('Error deleting:', error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteNssf = async (req, res) => {
    const { id } = req.params;

    try {
        const document = await EmpNssf.findById(id);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        // Delete from DB
        await EmpNssf.findByIdAndDelete(id);

        res.json({ message: "Document deleted successfully" });
    } catch (error) {
        console.error('Error deleting:', error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Labor Law

exports.getEmployeeLaborLaw = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const documents = await EmployeeLaborLaw.find({ employeeId })
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getEmployeeLaborLawView = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const documents = await EmployeeLaborLaw.find({ employeeId })
            .populate('position', 'title_en title_kh')
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.uploadLaborLaw = async (req, res) => {
    try {
        const uploadedFiles = req.files;
        const {
            employeeId,
            title,
            position,
            employeeType,
            duration,
        } = req.body;

        if (!uploadedFiles || uploadedFiles.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        // Prepare uploaded files
        const fileData = uploadedFiles.map(file => {
            const decodedName = iconv.decode(Buffer.from(file.originalname, 'latin1'), 'utf8');
            return {
                name: decodedName,
                filename: file.filename,
                type: file.mimetype,
                size: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
                path: `uploads/documents/${file.filename}`,
                extension: file.originalname.split('.').pop(),
            };
        });

        // Find existing record
        let laborLaw = await EmployeeLaborLaw.findOne({ employeeId });

        if (laborLaw) {
            // Update metadata fields
            laborLaw.title = title;
            laborLaw.position = position;
            laborLaw.employee_type = employeeType;
            laborLaw.duration = duration;

            // Append new files to existing array
            laborLaw.file = [...(laborLaw.file || []), ...fileData];

            laborLaw.updatedBy = req.user?._id;
            await laborLaw.save();

            return res.status(200).json({ message: 'Updated successfully', data: laborLaw });
        }

        // Create new record if none found
        laborLaw = new EmployeeLaborLaw({
            employeeId,
            title,
            position,
            employee_type: employeeType,
            duration,
            createdBy: req.user?._id,
            file: fileData,
        });

        await laborLaw.save();
        res.status(200).json({ message: 'Created successfully', data: laborLaw });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



exports.deleteLaborLaw = async (req, res) => {
    const { id } = req.params;  // file id inside the array

    try {
        const laborLawDoc = await EmployeeLaborLaw.findOne({ "file._id": id });
        if (!laborLawDoc) {
            return res.status(404).json({ message: "File not found" });
        }

        // Find the file object for path to delete physical file
        const fileObj = laborLawDoc.file.find(f => f._id.toString() === id);
        if (!fileObj) {
            return res.status(404).json({ message: "File not found in document" });
        }

        // Delete physical file
        const filePath = path.join(__dirname, '..', fileObj.path);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.warn('File not found or already deleted:', fileObj.path);
            }
        });

        // Remove file from array using pull()
        laborLawDoc.file.pull({ _id: id });

        // Save updated document
        await laborLawDoc.save();

        res.json({ message: "File deleted successfully" });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// book
exports.getEmployeeBooks = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const books = await EmpBook.find({ employeeId })
            .populate('employeeId', 'name_kh')
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getEmployeeHealthBooks = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const books = await EmpHealthBook.find({ employeeId })
            .populate('employeeId', 'name_kh')
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getEmployeeBodyBooks = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const books = await EmpBodyBook.find({ employeeId })
            .populate('employeeId', 'name_kh')
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.uploadBooks = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { healthTitle, healthDate, bodyTitle, bodyDate, bookTitle, bookDate, bookEndDate, post } = req.body;
        console.log(req.body);

        const uploadedFiles = req.files;
        const isPosted = post === 'true';
        const savedFiles = [];

        await Employee.findByIdAndUpdate(employeeId, { post: isPosted });

        // Helper to process each section
        const processFiles = async (files, Model, title, date, endDate) => {
            if (!files) return;

            for (const file of files) {
                const fixedName = iconv.decode(Buffer.from(file.originalname, 'latin1'), 'utf8');

                const newFile = new Model({
                    title,
                    name: fixedName,
                    filename: file.filename,
                    type: file.mimetype,
                    size: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
                    path: `uploads/documents/${file.filename}`,
                    extension: file.originalname.split('.').pop(),
                    start_date: date ? new Date(date) : null,
                    // end_date: bookEndDate ? new Date(bookEndDate) : null,
                    end_date: endDate ? new Date(endDate) : null,
                    employeeId,
                    createdBy: req.user?._id,
                });

                await newFile.save();
                savedFiles.push(newFile);
            }
        };

        await processFiles(uploadedFiles.healthFiles, EmpHealthBook, healthTitle, healthDate);
        await processFiles(uploadedFiles.bodyFiles, EmpBodyBook, bodyTitle, bodyDate);
        await processFiles(uploadedFiles.bookFiles, EmpBook, bookTitle, bookDate, bookEndDate);

        // ✅ Return success even if no files, but post is updated;

        return res.status(200).json({
            message: savedFiles.length > 0
                ? 'Files uploaded and employee updated successfully'
                : 'Employee updated successfully (no files uploaded)',
            files: savedFiles,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// exports.uploadBooks = async (req, res) => {
//     try {
//         const { employeeId } = req.params;
//         const uploadedFiles = req.files;
//         const { title } = req.body;

//         if (!uploadedFiles || uploadedFiles.length === 0) {
//             return res.status(400).json({ message: 'No files uploaded' });
//         }
//         const savedFiles = [];

//         console.log(req.files);

//         for (const file of uploadedFiles) {
//             const fixedName = iconv.decode(Buffer.from(file.originalname, 'latin1'), 'utf8');
//             const newFile = new EmpBook({
//                 title: title,
//                 name: fixedName,
//                 filename: file.filename,
//                 type: file.mimetype,
//                 size: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
//                 path: `uploads/documents/${file.filename}`,
//                 employeeId,
//                 createdBy: req.user?._id,
//             });

//             await newFile.save();
//             savedFiles.push(newFile);
//         }

//         res.status(200).json({
//             message: 'Files uploaded successfully',
//             files: savedFiles,
//         });
//     } catch (error) {
//         console.error('Upload error:', error);
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };

exports.deleteBook = async (req, res) => {
    const { id } = req.params;

    try {
        const document = await EmpBook.findById(id);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Delete the file from the filesystem
        const filePath = path.join(__dirname, '..', document.path);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.warn('File not found or already deleted:', document.path);
            }
        });

        // Delete from DB
        await EmpBook.findByIdAndDelete(id);

        res.json({ message: "Document deleted successfully" });
    } catch (error) {
        console.error('Error deleting:', error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.deleteHealthBook = async (req, res) => {
    const { id } = req.params;

    try {
        const document = await EmpHealthBook.findById(id);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Delete the file from the filesystem
        const filePath = path.join(__dirname, '..', document.path);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.warn('File not found or already deleted:', document.path);
            }
        });

        // Delete from DB
        await EmpHealthBook.findByIdAndDelete(id);

        res.json({ message: "Document deleted successfully" });
    } catch (error) {
        console.error('Error deleting:', error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.deleteBodyBook = async (req, res) => {
    const { id } = req.params;

    try {
        const document = await EmpBodyBook.findById(id);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Delete the file from the filesystem
        const filePath = path.join(__dirname, '..', document.path);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.warn('File not found or already deleted:', document.path);
            }
        });

        // Delete from DB
        await EmpBodyBook.findByIdAndDelete(id);

        res.json({ message: "Document deleted successfully" });
    } catch (error) {
        console.error('Error deleting:', error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all 
exports.getEmployees = async (req, res) => {
    try {
        const getEmployees = await Employee.find()
            .populate('image_url')
            .populate('createdBy', 'username')
            .populate({
                path: 'subBonus',
                model: 'SubBonus',
                populate: {
                    path: 'bonusId',
                    model: 'Bonus',
                    select: 'payDate'
                }
            })
            .populate({
                path: 'positionId',
                model: 'Position',
                populate: {
                    path: 'department',
                    model: 'Department',
                    select: 'title_en title_kh'
                }
            })
            .sort({ updatedAt: -1 });
        res.json(getEmployees);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({ isActive: true }) // optional filter
            .select('name_en first_name_en last_name_en positionId') // fetch only needed fields
            .populate({
                path: 'positionId',
                select: 'title_en'
            });

        // Map for cleaner dropdown
        const simplified = employees.map(emp => ({
            _id: emp._id,
            name_en: emp.name_en,
            first_name_en: emp.first_name_en,
            last_name_en: emp.last_name_en,
            position: emp.positionId?.title_en || ''
        }));

        res.json(simplified);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};
exports.getAllEmployeesNotManager = async (req, res) => {
    try {
        const allManagers = await Department.distinct('manager');

        const employees = await Employee.find({
            _id: { $nin: allManagers }
        })
            .populate('image_url')
            .populate('createdBy', 'username')
            .populate({
                path: 'subBonus',
                model: 'SubBonus',
                populate: {
                    path: 'bonusId',
                    model: 'Bonus',
                    select: 'payDate'
                }
            })
            .populate({
                path: 'positionId',
                model: 'Position',
                populate: {
                    path: 'department',
                    model: 'Department',
                    select: 'title_en title_kh manager'
                }
            })
            .sort({ updatedAt: -1 });

        res.json(employees);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

exports.getEmployeesForManager = async (req, res) => {
    try {
        const managerEmployeeId = req.user.employeeId; // logged-in manager's employee ID

        // 1️⃣ Find departments managed by this manager
        const managedDepartments = await Department.find(
            { manager: managerEmployeeId },
            '_id'
        );

        const deptIds = managedDepartments.map(d => d._id.toString());
        console.log('Departments managed by manager:', deptIds);

        if (!deptIds.length) return res.json([]);

        // 2️⃣ Find all employees except the manager
        const employees = await Employee.find({ _id: { $ne: managerEmployeeId } })
            .populate('image_url')
            .populate('createdBy', 'username')
            .populate({
                path: 'subBonus',
                populate: { path: 'bonusId', select: 'payDate' }
            })
            .populate({
                path: 'positionId',
                populate: {
                    path: 'department',
                    select: '_id title_en title_kh manager'
                }
            })
            .sort({ updatedAt: -1 });

        // 3️⃣ Filter employees whose any department is managed by this manager
        const filteredEmployees = employees.filter(emp => {
            const depts = emp.positionId?.department;
            if (!depts) return false; // no department
            // ensure depts is always array
            const deptArray = Array.isArray(depts) ? depts : [depts];
            return deptArray.some(d => deptIds.includes(d._id.toString()));
        });

        console.log('Employees:', filteredEmployees);
        res.json(filteredEmployees);

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};





exports.getEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        const getEmployee = await Employee.findById(id).populate('image_url')
            .populate({
                path: 'subBonus',
                model: 'SubBonus',
                populate: {
                    path: 'bonusId',
                    model: 'Bonus',
                    select: 'payDate'
                }
            })
            .populate('present_city', 'name')
            .populate('city', 'name')
            .populate('createdBy', 'username').populate({
                path: 'positionId',
                model: 'Position',
                populate: {
                    path: 'department',
                    model: 'Department',
                    populate: {
                        path: 'manager',
                        model: 'Employee',
                        populate: {
                            path: 'image_url',
                            model: 'File',
                            select: 'path'
                        },
                        select: 'image_url name_en name_kh'
                    },
                    select: 'title_en title_kh manager'
                }
            });

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
            positionId,
            gender,
            phone,
            bloodType,
            email,
            id_card_no,
            passport_no,
            joinDate,
            date_of_birth,
            place_of_birth,
            nationality,
            maritalStatus,
            city,
            district,
            commune,
            village,
            present_city,
            present_district,
            present_commune,
            present_village,
            isActive,
            family_members,
            emergency_contact,
            status,
        } = req.body;

        // Validate required fields
        if (!employee_id) {
            return res.status(400).json({ message: 'First name, last name, and date of birth are required.' });
        }

        let imageUrl = null;

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
        const parsedFamilyMembers = family_members ? JSON.parse(family_members) : [];
        const parsedEmergencyContacts = emergency_contact ? JSON.parse(emergency_contact) : [];
        const nameKh = last_name_kh + " " + first_name_kh;
        const nameEn = first_name_en + " " + last_name_en;
        // Create employee
        const createEmployee = new Employee({
            employee_id,
            first_name_en,
            last_name_en,
            first_name_kh,
            last_name_kh,
            name_en: nameEn,
            name_kh: nameKh,
            gender,
            positionId,
            phone,
            bloodType,
            email,
            id_card_no,
            passport_no,
            joinDate,
            date_of_birth,
            place_of_birth,
            nationality,
            maritalStatus,
            city,
            district,
            commune,
            village,
            present_city,
            present_district,
            present_commune,
            present_village,
            isActive: isActive ?? true,
            image_url: imageUrl,
            family_member: parsedFamilyMembers,
            emergency_contact: parsedEmergencyContacts,
            createdBy: req.user?._id,
            status,
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
            phone,
            positionId,
            bloodType,
            email,
            date_of_birth,
            place_of_birth,
            joinDate,
            nationality,
            maritalStatus,
            city,
            district,
            commune,
            village,
            present_city,
            present_district,
            present_commune,
            present_village,
            isActive,
            // present_address,
            // permanent_address,
            family_members,
            emergency_contact,
            staff_relationships,
            language,
            employment_history,
            general_education,
            short_course,
            id_card_no,
            passport_no,
            file,
            status,
            // file is handled via req.file (multipart)
        } = req.body;


        if (!employee_id || !first_name_en || !first_name_kh || !last_name_en || !last_name_kh) {
            return res.status(400).json({ message: 'First name, last name, and date of birth are required.' });
        }
        // Parse JSON fields
        const parsedFamilyMembers = family_members ? JSON.parse(family_members) : [];
        const parsedEmergencyContacts = emergency_contact ? JSON.parse(emergency_contact) : [];
        const parsedStaffRelationships = staff_relationships ? JSON.parse(staff_relationships) : [];
        const parsedLanguages = language ? JSON.parse(language) : [];
        const parsedEmploymentHistory = employment_history ? JSON.parse(employment_history) : [];
        const parsedGeneralEducation = general_education ? JSON.parse(general_education) : [];
        const parsedShortCourses = short_course ? JSON.parse(short_course) : [];

        const nameKh = last_name_kh + " " + first_name_kh;
        const nameEn = first_name_en + " " + last_name_en;

        // Update the fields
        employee.employee_id = employee_id;
        employee.name_en = nameEn;
        employee.name_kh = nameKh;
        employee.first_name_en = first_name_en;
        employee.last_name_en = last_name_en;
        employee.first_name_kh = first_name_kh;
        employee.last_name_kh = last_name_kh;
        employee.gender = gender;
        employee.phone = phone;
        employee.positionId = positionId;
        employee.bloodType = bloodType;
        employee.email = email;
        employee.id_card_no = id_card_no;
        employee.passport_no = passport_no;
        employee.joinDate = joinDate;
        employee.date_of_birth = date_of_birth;
        employee.place_of_birth = place_of_birth;
        employee.nationality = nationality;
        employee.maritalStatus = maritalStatus;
        employee.city = city;
        employee.district = district;
        employee.commune = commune;
        employee.village = village;
        employee.present_city = present_city;
        employee.present_district = present_district;
        employee.present_commune = present_commune;
        employee.present_village = present_village;
        employee.isActive = isActive ?? true;
        employee.family_member = parsedFamilyMembers;
        employee.emergency_contact = parsedEmergencyContacts;
        employee.staff_relationships = parsedStaffRelationships;
        employee.language = parsedLanguages;
        employee.employment_history = parsedEmploymentHistory;
        employee.general_education = parsedGeneralEducation;
        employee.short_course = parsedShortCourses;
        employee.status = status;

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

exports.assignPosition = async (req, res) => {
    const { id } = req.params;
    const { positionId } = req.body;
    try {
        let getEmployee = await Employee.findById(id);
        if (!getEmployee) return res.status(404).json({ message: "Employee not found" });

        if (!positionId) {
            return res.status(400).json({ message: "positionId is required" });
        }

        const updateEmployee = await Employee.findByIdAndUpdate(
            id,
            { positionId, updatedBy: req.user.id },
            { new: true }
        ).populate('image_url').populate('createdBy', 'username')
            .populate({
                path: 'positionId',
                model: 'Position',
                populate: {
                    path: 'department',
                    model: 'Department',
                    select: 'title_en title_kh'
                }
            });

        res.status(200).json({ message: "success", data: updateEmployee });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

// General Education

// Get all 
exports.getEducations = async (req, res) => {
    try {
        const getEducations = await Education.find()
            .populate('createdBy', 'username').sort({ updatedAt: -1 });
        res.json(getEducations);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getEducation = async (req, res) => {
    const { id } = req.params;
    try {
        const getEducation = await Education.findOne({ employeeId: id })
            .populate('createdBy', 'username');
        if (!getEducation) return res.status(404).json({ message: "Education not found" });
        res.json(getEducation);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
}


exports.createOrUpdateEducation = async (req, res) => {
    try {
        const { id } = req.params;
        const { general_education, vocational_training, short_course, language } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Employee ID is required.' });
        }

        // Parse JSON fields from FormData
        const parsedLanguages = language ? JSON.parse(language) : [];
        const parsedGeneralEducation = general_education ? JSON.parse(general_education) : [];
        const parsedVocationalTraining = vocational_training ? JSON.parse(vocational_training) : [];
        const parsedShortCourses = short_course ? JSON.parse(short_course) : [];

        // Check if education already exists for this employee
        let education = await Education.findOne({ employeeId: id });

        if (education) {
            // Update existing
            education.language = parsedLanguages;
            education.general_education = parsedGeneralEducation;
            education.vocational_training = parsedVocationalTraining;
            education.short_course = parsedShortCourses;
            education.updatedBy = req.user?._id;
            await education.save();
        } else {
            // Create new
            education = new Education({
                employeeId: id,
                language: parsedLanguages,
                general_education: parsedGeneralEducation,
                short_course: parsedShortCourses,
                createdBy: req.user?._id,
            });
            await education.save();
        }

        const populatedEducation = await Education.findById(education._id)
            .populate('createdBy', 'username');

        res.status(200).json({
            message: education ? 'Education updated successfully' : 'Education created successfully',
            data: populatedEducation,
        });
    } catch (error) {
        console.error('Error creating/updating education:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// General History

// Get all 
exports.getEmployeeHistories = async (req, res) => {
    try {
        const getEmployeeHistories = await EmployeeHistory.find()
            .populate('createdBy', 'username').sort({ updatedAt: -1 });
        res.json(getEmployeeHistories);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getEmployeeHistory = async (req, res) => {
    const { id } = req.params;
    try {
        const getEmployeeHistory = await EmployeeHistory.findOne({ employeeId: id })
            .populate('createdBy', 'username');
        if (!getEmployeeHistory) return res.status(404).json({ message: "Education not found" });
        res.json(getEmployeeHistory);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
}


exports.createOrUpdateEmployeeHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { employment_history } = req.body;
        if (!id) {
            return res.status(400).json({ message: 'ID is required.' });
        }

        // Parse employment history from FormData (if sent as a JSON string)

        const parsedEmploymentHistory = employment_history ? JSON.parse(employment_history) : [];

        // Check if an EmployeeHistory document already exists
        const existing = await EmployeeHistory.findOne({ employeeId: id });

        let savedHistory;

        if (existing) {
            existing.employment_history = parsedEmploymentHistory;
            existing.updatedBy = req.user?._id;
            savedHistory = await existing.save();
        } else {
            // Create new
            const newHistory = new EmployeeHistory({
                employeeId: id,
                employment_history: parsedEmploymentHistory,
                createdBy: req.user?._id
            });
            savedHistory = await newHistory.save();
        }

        const populatedHistory = await EmployeeHistory.findById(savedHistory._id)
            .populate('createdBy', 'username');

        res.status(200).json({
            message: existing ? 'Employment history updated successfully' : 'Employment history created successfully',
            data: populatedHistory,
        });

    } catch (error) {
        console.error('Error saving employment history:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.getLanguages = async (req, res) => {
    try {
        const getLanguages = await Languages.find().sort({ updatedAt: -1 });
        res.json(getLanguages);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

exports.getLanguage = async (req, res) => {
    const { id } = req.params;
    try {
        const getLanguage = await Languages.findById(id);

        if (!getLanguage) return res.status(404).json({ message: "Category not found" });
        res.json(getLanguage);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
}

exports.createLanguage = async (req, res) => {
    const { name_en, name_kh } = req.body;
    try {
        if (!name_en || !name_kh) {
            return res.status(400).json({ message: "name field is required" });
        }
        const createLanguage = new Languages({ name_en, name_kh, createdBy: req.user.id });
        await createLanguage.save();

        res.status(201).json({ message: 'success', data: createLanguage });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.updateLanguage = async (req, res) => {
    const { id } = req.params;
    const { name_en, name_kh } = req.body;
    try {
        let getLanguage = await Languages.findById(id);
        if (!getLanguage) return res.status(404).json({ message: "Job type not found" });

        if (!name_en || !name_kh) {
            return res.status(400).json({ message: "Both name_en and name_kh are required." });
        }

        let updateLanguage = await Languages.findByIdAndUpdate(
            id,
            { name_en, name_kh, updatedBy: req.user.id },
            { new: true }
        );

        res.status(200).json({ message: "success", data: updateLanguage });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

// manager
exports.getEmployeesByManager = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find departments where user is one of the managers
        const managedDepartments = await Department.find({ manager: userId }).select('_id');
        const departmentIds = managedDepartments.map(dep => dep._id);

        if (departmentIds.length === 0) {
            // User manages no departments => empty list
            return res.status(200).json({ employees: [] });
        }

        // Find positions within those departments
        const positions = await Position.find({ department: { $in: departmentIds } }).select('_id');

        const positionIds = positions.map(pos => pos._id);

        if (positionIds.length === 0) {
            return res.status(200).json({ employees: [] });
        }

        // Find employees assigned to those positions
        // const employees = await Employee.find({ positionId: { $in: positionIds } })
        //     .populate({
        //         path: 'positionId',
        //         populate: { path: 'department' }
        //     });

        const employees = await Employee.find({ positionId: { $in: positionIds } })
            .populate('image_url')
            .populate('createdBy', 'username')
            .populate({
                path: 'subBonus',
                model: 'SubBonus',
                populate: {
                    path: 'bonusId',
                    model: 'Bonus',
                    select: 'payDate'
                }
            })
            .populate({
                path: 'positionId',
                model: 'Position',
                populate: {
                    path: 'department',
                    model: 'Department',
                    select: 'title_en title_kh'
                }
            })
            .sort({ updatedAt: -1 });

        return res.status(200).json({ employees });
    } catch (error) {
        console.error('Error fetching managed employees:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
