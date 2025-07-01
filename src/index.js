const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dbConnect = require('./config/dbConnect');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const positionRoutes = require('./routes/positionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const skillRoutes = require('./routes/skillRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const cityRoutes = require('./routes/cityRoutes');
const districtRoutes = require('./routes/districtRoutes');
const communeRoutes = require('./routes/communeRoutes');
const villageRoutes = require('./routes/villageRoutes');
const educationLevelRoutes = require('./routes/educationLevelRoutes');
require('dotenv').config();

dbConnect();

const app = express();
const path = require('path');

// const allowedOrigins = [
//     process.env.CLIENT_URL,
//     process.env.HOST_CLIENT_URL
// ];

app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true
}));
// app.use(cors({
//     origin: function (origin, callback) {
//         if (!origin) return callback(null, true); // allow non-browser requests like Postman

//         if (allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     methods: ['GET', 'POST', 'DELETE', 'PUT'],
//     credentials: true
// }));

app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/communes', communeRoutes);
app.use('/api/villages', villageRoutes);
app.use('/api/education-level', educationLevelRoutes);
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
);
