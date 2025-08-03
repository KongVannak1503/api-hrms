const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Permission = require('../models/Permission');
const Role = require('../models/Role');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdb';

const fullActions = ['view', 'create', 'update', 'delete'];

const allPermissions = [
    { name: "dashboard", route: "/api/dashboard", actions: ["view"], roles: ["admin", "hr", "manager", "upper manager", "employee"] },
    { name: "users", route: "/api/users", actions: fullActions, roles: ["admin"] },
    { name: "roles", route: "/api/roles", actions: fullActions, roles: ["admin"] },
    { name: "employees", route: "/api/employees", actions: [...fullActions, "profile"], roles: ["admin", "hr", "manager", "upper manager", "employee"] },
    { name: "recruiting", route: "/api/recruiting", actions: fullActions, roles: ["admin", "hr", "manager", "upper manager"] },
    { name: "jobs", route: "/api/jobs", actions: fullActions, roles: ["admin", "hr", "manager", "upper manager"] },
    { name: "job-applications", route: "/api/job-applications", actions: fullActions, roles: ["admin", "hr", "manager", "upper manager"] },
    { name: "payroll", route: "/api/payroll", actions: fullActions, roles: ["admin", "hr"] },
    { name: "applicants", route: "/api/applicants", actions: fullActions, roles: ["admin", "hr", "manager", "upper manager"] },
    { name: "job-postings", route: "/api/job-postings", actions: fullActions, roles: ["admin", "hr", "manager", "upper manager"] },
    { name: "interview", route: "/api/interview", actions: fullActions, roles: ["admin", "hr", "manager", "upper manager"] },
    { name: "test-assignments", route: "/api/test-assignments", actions: fullActions, roles: ["admin", "hr", "manager", "upper manager"] },
    { name: "setting", route: "/api/settings", actions: fullActions, roles: ["admin"] },
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Clear existing collections
        await Permission.deleteMany({});
        await Role.deleteMany({});
        await User.deleteMany({});
        console.log('✅ Cleared existing data');

        // Insert permissions
        const permissions = await Permission.insertMany(allPermissions);
        console.log(`✅ Inserted ${permissions.length} permissions`);

        // Role names including 'hr'
        const roleNames = ['admin', 'hr', 'manager', 'upper manager', 'employee'];

        // Create roles data
        const rolesData = roleNames.map(roleName => {
            const allowedPermissions = permissions.filter(p => p.roles.includes(roleName));

            return {
                name: roleName,
                role: roleName, // unique string field
                permissions: allowedPermissions.map(p => {
                    if (p.name === 'employees') {
                        if (roleName === 'employee') {
                            return {
                                permissionId: p._id,
                                actions: ['profile'], // only 'profile' for employee
                                isActive: true,
                            };
                        }
                        return {
                            permissionId: p._id,
                            actions: p.actions,
                            isActive: true,
                        };
                    }
                    return {
                        permissionId: p._id,
                        actions: p.actions,
                        isActive: true,
                    };
                }),
            };
        });

        const roles = await Role.insertMany(rolesData);
        console.log(`✅ Inserted ${roles.length} roles`);

        // Find admin role _id
        const adminRole = roles.find(r => r.name === 'admin');

        // Hash admin password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create admin user
        const adminUser = await User.create({
            username: 'admin',
            email: 'admin@example.com',
            password: "admin123",
            role: adminRole._id,
            isActive: true,
        });
        console.log('✅ Admin user created:', adminUser.username);

    } catch (err) {
        console.error('❌ Error during seeding:', err);
    } finally {
        await mongoose.disconnect();
        console.log('✅ MongoDB connection closed. Seeding complete.');
    }
}

seed();
