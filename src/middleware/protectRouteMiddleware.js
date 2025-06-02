const Role = require('../models/Role');
const Permission = require('../models/Permission');

const normalizeRoute = (route) => {
    return route.replace(/\/+$/, '').toLowerCase();
};

const protectRoute = (requiredAction) => {
    return async (req, res, next) => {
        try {
            const userRoleId = req.user?.role;

            if (!userRoleId) {
                return res.status(401).json({ message: 'No role assigned to user' });
            }
            const role = await Role.findById(userRoleId).populate('permissions.permissionId');

            if (!role) {
                return res.status(403).json({ message: 'Role not found' });
            }
            const currentRoute = normalizeRoute(req.baseUrl + req.path);
            console.log('🔍 Current Route:', currentRoute);

            // Check each permission route
            const permissionForRoute = role.permissions.find(p => {
                const permissionRoute = normalizeRoute(p.permissionId.route);
                console.log('🔐 Checking Permission Route:', permissionRoute);
                return currentRoute.startsWith(permissionRoute); // Use partial match
            });

            if (!permissionForRoute) {
                return res.status(403).json({ message: 'No permission for this route' });
            }

            // Check if action is allowed
            if (!permissionForRoute.actions.includes(requiredAction)) {
                return res.status(403).json({ message: `Action '${requiredAction}' not allowed` });
            }

            // All good — go to next middleware
            next();
        } catch (error) {
            console.error('❌ Error in protectRoute:', error);
            res.status(500).json({ message: 'Server error' });
        }
    };
};

module.exports = protectRoute;
