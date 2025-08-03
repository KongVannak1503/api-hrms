const KpiTemplate = require('../models/KpiTemplate');
const KpiTemplateDay = require('../models/KpiTemplateDay');
const KpiTemplateMonth = require('../models/KpiTemplateMonth');

// Create a new KPI Template
exports.createKpiTemplate = async (req, res) => {
    try {
        const { subs = [], name } = req.body;

        if (!Array.isArray(subs) || subs.length === 0) {
            return res.status(400).json({ message: 'At least one KPI item is required.' });
        }

        const newTemplate = new KpiTemplate({
            subs,
            name,
            createdBy: req.user._id
        });

        await newTemplate.save();
        res.status(201).json(newTemplate);
    } catch (error) {
        console.error('Error creating KPI template:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get all KPI Templates
exports.getAllKpiTemplates = async (req, res) => {

    try {
        const templates = await KpiTemplate.find()
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });
        res.status(200).json(templates);
    } catch (error) {
        console.error('Error fetching KPI templates:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get a single KPI Template by ID
exports.getKpiTemplateById = async (req, res) => {
    try {
        const template = await KpiTemplate.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ message: 'KPI template not found.' });
        }

        res.status(200).json(template);
    } catch (error) {
        console.error('Error fetching KPI template:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Update KPI Template by ID
exports.updateKpiTemplate = async (req, res) => {
    try {
        const { subs = [], name, } = req.body;

        if (!Array.isArray(subs) || subs.length === 0) {
            return res.status(400).json({ message: 'At least one KPI item is required.' });
        }

        const updatedTemplate = await KpiTemplate.findByIdAndUpdate(
            req.params.id,
            {
                subs,
                name,
                updatedBy: req.user._id
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedTemplate) {
            return res.status(404).json({ message: 'KPI template not found.' });
        }

        res.status(200).json(updatedTemplate);
    } catch (error) {
        console.error('Error updating KPI template:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Delete KPI Template by ID
exports.deleteKpiTemplate = async (req, res) => {
    try {
        const deleted = await KpiTemplate.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: 'KPI template not found.' });
        }

        res.status(200).json({ message: 'KPI template deleted successfully.' });
    } catch (error) {
        console.error('Error deleting KPI template:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// month
// Create a new KPI Template
exports.createKpiTemplateMonth = async (req, res) => {
    try {
        const { subs = [], startDate, endDate } = req.body;

        if (!Array.isArray(subs) || subs.length === 0) {
            return res.status(400).json({ message: 'At least one KPI item is required.' });
        }

        const newTemplate = new KpiTemplateMonth({
            subs,
            startDate: startDate || null,
            endDate: endDate || null,
            createdBy: req.user._id
        });

        await newTemplate.save();
        res.status(201).json(newTemplate);
    } catch (error) {
        console.error('Error creating KPI template:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get all KPI Templates
exports.getAllKpiTemplatesMonth = async (req, res) => {

    try {
        const templates = await KpiTemplateMonth.find()
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });
        res.status(200).json(templates);
    } catch (error) {
        console.error('Error fetching KPI templates:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get a single KPI Template by ID
exports.getKpiTemplateMonthById = async (req, res) => {
    try {
        const template = await KpiTemplateMonth.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ message: 'KPI template not found.' });
        }

        res.status(200).json(template);
    } catch (error) {
        console.error('Error fetching KPI template:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Update KPI Template by ID
exports.updateKpiTemplateMonth = async (req, res) => {
    try {
        const { subs = [], startDate, endDate } = req.body;

        if (!Array.isArray(subs) || subs.length === 0) {
            return res.status(400).json({ message: 'At least one KPI item is required.' });
        }

        const updatedTemplate = await KpiTemplateMonth.findByIdAndUpdate(
            req.params.id,
            {
                subs,
                startDate: startDate || null,
                endDate: endDate || null, updatedBy: req.user._id
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedTemplate) {
            return res.status(404).json({ message: 'KPI template not found.' });
        }

        res.status(200).json(updatedTemplate);
    } catch (error) {
        console.error('Error updating KPI template:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Delete KPI Template by ID
exports.deleteKpiTemplateMonth = async (req, res) => {
    try {
        const deleted = await KpiTemplateMonth.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: 'KPI template not found.' });
        }

        res.status(200).json({ message: 'KPI template deleted successfully.' });
    } catch (error) {
        console.error('Error deleting KPI template:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.duplicateKpiTemplateMonth = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the original KpiTemplate by ID
        const original = await KpiTemplateMonth.findById(id);
        if (!original) {
            return res.status(404).json({ message: 'Original KPI template not found' });
        }

        // Convert document to plain JS object and remove _id and timestamps
        const duplicatedData = original.toObject();
        delete duplicatedData._id;
        delete duplicatedData.createdAt;
        delete duplicatedData.updatedAt;
        duplicatedData.createdBy = req.user._id;

        const newTemplate = new KpiTemplateMonth(duplicatedData);

        await newTemplate.save();

        res.status(201).json({ message: 'KPI Template duplicated successfully', data: newTemplate });
    } catch (error) {
        console.error('Error duplicating KPI template:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Individual
const KpiSubmissionMonth = require('../models/KpiSubmissionIndividualMonth');
exports.createIndividualMonth = async (req, res) => {
    try {
        const { employee, templateId, scores, feedback } = req.body;

        const submission = new KpiSubmissionMonth({
            employee,
            templateId,
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
        const { employee, templateId } = req.params;

        const submission = await KpiSubmissionMonth.findOne({
            employee: employee,
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

        const submission = await KpiSubmissionMonth.findById(id);

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

// end Month


// Day
// Create a new KPI Template
exports.createKpiTemplateDay = async (req, res) => {
    try {
        const { subs = [], startDate, endDate } = req.body;

        if (!Array.isArray(subs) || subs.length === 0) {
            return res.status(400).json({ message: 'At least one KPI item is required.' });
        }

        const newTemplate = new KpiTemplateDay({
            subs,
            startDate: startDate || null,
            endDate: endDate || null,
            createdBy: req.user._id
        });

        await newTemplate.save();
        res.status(201).json(newTemplate);
    } catch (error) {
        console.error('Error creating KPI template:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get all KPI Templates
exports.getAllKpiTemplatesDay = async (req, res) => {

    try {
        const templates = await KpiTemplateDay.find()
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });
        res.status(200).json(templates);
    } catch (error) {
        console.error('Error fetching KPI templates:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get a single KPI Template by ID
exports.getKpiTemplateDayById = async (req, res) => {
    try {
        const template = await KpiTemplateDay.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ message: 'KPI template not found.' });
        }

        res.status(200).json(template);
    } catch (error) {
        console.error('Error fetching KPI template:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Update KPI Template by ID
exports.updateKpiTemplateDay = async (req, res) => {
    try {
        const { subs = [], startDate, endDate } = req.body;

        if (!Array.isArray(subs) || subs.length === 0) {
            return res.status(400).json({ message: 'At least one KPI item is required.' });
        }

        const updatedTemplate = await KpiTemplateDay.findByIdAndUpdate(
            req.params.id,
            {
                subs,
                startDate: startDate || null,
                endDate: endDate || null, updatedBy: req.user._id
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedTemplate) {
            return res.status(404).json({ message: 'KPI template not found.' });
        }

        res.status(200).json(updatedTemplate);
    } catch (error) {
        console.error('Error updating KPI template:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Delete KPI Template by ID
exports.deleteKpiTemplateDay = async (req, res) => {
    try {
        const deleted = await KpiTemplateDay.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: 'KPI template not found.' });
        }

        res.status(200).json({ message: 'KPI template deleted successfully.' });
    } catch (error) {
        console.error('Error deleting KPI template:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.duplicateKpiTemplateDay = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the original KpiTemplate by ID
        const original = await KpiTemplateDay.findById(id);
        if (!original) {
            return res.status(404).json({ message: 'Original KPI template not found' });
        }

        // Convert document to plain JS object and remove _id and timestamps
        const duplicatedData = original.toObject();
        delete duplicatedData._id;
        delete duplicatedData.createdAt;
        delete duplicatedData.updatedAt;
        duplicatedData.createdBy = req.user._id;

        const newTemplate = new KpiTemplateDay(duplicatedData);

        await newTemplate.save();

        res.status(201).json({ message: 'KPI Template duplicated successfully', data: newTemplate });
    } catch (error) {
        console.error('Error duplicating KPI template:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Individual
const KpiSubmissionDay = require('../models/KpiSubmissionIndividualDay');
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
        const { employee, templateId } = req.params;

        const submission = await KpiSubmissionDay.findOne({
            employee: employee,
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

// end Days

exports.getActiveKpiTemplates = async (req, res) => {
    try {
        const today = new Date();

        const templates = await KpiTemplate.find({
            startDate: { $lte: today },
            endDate: { $gte: today }
        });

        res.status(200).json(templates);
    } catch (error) {
        console.error('Error fetching active KPI templates:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.duplicateKpiTemplate = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the original KpiTemplate by ID
        const original = await KpiTemplate.findById(id);
        if (!original) {
            return res.status(404).json({ message: 'Original KPI template not found' });
        }

        // Convert document to plain JS object and remove _id and timestamps
        const duplicatedData = original.toObject();
        delete duplicatedData._id;
        delete duplicatedData.createdAt;
        delete duplicatedData.updatedAt;
        duplicatedData.createdBy = req.user._id;
        const newTemplate = new KpiTemplate(duplicatedData);

        await newTemplate.save();

        res.status(201).json({ message: 'KPI Template duplicated successfully', data: newTemplate });
    } catch (error) {
        console.error('Error duplicating KPI template:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Individual
const KpiSubmission = require('../models/KpiSubmissionIndividual');
const KpiSubmissionYearEmp = require('../models/KpiSubmissionIndividualYearEmp');
exports.createIndividual = async (req, res) => {
    try {
        const { employee, templateId, scores, feedback } = req.body;

        const submission = new KpiSubmission({
            employee,
            templateId,
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

exports.updateIndividual = async (req, res) => {
    try {
        const { id } = req.params;
        const { scores, feedback } = req.body;

        const submission = await KpiSubmission.findById(id);

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

exports.createIndividualYearEmp = async (req, res) => {
    try {
        const { employee, templateId, scores, feedback } = req.body;

        const submission = new KpiSubmissionYearEmp({
            employee,
            templateId,
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

exports.getIndividualThisYearEmp = async (req, res) => {
    try {
        const { employee, templateId } = req.params;

        const submission = await KpiSubmissionYearEmp.findOne({
            employee: employee,
            templateId: templateId,
        }).populate('templateId');

        // if (!submission) {
        //     return res.status(404).json({ message: 'No submission found for this employee this month' });
        // }
        res.status(200).json(submission);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateIndividualYearEmp = async (req, res) => {
    try {
        const { id } = req.params;
        const { scores, feedback } = req.body;

        const submission = await KpiSubmissionYearEmp.findById(id);

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


const moment = require('moment');

exports.getEmployeeKpiSubmissionIndividualThisMonth = async (req, res) => {
    try {
        const employeeId = req.params.id;

        const startOfMonth = moment().startOf('month').toDate();
        const endOfMonth = moment().endOf('month').toDate();

        const submission = await KpiSubmission.findOne({
            employee: employeeId,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
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

exports.getEmployeeKpiSubmissionIndividualThisYear = async (req, res) => {
    try {
        const { employee, templateId } = req.params;

        const submission = await KpiSubmission.findOne({
            employee: employee,
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
