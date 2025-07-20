const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Permission = require('../models/Permission');
const Role = require('../models/Role');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdb';

// Full actions for most permissions
const fullActions = ['view', 'create', 'update', 'delete'];
const fullActionsNoCreate = ['view', 'update', 'delete'];

// New permissions list including 'profile' for employees
const allPermissions = [
    { name: "dashboard", route: "/api/dashboard", actions: ["view"], roles: ["admin", "manager", "line manager", "employee"] },
    { name: "users", route: "/api/users", actions: fullActions, roles: ["admin"] },
    { name: "roles", route: "/api/roles", actions: fullActionsNoCreate, roles: ["admin"] },
    { name: "employees", route: "/api/employees", actions: [...fullActions, "profile"], roles: ["admin", "manager", "line manager", "employee"] },
    { name: "recruiting", route: "/api/recruiting", actions: fullActions, roles: ["admin", "manager", "line manager"] },
    { name: "jobs", route: "/api/jobs", actions: fullActions, roles: ["admin", "manager", "line manager"] },
    { name: "job-applications", route: "/api/job-applications", actions: fullActions, roles: ["admin", "manager", "line manager"] },
    { name: "payroll", route: "/api/payroll", actions: fullActions, roles: ["admin"] },
    { name: "applicants", route: "/api/applicants", actions: fullActions, roles: ["admin", "manager", "line manager"] },
    { name: "job-postings", route: "/api/job-postings", actions: fullActions, roles: ["admin", "manager", "line manager"] },
    { name: "interview", route: "/api/interview", actions: fullActions, roles: ["admin", "manager", "line manager"] },
    { name: "test-assignments", route: "/api/test-assignments", actions: fullActions, roles: ["admin", "manager", "line manager"] },
    { name: "setting", route: "/api/settings", actions: fullActions, roles: ["admin"] },
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Permission.deleteMany({});
        await Role.deleteMany({});
        await User.deleteMany({});

        // Insert permissions
        const permissions = await Permission.insertMany(allPermissions);
        console.log(`✅ Inserted ${permissions.length} permissions`);

        // Roles names including line manager
        const roleNames = ['admin', 'manager', 'line manager', 'employee'];

        // Create roles with permissions filtered by role and action adjusted for employees on 'employees'
        const rolesData = roleNames.map(roleName => {
            const allowedPermissions = permissions.filter(p => p.roles.includes(roleName));

            return {
                name: roleName,
                permissions: allowedPermissions.map(p => {
                    if (p.name === 'employees') {
                        // employee role only gets 'profile' action on employees permission
                        if (roleName === 'employee') {
                            return {
                                permissionId: p._id,
                                actions: ['profile'],
                                isActive: true,
                            };
                        }
                        // admin, manager, and line manager get full actions on employees
                        return {
                            permissionId: p._id,
                            actions: p.actions,
                            isActive: true,
                        };
                    }

                    // All other permissions - full actions
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

        // Create an admin user
        const adminRole = roles.find(r => r.name === 'admin');

        const adminUser = await User.create({
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123', // consider hashing here if your User model doesn't hash automatically
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
