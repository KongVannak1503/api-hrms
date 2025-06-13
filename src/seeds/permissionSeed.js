const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Permission = require('../models/Permission');
const Role = require('../models/Role');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdb';

async function seed() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        await Permission.deleteMany({});
        await Role.deleteMany({});
        await User.deleteMany({});

        // 1. Insert all permissions with full actions
        const permissionsData = [
            { name: 'dashboard', route: '/api/dashboard', actions: ['view'] },
            { name: 'users', route: '/api/users', actions: ['view', 'create', 'update', 'delete'] },
            { name: 'roles', route: '/api/roles', actions: ['view', 'create', 'update', 'delete'] },
            { name: 'categories', route: '/api/categories', actions: ['view', 'create', 'update', 'delete'] },
            { name: 'positions', route: '/api/positions', actions: ['view', 'create', 'update', 'delete'] },
            { name: 'skills', route: '/api/skills', actions: ['view', 'create', 'update', 'delete'] },
            { name: 'employees', route: '/api/employees', actions: ['view', 'create', 'update', 'delete'] },
            { name: 'recruiting', route: '/api/recruiting', actions: ['view', 'create', 'update', 'delete'] },
            { name: 'jobs', route: '/api/jobs', actions: ['view', 'create', 'update', 'delete'] },
            { name: 'job-applications', route: '/api/job-applications', actions: ['view', 'create', 'update', 'delete'] },
            { name: 'post', route: '/api/posts', actions: ['view', 'create', 'update', 'delete'] },
        ];

        const permissions = await Permission.insertMany(permissionsData);

        // Helper to find permission by route
        const getPermissionByRoute = (route) => permissions.find(p => p.route === route);

        // 2. Insert roles with subset of actions per permission
        const rolesData = [
            {
                name: 'admin',
                permissions: permissions.map(p => ({
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
                        // This permission does not exist, remove or add '/api/comments' to permissionsData above
                        permissionId: getPermissionByRoute('/api/dashboard')._id,
                        actions: ['view'],
                    },
                ],
            },
        ];

        const roles = await Role.insertMany(rolesData);

        // 3. Add admin user
        const adminRole = roles.find(r => r.name === 'admin');
        // const hashedPassword = $2b$10$0QWgqtgBqwX3hawy5EHWKOK51ePrH4s.PdbJhKqoPUuzE7OCBON1C;

        const adminUser = await User.create({
            username: 'admin',
            email: 'admin@gmail.com',
            password: 'admin123',
            role: adminRole._id,
            isActive: true,
        });

        console.log('Permissions seeded:', permissions);
        console.log('Roles seeded:', roles);
        console.log('Admin user seeded:', adminUser);

        mongoose.disconnect();
        console.log('Seeding complete');
    } catch (err) {
        console.error(err);
        mongoose.disconnect();
    }
}

seed();
