const mongoose = require('mongoose');
require('dotenv').config();

const Permission = require('../models/Permission');
const Role = require('../models/Role');

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

        // 1. Insert all permissions with full actions
        const permissionsData = [
            { route: '/api/users', actions: ['view', 'update', 'delete'] },
            { route: '/api/posts', actions: ['view', 'update', 'delete'] },
            { route: '/api/comments', actions: ['view', 'delete'] },
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
                    actions: p.actions, // admin has all actions on all permissions
                })),
            },
            {
                name: 'editor',
                permissions: [
                    {
                        permissionId: getPermissionByRoute('/api/posts')._id,
                        actions: ['view', 'update', 'delete'], // full on posts
                    },
                    {
                        permissionId: getPermissionByRoute('/api/comments')._id,
                        actions: ['view', 'delete'], // full on comments
                    },
                ],
            },
            {
                name: 'viewer',
                permissions: [
                    {
                        permissionId: getPermissionByRoute('/api/posts')._id,
                        actions: ['view'], // only view posts
                    },
                    {
                        permissionId: getPermissionByRoute('/api/comments')._id,
                        actions: ['view'], // only view comments
                    },
                ],
            },
        ];

        const roles = await Role.insertMany(rolesData);

        console.log('Permissions seeded:', permissions);
        console.log('Roles seeded:', roles);

        mongoose.disconnect();
        console.log('Seeding complete');
    } catch (err) {
        console.error(err);
        mongoose.disconnect();
    }
}

seed();
