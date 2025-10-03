const Department = require('../models/Department');
const Employee = require('../models/Employee');
const Applicant = require('../models/Applicant');
const JobApplication = require('../models/JobApplication');
const TestAssignment = require('../models/TestAssignment');

exports.getAllEmployeesWithManager = async (req, res) => {
    try {
        const getEmployees = await Employee.find()
            .select('_id employee_id name_kh city email phone joinDate status positionId gender date_of_birth nationality maritalStatus bloodType commune district id_card_no passport_no present_commune present_district present_village village present_city')
            .populate('createdBy', 'username')
            .populate('city', 'name')
            .populate('present_city', 'name')
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
                    select: 'title_en title_kh manager',
                    populate: {
                        path: 'manager',
                        model: 'Employee',
                        select: 'name_en name_kh employee_id'
                    }
                }
            })
            .sort({ updatedAt: -1 });
        res.json(getEmployees);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getEmployeeGenderStats = async (req, res) => {
    try {
        const stats = await Employee.aggregate([
            {
                $group: {
                    _id: "$gender", // Group by gender
                    count: { $sum: 1 }
                }
            }
        ]);

        // Prepare response
        let maleCount = 0;
        let femaleCount = 0;
        let total = 0;

        stats.forEach(item => {
            if (item._id === "ប្រុស") maleCount = item.count;
            if (item._id === "ស្រី") femaleCount = item.count;
            total += item.count;
        });

        res.json({
            male: maleCount,
            female: femaleCount,
            total: total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};


// Get all applicants (enhanced with job title and status)
exports.getAllApplicants = async (req, res) => {
    try {
        // 1. Fetch all applicants
        const applicants = await Applicant.find().sort({ createdAt: -1 });
        const applicantIds = applicants.map(app => app._id);

        // 2. Fetch job applications
        const jobApps = await JobApplication.find({ applicant_id: { $in: applicantIds } })
            .populate({
                path: 'job_id',
                select: 'job_title department position',
                populate: [
                    { path: 'department', select: 'title_kh' },
                    { path: 'position', select: 'title_kh' }
                ]
            })
            .sort({ createdAt: -1 });

        // 3. Fetch test assignments (latest by createdAt)
        const testAssignments = await TestAssignment.find({ applicant_id: { $in: applicantIds } })
            .sort({ createdAt: -1 }); // latest first

        const jobAppMap = new Map();
        const testAssignmentMap = new Map();

        // 👉 Map first (latest) job application per applicant
        jobApps.forEach(app => {
            const aid = app.applicant_id.toString();
            if (!jobAppMap.has(aid)) jobAppMap.set(aid, app);
        });

        // 👉 Map first (latest) test assignment per applicant
        testAssignments.forEach(ta => {
            const aid = ta.applicant_id.toString();
            if (!testAssignmentMap.has(aid)) {
                testAssignmentMap.set(aid, {
                    _id: ta._id,
                    status: ta.status
                });
            }
        });

        // 4. Map final response
        const mappedApplicants = applicants.map(applicant => {
            const aid = applicant._id.toString();
            const jobApp = jobAppMap.get(aid);
            const testAssignment = testAssignmentMap.get(aid) || {};

            return {
                ...applicant.toObject(),
                job_title: jobApp?.job_id?.job_title || null,
                job_id: jobApp?.job_id?._id || null,
                status: jobApp?.status || 'applied',
                department: jobApp?.job_id?.department?.title_kh || null,
                position: jobApp?.job_id?.position?.title_kh || null,
                job_application_id: jobApp?._id || null,
                applied_date: jobApp?.applied_date || null,
                test_assignment_id: testAssignment._id || null, // ✅ NEW
                test_assignment_status: testAssignment.status || null
            };
        });

        res.status(200).json(mappedApplicants);
    } catch (err) {
        console.error('Error in getAllApplicants:', err);
        res.status(500).json({ message: 'Failed to fetch applicants', error: err.message });
    }
};
