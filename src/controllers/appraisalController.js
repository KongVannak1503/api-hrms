const AppraisalDay = require("../models/AppriasalDay");
const moment = require('moment');
// Get all 
exports.getAppraisalDays = async (req, res) => {
    try {
        const getAppraisalDays = await AppraisalDay.find()
            .populate('department', 'title_en title_kh')
            .populate('kpiTemplate', 'name')
            .populate('createdBy', 'username')
            .sort({ updatedAt: -1 });
        res.json(getAppraisalDays);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getAppraisalDaysByDepartment = async (req, res) => {
    try {
        const { department } = req.params;

        let filter = {};

        if (department && department !== 'all') {
            const departmentIds = department.split(',');
            filter = {
                $or: [
                    { department: { $in: departmentIds } },
                    { department: null }
                ]
            };
        }

        const getAppraisalDays = await AppraisalDay.find(filter)
            .populate('department', 'title_en title_kh')
            .populate('kpiTemplate', 'name')
            .populate('createdBy', 'username')
            .sort({ updatedAt: -1 });

        // Add status: active/inactive
        const today = moment().startOf('day');
        const resultWithStatus = getAppraisalDays.map(item => {
            const isToday = moment(item.startDate).isSame(today, 'day');
            return {
                ...item.toObject(),
                isActive: isToday ? true : false
            };
        });

        res.json(resultWithStatus);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getAppraisalDay = async (req, res) => {
    const { id } = req.params;

    try {
        const getAppraisalDay = await AppraisalDay.findById(id);
        if (!getAppraisalDay) return res.status(404).json({ message: "Appraisal Day not found" });
        res.json(getAppraisalDay);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
}

exports.createAppraisalDay = async (req, res) => {
    let { startDate, department, kpiTemplate } = req.body;
    console.log(req.body);

    try {
        if (department == 'all') {
            department = null;
        }
        if (!startDate || !kpiTemplate) {
            return res.status(400).json({ message: "name field is required" });
        }

        const createAppraisalDay = new AppraisalDay({ startDate, department, kpiTemplate, createdBy: req.user.id });
        await createAppraisalDay.save();
        let getAppraisalDay = await AppraisalDay.findById(createAppraisalDay._id);
        const populated = await AppraisalDay.findById(createAppraisalDay._id)
            .populate('kpiTemplate', 'name')
            .populate('createdBy', 'username')
            .populate('department', 'title_en title_kh');

        res.status(201).json({ message: 'success', data: populated });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.updateAppraisalDay = async (req, res) => {
    const { id } = req.params;
    let { startDate, department, KpiTemplate } = req.body;
    try {
        if (department == 'all') {
            department = null;
        }
        let getAppraisalDay = await AppraisalDay.findById(id);

        if (!getAppraisalDay) return res.status(404).json({ message: "Appraisal Day not found" });

        let updateAppraisalDay = await AppraisalDay.findByIdAndUpdate(
            id,
            { startDate, department, KpiTemplate, updatedBy: req.user.id },
            { new: true }
        )
            .populate('department', 'title_en title_kh')
            .populate('kpiTemplate', 'name')
            .populate('createdBy', 'username');

        res.status(200).json({ message: "success", data: updateAppraisalDay });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteAppraisalDay = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteAppraisalDay = await AppraisalDay.findByIdAndDelete(id);
        if (!deleteAppraisalDay) return res.status(404).json({ message: "Appraisal Day not found" });
        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}