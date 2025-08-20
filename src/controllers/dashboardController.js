const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Position = require('../models/Position');
const Applicant = require('../models/Applicant');


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
    console.log(employees);

    res.json(employees);
  } catch (error) {
    console.error('Error fetching department employee counts:', error);
    res.status(500).json({ error: 'Failed to fetch department data' });
  }
};

