const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Position = require('../models/Position');
const Applicant = require('../models/Applicant');

const getEmployeeCount = async (req, res) => {
  try {
    const count = await Employee.countDocuments();
    res.json({ totalEmployees: count });
  } catch (error) {
    console.error('Error counting employees:', error);
    res.status(500).json({ error: 'Failed to count employees' });
  }
};

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
