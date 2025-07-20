const Role = require('../models/Role');

// Utility function to normalize route strings
const normalizeRoute = (route) => {
    return route.replace(/\/+$/, '').toLowerCase();
};

/**
 * Middleware to protect a route based on role permissions.
 * @param {string} requiredRoute - The route to check (e.g., '/api/employees')
 * @param {string} requiredAction - The action to check (e.g., 'read', 'update')
 */
const protectByRoute = (requiredRoute, requiredAction) => {
    return async (req, res, next) => {
        try {
            const userRoleId = req.user?.role; // assuming role is an ObjectId

            if (!userRoleId) {
                return res.status(401).json({ message: 'No role assigned to user' });
            }

            // Find the role and populate permissionId
            const role = await Role.findById(userRoleId).populate('permissions.permissionId');

            if (!role) {
                return res.status(403).json({ message: 'Role not found' });
            }

            // Normalize the route to check
            const routeToCheck = normalizeRoute(requiredRoute || req.originalUrl.split('?')[0]);

            // Find a matching permission
            const permission = role.permissions.find(p => {
                if (!p.isActive || !p.permissionId?.route) return false;

                const permissionRoute = normalizeRoute(p.permissionId.route);
                return routeToCheck.startsWith(permissionRoute);
            });

            if (!permission) {
                return res.status(403).json({ message: 'No permission for this route' });
            }

            if (!permission.actions.includes(requiredAction)) {
                return res.status(403).json({ message: `Action '${requiredAction}' not allowed` });
            }

            // ✅ Permission granted
            next();
        } catch (error) {
            console.error('❌ Error in protectByRoute:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
};

module.exports = protectByRoute;
