const mongoose = require('mongoose');
require('dotenv').config();

const Department = require('../models/Department');
const Position = require('../models/Position');
const Employee = require('../models/Employee');
const User = require('../models/User');
const City = require('../models/City');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdb';

async function seed() {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Employee.deleteMany({});
        await Position.deleteMany({});
        await Department.deleteMany({});
        console.log('✅ Cleared Employee, Position, Department collections');

        // Get sample user and cities
        const users = await User.find().limit(2);
        const cities = await City.find().limit(5);

        // 1️⃣ Create Departments
        const departmentsData = [];
        for (let i = 1; i <= 5; i++) {
            departmentsData.push({
                title_en: `Department EN ${i}`,
                title_kh: `Department KH ${i}`,
                description: `Description for department ${i}`,
                createdBy: users.length > 0 ? users[0]._id : null,
                updatedBy: users.length > 0 ? users[0]._id : null,
            });
        }
        const departments = await Department.insertMany(departmentsData);
        console.log(`✅ Inserted ${departments.length} departments`);

        // 2️⃣ Create Positions (2 per department)
        const positionsData = [];
        departments.forEach((dept, idx) => {
            for (let j = 1; j <= 2; j++) {
                positionsData.push({
                    title_en: `Position EN ${idx * 2 + j}`,
                    title_kh: `Position KH ${idx * 2 + j}`,
                    description: `Description for position ${idx * 2 + j}`,
                    department: dept._id,
                    createdBy: users.length > 0 ? users[0]._id : null,
                    updatedBy: users.length > 0 ? users[0]._id : null,
                });
            }
        });
        const positions = await Position.insertMany(positionsData);
        console.log(`✅ Inserted ${positions.length} positions`);

        // 3️⃣ Create Employees
        const genders = ['Male', 'Female'];
        const maritalStatuses = ['Single', 'Married', 'Divorced'];
        const employeesData = [];

        for (let i = 1; i <= 20; i++) {
            const gender = genders[Math.floor(Math.random() * genders.length)];
            const maritalStatus = maritalStatuses[Math.floor(Math.random() * maritalStatuses.length)];
            const position = positions[i % positions.length];
            const city = cities.length > 0 ? cities[i % cities.length]._id : null;

            employeesData.push({
                employee_id: `EMP${1000 + i}`,
                first_name_kh: `គង់`,
                first_name_en: `Vannak`,
                last_name_kh: `វណ្ណៈ`,
                last_name_en: `Kong`,
                name_kh: `គង់ វណ្ណ៖`,
                name_en: `FirstEN LastEN`,
                gender,
                email: `employee@example.com`,
                phone: `01234567${i.toString().padStart(2, '0')}`,
                bloodType: ['A', 'B', 'AB', 'O'][Math.floor(Math.random() * 4)],
                id_card_no: `ID${100000 + i}`,
                passport_no: `P${100000 + i}`,
                image_url: null, // No file for now
                joinDate: new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                date_of_birth: new Date(1990 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                place_of_birth: 'Phnom Penh',
                nationality: 'Cambodian',
                maritalStatus,
                positionId: position._id,
                city,
                district: `District`,
                commune: `Commune `,
                village: `Village`,
                present_city: city,
                present_district: `Present District`,
                present_commune: `Present Commune`,
                present_village: `Present Village`,
                family_member: [
                    { name: `Family${i}`, phone: `0987654${i}`, position: 'Parent', relationship: 'Father' }
                ],
                emergency_contact: [
                    { name: `Emergency${i}`, phone: `0976543${i}`, position: 'Friend', relationship: 'Friend' }
                ],
                post: Math.random() > 0.7,
                suspend: [],
                status: 'Active',
                isActive: true,
                subBonus: [],
                createdBy: users.length > 0 ? users[0]._id : null,
                updatedBy: users.length > 0 ? users[1 % users.length]._id : null,
            });
        }

        const employees = await Employee.insertMany(employeesData);
        console.log(`✅ Inserted ${employees.length} employees`);

    } catch (err) {
        console.error('❌ Error seeding data:', err);
    } finally {
        await mongoose.disconnect();
        console.log('✅ MongoDB disconnected. Seeding complete!');
    }
}

seed();
