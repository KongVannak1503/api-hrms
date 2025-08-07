const AppraisalDay = require("../models/AppraisalDay");
const AppraisalMonth = require("../models/AppraisalMonth");
const KpiSubmissionIndividualDay = require('../models/KpiSubmissionIndividualDay');
const KpiSubmissionIndividualEmployeeDay = require('../models/KpiSubmissionIndividualEmployeeDay');
const KpiSubmissionIndividualManagerDay = require('../models/KpiSubmissionIndividualManagerDay');

const KpiSubmissionIndividualMonth = require('../models/KpiSubmissionIndividualMonth');
const KpiSubmissionIndividualEmployeeMonth = require('../models/KpiSubmissionIndividualEmployeeMonth');
const KpiSubmissionIndividualManagerMonth = require('../models/KpiSubmissionIndividualManagerMonth');
const moment = require('moment');
const KpiSubmissionDay = require('../models/KpiSubmissionIndividualDay');
// Get all Day
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
        console.log(department);

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

        const today = moment().startOf('day');

        // Use Promise.all to fetch completion status in parallel
        const resultWithStatus = await Promise.all(getAppraisalDays.map(async (item) => {
            const isToday = moment(item.startDate).isSame(today, 'day');

            const hasSubmission = await KpiSubmissionIndividualDay.exists({ appraisalDay: item._id });

            return {
                ...item.toObject(),
                isActive: isToday,
                type: hasSubmission ? true : false
            };
        }));

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

// Individual

exports.createIndividualDay = async (req, res) => {
    try {
        const { employee, templateId, appraisalDay, scores, feedback } = req.body;

        const submission = new KpiSubmissionDay({
            employee,
            templateId,
            appraisalDay,
            scores,
            feedback,
        });

        await submission.save();
        res.status(201).json(submission);
    } catch (err) {
        console.error('Error saving KPI submission:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getIndividualThisDay = async (req, res) => {
    try {
        const { employee, dayId, templateId } = req.params;

        const submission = await KpiSubmissionDay.findOne({
            employee: employee,
            appraisalDay: dayId,
            templateId: templateId,
        }).populate('templateId');

        if (!submission) {
            return res.status(404).json({ message: 'No submission found for this employee this month' });
        }
        res.status(200).json(submission);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateIndividualDay = async (req, res) => {
    try {
        const { id } = req.params;
        const { scores, feedback } = req.body;

        const submission = await KpiSubmissionDay.findById(id);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Update fields
        if (scores) submission.scores = scores;
        if (feedback !== undefined) submission.feedback = feedback;

        await submission.save();

        res.status(200).json(submission);
    } catch (err) {
        console.error('Error updating KPI submission:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.createIndividualEmployeeDay = async (req, res) => {
    try {
        const { employee, templateId, appraisalDay, scores, feedback } = req.body;

        const submission = new KpiSubmissionIndividualEmployeeDay({
            employee,
            templateId,
            appraisalDay,
            scores,
            feedback,
        });

        await submission.save();
        res.status(201).json(submission);
    } catch (err) {
        console.error('Error saving KPI submission:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getIndividualEmployeeThisDay = async (req, res) => {
    try {
        const { employee, dayId, templateId } = req.params;

        const submission = await KpiSubmissionIndividualEmployeeDay.findOne({
            employee: employee,
            appraisalDay: dayId,
            templateId: templateId,
        }).populate('templateId');

        if (!submission) {
            return res.status(404).json({ message: 'No submission found for this employee this month' });
        }
        res.status(200).json(submission);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateIndividualEmployeeDay = async (req, res) => {
    try {
        const { id } = req.params;
        const { scores, feedback } = req.body;

        const submission = await KpiSubmissionIndividualEmployeeDay.findById(id);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Update fields
        if (scores) submission.scores = scores;
        if (feedback !== undefined) submission.feedback = feedback;

        await submission.save();

        res.status(200).json(submission);
    } catch (err) {
        console.error('Error updating KPI submission:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.createIndividualManagerDay = async (req, res) => {
    try {
        const { employee, templateId, appraisalDay, scores, feedback } = req.body;

        const submission = new KpiSubmissionIndividualManagerDay({
            employee,
            templateId,
            appraisalDay,
            scores,
            feedback,
        });

        await submission.save();
        res.status(201).json(submission);
    } catch (err) {
        console.error('Error saving KPI submission:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getIndividualManagerThisDay = async (req, res) => {
    try {
        const { employee, dayId, templateId } = req.params;

        const submission = await KpiSubmissionIndividualManagerDay.findOne({
            employee: employee,
            appraisalDay: dayId,
            templateId: templateId,
        }).populate('templateId');

        if (!submission) {
            return res.status(404).json({ message: 'No submission found for this employee this month' });
        }
        res.status(200).json(submission);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateIndividualManagerDay = async (req, res) => {
    try {
        const { id } = req.params;
        const { scores, feedback } = req.body;

        const submission = await KpiSubmissionIndividualManagerDay.findById(id);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Update fields
        if (scores) submission.scores = scores;
        if (feedback !== undefined) submission.feedback = feedback;

        await submission.save();

        res.status(200).json(submission);
    } catch (err) {
        console.error('Error updating KPI submission:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
// end Days

// Get all Month
exports.getAppraisalMonths = async (req, res) => {
    try {
        const getAppraisalMonths = await AppraisalMonth.find()
            .populate('department', 'title_en title_kh')
            .populate('kpiTemplate', 'name')
            .populate('createdBy', 'username')
            .sort({ updatedAt: -1 });
        res.json(getAppraisalMonths);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getAppraisalMonthsByDepartment = async (req, res) => {
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

        const getAppraisals = await AppraisalMonth.find(filter)
            .populate('department', 'title_en title_kh')
            .populate('kpiTemplate', 'name')
            .populate('createdBy', 'username')
            .sort({ updatedAt: -1 });

        // Add status: active/inactive
        const today = moment().startOf('day');
        const resultWithStatus = getAppraisals.map(item => {
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

exports.getAppraisalMonth = async (req, res) => {
    const { id } = req.params;

    try {
        const getAppraisalDay = await AppraisalMonth.findById(id);
        if (!getAppraisalDay) return res.status(404).json({ message: "Appraisal Day not found" });
        res.json(getAppraisalDay);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
}

exports.createAppraisalMonth = async (req, res) => {
    let { startDate, endDate, announcementDay, department, kpiTemplate } = req.body;
    console.log(req.body);

    try {
        if (department == 'all') {
            department = null;
        }
        if (!startDate || !kpiTemplate) {
            return res.status(400).json({ message: "name field is required" });
        }

        const createAppraisalDay = new AppraisalMonth({ startDate, endDate, announcementDay, department, kpiTemplate, createdBy: req.user.id });
        await createAppraisalDay.save();
        // let getAppraisalDay = await AppraisalMonth.findById(createAppraisalDay._id);
        const populated = await AppraisalMonth.findById(createAppraisalDay._id)
            .populate('kpiTemplate', 'name')
            .populate('createdBy', 'username')
            .populate('department', 'title_en title_kh');

        res.status(201).json({ message: 'success', data: populated });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.updateAppraisalMonth = async (req, res) => {
    const { id } = req.params;
    let { startDate, endDate, announcementDay, department, kpiTemplate } = req.body;
    console.log(req.body);

    try {
        if (department == 'all') {
            department = null;
        }
        let getAppraisalDay = await AppraisalMonth.findById(id);

        if (!getAppraisalDay) return res.status(404).json({ message: "Appraisal Day not found" });

        let updateAppraisalDay = await AppraisalMonth.findByIdAndUpdate(
            id,
            { startDate, endDate, announcementDay, department, kpiTemplate, updatedBy: req.user.id },
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

exports.deleteAppraisalMonth = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteAppraisalDay = await AppraisalMonth.findByIdAndDelete(id);
        if (!deleteAppraisalDay) return res.status(404).json({ message: "Appraisal Day not found" });
        res.json({ message: "Deleted successfully!" });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

// Individual

exports.createIndividualMonth = async (req, res) => {
    try {
        const { employee, templateId, appraisalDay, scores, feedback } = req.body;

        const submission = new KpiSubmissionIndividualMonth({
            employee,
            templateId,
            appraisalMonth: appraisalDay,
            scores,
            feedback,
        });

        await submission.save();
        res.status(201).json(submission);
    } catch (err) {
        console.error('Error saving KPI submission:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getIndividualThisMonth = async (req, res) => {
    try {
        const { employee, dayId, templateId } = req.params;
        const submission = await KpiSubmissionIndividualMonth.findOne({
            employee: employee,
            appraisalMonth: dayId,
            templateId: templateId,
        }).populate('templateId');

        if (!submission) {
            return res.status(404).json({ message: 'No submission found for this employee this month' });
        }
        res.status(200).json(submission);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateIndividualMonth = async (req, res) => {
    try {
        const { id } = req.params;
        const { scores, feedback } = req.body;

        const submission = await KpiSubmissionIndividualMonth.findById(id);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Update fields
        if (scores) submission.scores = scores;
        if (feedback !== undefined) submission.feedback = feedback;

        await submission.save();

        res.status(200).json(submission);
    } catch (err) {
        console.error('Error updating KPI submission:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.createIndividualEmployeeMonth = async (req, res) => {
    try {
        const { employee, templateId, appraisalDay, scores, feedback } = req.body;

        const submission = new KpiSubmissionIndividualEmployeeMonth({
            employee,
            templateId,
            appraisalMonth: appraisalDay,
            scores,
            feedback,
        });

        await submission.save();
        res.status(201).json(submission);
    } catch (err) {
        console.error('Error saving KPI submission:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getIndividualEmployeeThisMonth = async (req, res) => {
    try {
        const { employee, dayId, templateId } = req.params;

        const submission = await KpiSubmissionIndividualEmployeeMonth.findOne({
            employee: employee,
            appraisalMonth: dayId,
            templateId: templateId,
        }).populate('templateId');

        if (!submission) {
            return res.status(404).json({ message: 'No submission found for this employee this month' });
        }
        res.status(200).json(submission);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateIndividualEmployeeMonth = async (req, res) => {
    try {
        const { id } = req.params;
        const { scores, feedback } = req.body;

        const submission = await KpiSubmissionIndividualEmployeeMonth.findById(id);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Update fields
        if (scores) submission.scores = scores;
        if (feedback !== undefined) submission.feedback = feedback;

        await submission.save();

        res.status(200).json(submission);
    } catch (err) {
        console.error('Error updating KPI submission:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.createIndividualManagerMonth = async (req, res) => {
    try {
        const { employee, templateId, appraisalDay, scores, feedback } = req.body;

        const submission = new KpiSubmissionIndividualManagerMonth({
            employee,
            templateId,
            appraisalMonth: appraisalDay,
            scores,
            feedback,
        });

        await submission.save();
        res.status(201).json(submission);
    } catch (err) {
        console.error('Error saving KPI submission:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getIndividualManagerThisMonth = async (req, res) => {
    try {
        const { employee, dayId, templateId } = req.params;

        const submission = await KpiSubmissionIndividualManagerMonth.findOne({
            employee: employee,
            appraisalMonth: dayId,
            templateId: templateId,
        }).populate('templateId');

        if (!submission) {
            return res.status(404).json({ message: 'No submission found for this employee this month' });
        }
        res.status(200).json(submission);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateIndividualManagerMonth = async (req, res) => {
    try {
        const { id } = req.params;
        const { scores, feedback } = req.body;

        const submission = await KpiSubmissionIndividualManagerMonth.findById(id);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Update fields
        if (scores) submission.scores = scores;
        if (feedback !== undefined) submission.feedback = feedback;

        await submission.save();

        res.status(200).json(submission);
    } catch (err) {
        console.error('Error updating KPI submission:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};