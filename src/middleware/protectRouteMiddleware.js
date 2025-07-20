const Role = require('../models/Role');

const normalizeRoute = (route) => {
    return route.replace(/\/+$/, '').toLowerCase();
};

const protectRoute = (requiredAction) => {
    return async (req, res, next) => {
        try {
            const userRoleId = req.user?.role;

            if (!userRoleId) {
                return res.status(401).json({ message: 'Unauthorized: No role assigned to user.' });
            }

            const role = await Role.findById(userRoleId).populate('permissions.permissionId');

            if (!role) {
                return res.status(403).json({ message: 'Forbidden: Role not found.' });
            }

            const currentRoute = normalizeRoute(req.baseUrl + req.route.path);

            const hasPermission = role.permissions.some(p => {
                if (!p.isActive || !p.permissionId || !p.permissionId.route) return false;

                const permissionRoute = normalizeRoute(p.permissionId.route);
                const matchesRoute = currentRoute.startsWith(permissionRoute);
                const hasAction = p.actions.includes(requiredAction);

                return matchesRoute && hasAction;
            });

            if (!hasPermission) {
                return res.status(403).json({ message: `Forbidden: You do not have '${requiredAction}' permission on this route.` });
            }

            next();
        } catch (error) {
            // Detailed error logging to console
            console.error('❌ Error in protectRoute middleware:', {
                message: error.message,
                stack: error.stack,
                userId: req.user?._id,
                userRoleId: req.user?.role,
                routeAttempted: req.originalUrl,
                requiredAction,
                timestamp: new Date().toISOString()
            });

            res.status(500).json({ message: 'Internal Server Error' });
        }
    };
};

module.exports = protectRoute;
