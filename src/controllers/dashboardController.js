const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Position = require('../models/Position');
const Applicant = require('../models/Applicant');
const AppraisalMonth = require("../models/AppraisalMonth");
const KpiSubmissionIndividualEmployeeMonth = require('../models/KpiSubmissionIndividualEmployeeMonth');
const KpiSubmissionIndividualManagerMonth = require('../models/KpiSubmissionIndividualManagerMonth');


exports.getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const departments = await Department.countDocuments();
    const positions = await Position.countDocuments();
    const applicants = await Applicant.countDocuments();

    const departmentData = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totalEmployees,
      departments,
      positions,
      applicants,
      departmentData,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: err });
  }
};

exports.getEmployeesByDepartment = async (req, res) => {
  try {
    const employees = await Employee.aggregate([
      {
        $lookup: {
          from: 'positions',
          localField: 'positionId',
          foreignField: '_id',
          as: 'position'
        }
      },
      { $unwind: '$position' },
      {
        $lookup: {
          from: 'departments',
          localField: 'position.department',
          foreignField: '_id',
          as: 'department'
        }
      },
      { $unwind: '$department' },
      {
        $group: {
          _id: '$department._id',
          departmentName: { $first: '$department.title_en' },
          count: { $sum: 1 }
        }
      },
      { $sort: { departmentName: 1 } }
    ]);

    res.json(employees);
  } catch (error) {
    console.error('Error fetching department employee counts:', error);
    res.status(500).json({ error: 'Failed to fetch department data' });
  }
};
exports.getRecentlyAppraisal = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ Get all employee submissions only
    const submissions = await KpiSubmissionIndividualEmployeeMonth.find()
      .populate({
        path: 'employee',
        select: 'name_kh name_en image_url',
        populate: { path: 'image_url', select: 'path' }
      });

    const appraisalMonths = await AppraisalMonth.find()
      .populate('department', 'title_en title_kh')
      .populate('kpiTemplate', 'name')
      .populate('createdBy', 'username')
      .sort({ updatedAt: -1 });

    const result = [];

    for (const month of appraisalMonths) {
      if (!month.endDate || month.announcementDay == null) continue;

      const endDate = new Date(month.endDate);
      endDate.setHours(0, 0, 0, 0);

      const announcementThreshold = new Date(endDate);
      announcementThreshold.setDate(announcementThreshold.getDate() - month.announcementDay);

      const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

      // ✅ Employee submissions for this month
      const monthEmployeeSubs = submissions.filter(
        sub => String(sub.appraisalMonth) === String(month._id)
      );

      monthEmployeeSubs.forEach(sub => {
        const employeeScoreSum = sub.scores.reduce((sum, s) => sum + (s.score || 0), 0);

        result.push({
          appraisalMonthId: month._id,
          appraisalMonthName: month.name,
          department: month.department,
          kpiTemplate: month.kpiTemplate,
          createdBy: month.createdBy,
          startDate: month.startDate,
          endDate: month.endDate,
          daysLeft,
          announcementThreshold,
          show: today >= announcementThreshold,
          message:
            today >= announcementThreshold
              ? `បានចាប់ផ្តើមបង្ហាញពីថ្ងៃ ${announcementThreshold.toLocaleDateString()}`
              : `មិនទាន់បង្ហាញ (ចាំរយៈពេល ${month.announcementDay} ថ្ងៃមុនថ្ងៃបញ្ចប់)`,
          status: today <= endDate,
          type: true, // submission exists for this employee
          employee: {
            id: sub.employee?._id,
            name_kh: sub.employee?.name_kh,
            name_en: sub.employee?.name_en,
            createdAt: sub.createdAt,
            imagePath: sub.employee?.image_url?.path || null,
          },
          employeeScoreSum // sum only for this submission
        });
      });
    }

    // ✅ Filter only active months with employee scores
    const filteredResult = result.filter(
      item => item.status && item.employeeScoreSum > 0
    );

    // Optional: Limit to latest 5 appraisal months
    const latestResult = filteredResult.slice(0, 5);

    res.json(latestResult);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};
