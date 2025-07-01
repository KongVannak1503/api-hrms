const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Permission = require('../models/Permission');
const Role = require('../models/Role');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdb';

const fullActions = ['view', 'create', 'update', 'delete'];

const allPermissions = [
    { name: 'dashboard', route: '/api/dashboard', actions: ['view'] },
    { name: 'users', route: '/api/users' },
    { name: 'roles', route: '/api/roles' },
    { name: 'categories', route: '/api/categories' },
    { name: 'positions', route: '/api/positions' },
    { name: 'skills', route: '/api/skills' },
    { name: 'employees', route: '/api/employees' },
    { name: 'recruiting', route: '/api/recruiting' },
    { name: 'jobs', route: '/api/jobs' },
    { name: 'job-applications', route: '/api/job-applications' },
    { name: 'post', route: '/api/posts' },
    { name: 'organizations', route: '/api/organizations' },
    { name: 'departments', route: '/api/departments' },
    { name: 'cities', route: '/api/cities' },
    { name: 'districts', route: '/api/districts' },
    { name: 'communes', route: '/api/communes' },
    { name: 'villages', route: '/api/villages' },
    { name: 'education-level', route: '/api/education-level' },
];

// Ensure each has actions
const permissionsData = allPermissions.map((perm) => ({
    ...perm,
    actions: perm.actions || fullActions,
}));

async function seed() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Clean up
        await Permission.deleteMany({});
        await Role.deleteMany({});
        await User.deleteMany({});

        // 1. Insert permissions
        const permissions = await Permission.insertMany(permissionsData);
        console.log(`✅ Inserted ${permissions.length} permissions`);

        // Helper
        const getPermissionByRoute = (route) =>
            permissions.find((p) => p.route === route);

        // 2. Roles
        const rolesData = [
            {
                name: 'admin',
                permissions: permissions.map((p) => ({
                    permissionId: p._id,
                    actions: p.actions,
                })),
            },
            {
                name: 'editor',
                permissions: [
                    {
                        permissionId: getPermissionByRoute('/api/posts')._id,
                        actions: ['view', 'create', 'update', 'delete'],
                    },
                    {
                        permissionId: getPermissionByRoute('/api/dashboard')._id,
                        actions: ['view'],
                    },
                ],
            },
            {
                name: 'viewer',
                permissions: [
                    {
                        permissionId: getPermissionByRoute('/api/posts')._id,
                        actions: ['view'],
                    },
                    {
                        permissionId: getPermissionByRoute('/api/dashboard')._id,
                        actions: ['view'],
                    },
                ],
            },
        ];

        const roles = await Role.insertMany(rolesData);
        console.log(`✅ Inserted ${roles.length} roles`);

        // 3. Admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminRole = roles.find((r) => r.name === 'admin');

        const adminUser = await User.create({
            username: 'admin',
            email: 'admin@gmail.com',
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
