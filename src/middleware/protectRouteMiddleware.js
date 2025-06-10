const Role = require('../models/Role');

const normalizeRoute = (route) => {
    return route.replace(/\/+$/, '').toLowerCase();
};

const protectRoute = (requiredAction) => {
    return async (req, res, next) => {
        try {
            console.log(requiredAction);

            const userRoleId = req.user?.role;

            if (!userRoleId) {
                return res.status(401).json({ message: 'No role assigned to user' });
            }

            const role = await Role.findById(userRoleId).populate('permissions.permissionId');

            if (!role) {
                return res.status(403).json({ message: 'Role not found' });
            }

            const currentRoute = normalizeRoute(req.originalUrl.split('?')[0]);
            console.log('🔍 Current Route:', currentRoute);

            const permissionForRoute = role.permissions.find(p => {
                if (!p.permissionId || !p.permissionId.route) return false;
                const permissionRoute = normalizeRoute(p.permissionId.route);
                console.log('🔐 Checking Permission Route:', permissionRoute);
                return currentRoute.startsWith(permissionRoute);
            });

            if (!permissionForRoute) {
                return res.status(403).json({ message: 'No permission for this route' });
            }

            if (!permissionForRoute.actions.includes(requiredAction)) {
                return res.status(403).json({ message: `Action '${requiredAction}' not allowed` });
            }

            next();
        } catch (error) {
            console.error('❌ Error in protectRoute:', error);
            res.status(500).json({ message: 'Server error' });
        }
    };
};

module.exports = protectRoute;
