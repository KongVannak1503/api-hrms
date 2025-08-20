const Role = require('../models/Role');

// Create a new role
exports.createRole = async (req, res) => {
    try {
        const { role, permissions } = req.body;

        if (!role || !Array.isArray(permissions)) {
            return res.status(400).json({ message: 'Role and permissions are required.' });
        }

        const newRole = new Role({
            role, // dynamic role name
            permissions: permissions.map(p => ({
                permissionId: p.permissionId,
                actions: p.actions,
                isActive: p.isActive ?? true,
            })),
            createdBy: req.user.id
        });

        const savedRole = await newRole.save();
        res.status(201).json({ message: 'Role created successfully', data: savedRole });
    } catch (error) {
        console.error('Error creating role:', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Role must be unique' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all roles
exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.find().populate('permissions.permissionId');

        res.json(roles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get roles by role name (dynamic)
exports.getRolesByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const filter = role ? { role } : {};

        const roles = await Role.find(filter).populate('permissions.permissionId');
        res.json(roles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Count roles by role name
exports.countRoleCount = async (req, res) => {
    const { role } = req.params;
    try {
        const count = await Role.countDocuments({ role });
        res.json({ role, count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get single role by ID
exports.getRoleById = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id).populate('permissions.permissionId');
        if (!role) return res.status(404).json({ message: 'Role not found' });
        res.json(role);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update role
exports.updateRole = async (req, res) => {
    try {
        const { role, permissions } = req.body;
        const { id } = req.params;

        const updatedRole = await Role.findByIdAndUpdate(
            id,
            {
                role,
                permissions,
                updatedBy: req.user.id,
            },
            { new: true, runValidators: true }
        );

        if (!updatedRole) {
            return res.status(404).json({ message: 'Role not found' });
        }

        res.status(200).json({ message: 'Role updated successfully', data: updatedRole });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ message: 'Failed to update role', error });
    }
};

// Delete role
exports.deleteRole = async (req, res) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id);
        if (!role) return res.status(404).json({ message: 'Role not found' });
        res.json({ message: 'Role deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Check if role already exists
exports.checkRole = async (req, res) => {
    const { role } = req.params;
    try {
        const exists = await Role.findOne({ role });
        return res.json({ exists: !!exists });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
