const Role = require('../models/Role');

// Create a new role
exports.createRole = async (req, res) => {
    try {
        const { name, role, permissions } = req.body;

        // Basic validation
        if (!name || !Array.isArray(permissions)) {
            return res.status(400).json({ message: 'Name and permissions are required.' });
        }


        const newRole = new Role({
            name,
            role,
            permissions: permissions.map(p => ({
                permissionId: p.permissionId,
                actions: p.actions,
                isActive: p.isActive ?? true,
            })),
            createdBy: req.user.id
        });

        const savedRole = await newRole.save();
        // res.status(201).json({ message: 'Role created successfully' });
        res.status(201).json({ message: 'Role created successfully', data: savedRole });
    } catch (error) {
        console.error('Error creating role:', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Role name must be unique' });
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

exports.getRolesName = async (req, res) => {
    try {
        const { action } = req.params;

        const filter = action ? { name: action } : {};

        const roles = await Role.find(filter).populate('permissions.permissionId');

        res.json(roles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// county

exports.countRoleCount = async (req, res) => {
    const { name } = req.params;

    try {
        const count = await Role.countDocuments({ name });
        res.json({ name, count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Get single role
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
        const { name, role, permissions } = req.body;
        const { id } = req.params; // Role ID from URL

        const updatedRole = await Role.findByIdAndUpdate(
            id,
            {
                name,
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

exports.checkName = async (req, res) => {
    const { name } = req.params;
    try {
        const role = await Role.findOne({ name });
        if (role) {
            return res.json({ exists: true });
        } else {
            return res.json({ exists: false });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
