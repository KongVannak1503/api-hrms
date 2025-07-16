const Department = require("../models/Department");
const Position = require("../models/Position");

// Get all 
exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.find().populate({
            path: 'manager',
            populate: {
                path: 'image_url',
                model: 'File',
            },
            select: 'name name_kh image_url',
        })
            .populate({
                path: 'employee',
                populate: {
                    path: 'image_url',
                    model: 'File',
                },
                select: 'name name_kh image_url',
            })
            .populate('createdBy', 'username').sort({ updatedAt: -1 });

        // Aggregate position counts per department
        const positionCounts = await Position.aggregate([
            {
                $group: {
                    _id: "$department",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Merge position count into each department
        const departmentWithCounts = departments.map(dept => {
            const matched = positionCounts.find(p => p._id?.toString() === dept._id.toString());
            return {
                ...dept.toObject(),
                positionCount: matched ? matched.count : 0
            };
        });

        res.json(departmentWithCounts);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

exports.getDepartment = async (req, res) => {
    const { id } = req.params;
    try {
        const department = await Department.findById(id);
        if (!department) return res.status(404).json({ message: "Department not found" });

        const positionCount = await Position.countDocuments({ department: department._id });

        res.json({ ...department.toObject(), positionCount });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: error.message });
    }
}

exports.createDepartment = async (req, res) => {
    const { title_en, title_kh, description, isActive } = req.body;
    try {
        if (!title_en || !title_kh) {
            return res.status(400).json({ message: "Title field is required" });
        }

        const createDepartment = new Department({ title_en, title_kh, description, isActive, createdBy: req.user.id });
        await createDepartment.save();
        await createDepartment.populate('createdBy', 'username');
        res.status(201).json({ message: 'success', data: createDepartment });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.updateDepartment = async (req, res) => {
    const { id } = req.params;
    const { title_en, title_kh, description, isActive } = req.body;
    try {
        let getDepartment = await Department.findById(id);
        if (!getDepartment) return res.status(404).json({ message: "Department not found" });

        if (!title_en || !title_kh)
            return res.status(400).json({ message: "Title field is required" });

        let updateDepartment = await Department.findByIdAndUpdate(
            id,
            { title_en, title_kh, description, isActive, updatedBy: req.user.id },
            { new: true }
        ).populate('createdAt', 'username').populate('updatedBy', 'username');

        res.status(200).json({ message: "success", data: updateDepartment });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}


exports.deleteDepartment = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteDepartment = await Department.findByIdAndDelete(id);
        if (!deleteDepartment) return res.status(404).json({ message: "Department not found" });
        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}
const mongoose = require('mongoose');
exports.assignManager = async (req, res) => {
    const { id } = req.params;
    const { manager = [], employee = [] } = req.body;

    try {
        const department = await Department.findById(id);
        if (!department) {
            return res.status(404).json({ message: "Department not found" });
        }

        // Helper: Validate and convert strings to ObjectId
        const toObjectIds = (arr) =>
            arr
                .filter(Boolean)
                .map(val => {
                    if (!mongoose.Types.ObjectId.isValid(val)) {
                        throw new Error(`Invalid ObjectId: ${val}`);
                    }
                    return new mongoose.Types.ObjectId(val);
                });

        const managerIds = toObjectIds(manager);
        const employeeIds = toObjectIds(employee);

        // Replace existing arrays with new ones
        department.manager = managerIds;
        department.employee = employeeIds;
        department.updatedBy = req.user.id;

        await department.save();

        // Populate related fields
        const updatedDepartment = await Department.findById(id)
            .populate({
                path: 'manager',
                populate: {
                    path: 'image_url',
                    model: 'File',
                },
                select: 'name name_kh image_url',
            })
            .populate({
                path: 'employee',
                populate: {
                    path: 'image_url',
                    model: 'File',
                },
                select: 'name name_kh image_url',
            })
            .populate('createdBy', 'username');

        res.status(200).json({ message: "Success", data: updatedDepartment });

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};