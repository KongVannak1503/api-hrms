const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Permission = require('../models/Permission');
const Role = require('../models/Role');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Position = require('../models/Position');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdb';

const fullActions = ['view', 'create', 'update', 'delete'];

const allPermissions = [
    { name: "admin", route: "/api/admin", actions: ["view"] },
    { name: "job-postings", route: "/api/job-postings", actions: fullActions },
    { name: "applicants", route: "/api/applicants", actions: fullActions },
    { name: "test-schedules", route: "/api/test-schedules", actions: fullActions },
    { name: "interview-schedules", route: "/api/interview-schedules", actions: fullActions },
    { name: "employees", route: "/api/employees", actions: [...fullActions, "profile", "employee-information", 'additional-position', 'education', 'employee-history', 'document', 'employee-book', 'contract', 'nssf', 'seniority-payment'] },
    { name: "seniority-payment", route: "/api/payroll", actions: fullActions },
    { name: "kpi", route: "/api/kpi", actions: fullActions },
    { name: "appraisal-recently", route: "/api/appraisal-recently", actions: fullActions },
    { name: "appraisals-employee", route: "/api/appraisals/employee", actions: fullActions },
    { name: "appraisals", route: "/api/appraisals", actions: fullActions },
    { name: "reports", route: "/api/reports", actions: ["view", 'export'] },
    { name: "setting", route: "/api/settings", actions: fullActions },
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing collections
        await Permission.deleteMany({});
        await Role.deleteMany({});
        await User.deleteMany({});
        await Employee.deleteMany({});
        await Department.deleteMany({});
        await Position.deleteMany({});
        console.log('✅ Cleared existing data');

        // Insert permissions
        const permissions = await Permission.insertMany(allPermissions);
        console.log(`✅ Inserted ${permissions.length} permissions`);

        // Insert roles
        const roleNames = ['admin', 'hr'];
        const rolesData = roleNames.map(roleName => ({
            role: roleName,
            permissions: permissions.map(p => ({
                permissionId: p._id,
                actions: p.actions,
                isActive: true,
            })),
        }));
        const roles = await Role.insertMany(rolesData);
        console.log(`✅ Inserted ${roles.length} roles`);

        // 1️⃣ Create Multiple Departments
        const departments = await Department.insertMany([
            { title_en: 'Administration, Finance and Planning', title_kh: 'រដ្ឋបាល ហិរញ្ញវត្ថុ និងផែនការ', description: 'Handles employee management', isActive: true },
            { title_en: 'Information Center', title_kh: 'មជ្ឈមណ្ឌលព័ត៌វិទ្យា', description: 'Responsible for IT systems', isActive: true },
            { title_en: 'International Relations', title_kh: 'ទំនាក់ទំនងអន្ដរជាតិ', description: 'Handles finance and accounting', isActive: true },
            { title_en: 'Research Center', title_kh: 'មជ្ឈមណ្ឌលស្រាវជ្រាវ', description: 'Handles finance and accounting', isActive: true },
        ]);

        console.log('✅ Departments created:', departments.map(d => d.title_en));

        // 2️⃣ Create Positions linked to Departments
        const positions = await Position.insertMany([
            { title_en: 'HR Manager', title_kh: 'អ្នកគ្រប់គ្រងធនធានមនុស្ស', department: departments[0]._id },
            { title_en: 'IT Manager', title_kh: 'អ្នកគ្រប់គ្រងបច្ចេកវិទ្យា', department: departments[1]._id },
            { title_en: 'IT Officer', title_kh: 'មន្រ្តីបច្ចេកវិទ្យាព័ត៌មាន', department: departments[1]._id },
            { title_en: 'International Affairs Officer', title_kh: 'មន្រ្តីទំនាក់ទំនងអន្ដរជាតិ', department: departments[2]._id },
        ]);
        console.log('✅ Positions created:', positions.map(p => p.title_en));

        // 3️⃣ Create Employees (Admin + IT Manager + Finance Manager)
        const employees = await Employee.insertMany([
            {
                employee_id: 'EMP1001',
                first_name_en: 'Kong',
                last_name_en: 'Vannak',
                first_name_kh: 'គង់',
                last_name_kh: 'វណ្ណៈ',
                name_en: 'Vannak Kong',
                name_kh: 'គង់ វណ្ណៈ',
                gender: 'ប្រុស',
                email: 'admin@gmail.com',
                phone: '0123456789',
                bloodType: 'A+',
                joinDate: new Date(),
                date_of_birth: new Date(1990, 0, 1),
                nationality: 'Cambodian',
                maritalStatus: 'Single',
                positionId: positions[0]._id, // HR Manager
                status: '1',
                isActive: true,
            },
            {
                employee_id: 'EMP2001',
                first_name_en: 'Chan',
                last_name_en: 'Dara',
                name_en: 'Chan Dara',
                first_name_kh: 'ចាន់',
                last_name_kh: 'ដារា',
                name_kh: 'ចាន់​ ដារា',
                gender: 'ប្រុស',
                email: 'it.manager@gmail.com',
                phone: '011223344',
                joinDate: new Date(),
                date_of_birth: new Date(1988, 3, 5),
                nationality: 'Cambodian',
                maritalStatus: 'Married',
                positionId: positions[1]._id, // IT Manager
                status: '1',
                isActive: true,
            },
            {
                employee_id: 'EMP3001',
                first_name_en: 'Kim',
                last_name_en: 'Lina',
                name_en: 'Kim Lina',
                first_name_en: 'គីម',
                last_name_en: 'លីណា',
                name_en: 'គីម​ លីណា',
                gender: 'ស្រី',
                email: 'finance.manager@gmail.com',
                phone: '099887766',
                joinDate: new Date(),
                date_of_birth: new Date(1992, 6, 12),
                nationality: 'Cambodian',
                maritalStatus: 'Single',
                positionId: positions[2]._id, // Finance Manager
                status: '1',
                isActive: true,
            },
        ]);
        console.log('✅ Employees created:', employees.map(e => e.name_en));

        // 4️⃣ Update Departments with manager + employees
        await Department.findByIdAndUpdate(departments[0]._id, {
            $push: { manager: employees[0]._id, employee: employees[0]._id }
        });
        console.log('✅ Departments updated with managers and employees');

        // 5️⃣ Create Admin User linked to HR Manager (Vannak)
        const adminRole = roles.find(r => r.role === 'admin');

        const adminUser = await User.create({
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123',
            role: adminRole._id,
            employeeId: employees[0]._id,
            isActive: true,
        });

        console.log('✅ Admin user created with employeeId:', adminUser.employeeId.toString());

    } catch (err) {
        console.error('❌ Error during seeding:', err);
    } finally {
        await mongoose.disconnect();
        console.log('✅ MongoDB connection closed. Seeding complete.');
    }
}

seed();
