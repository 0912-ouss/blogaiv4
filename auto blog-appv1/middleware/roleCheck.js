// ============================================
// ROLE-BASED ACCESS CONTROL MIDDLEWARE
// ============================================

/**
 * Role permissions matrix
 */
const rolePermissions = {
    editor: [
        'articles:create',
        'articles:edit',
        'articles:view',
        'articles:delete:own', // Can only delete own articles
        'categories:view',
        'comments:view',
        'comments:approve',
        'comments:delete',
        'analytics:view'
    ],
    admin: [
        'articles:*', // All article operations
        'categories:*', // All category operations
        'comments:*', // All comment operations
        'users:view',
        'users:edit',
        'analytics:*',
        'settings:view',
        'settings:edit'
    ],
    super_admin: [
        '*' // All permissions
    ]
};

/**
 * Check if user has permission
 * @param {string} userRole - User's role
 * @param {string} permission - Required permission
 * @returns {boolean} - True if user has permission
 */
function hasPermission(userRole, permission) {
    if (!userRole || !permission) {
        return false;
    }

    const userPerms = rolePermissions[userRole] || [];
    
    // Super admin has all permissions
    if (userPerms.includes('*')) {
        return true;
    }

    // Check exact permission
    if (userPerms.includes(permission)) {
        return true;
    }

    // Check wildcard permissions (e.g., 'articles:*' matches 'articles:create')
    const [resource] = permission.split(':');
    if (userPerms.includes(`${resource}:*`)) {
        return true;
    }

    return false;
}

/**
 * Middleware to check if user has required role(s)
 * @param {string|string[]} roles - Required role(s)
 * @returns {function} - Express middleware
 */
function checkRole(roles) {
    return (req, res, next) => {
        if (!req.adminUser) {
            return res.status(401).json({ 
                success: false, 
                error: 'Authentication required' 
            });
        }

        const userRole = req.adminUser.role;
        const requiredRoles = Array.isArray(roles) ? roles : [roles];

        if (!requiredRoles.includes(userRole)) {
            return res.status(403).json({ 
                success: false, 
                error: 'Insufficient permissions. Required role: ' + requiredRoles.join(' or ') 
            });
        }

        next();
    };
}

/**
 * Middleware to check if user has required permission
 * @param {string} permission - Required permission
 * @returns {function} - Express middleware
 */
function checkPermission(permission) {
    return (req, res, next) => {
        if (!req.adminUser) {
            return res.status(401).json({ 
                success: false, 
                error: 'Authentication required' 
            });
        }

        const userRole = req.adminUser.role;

        if (!hasPermission(userRole, permission)) {
            return res.status(403).json({ 
                success: false, 
                error: 'Insufficient permissions. Required: ' + permission 
            });
        }

        next();
    };
}

/**
 * Middleware to check if user owns the resource (for editor role)
 * @param {function} getResourceOwnerId - Function to get resource owner ID
 * @returns {function} - Express middleware
 */
function checkOwnership(getResourceOwnerId) {
    return async (req, res, next) => {
        if (!req.adminUser) {
            return res.status(401).json({ 
                success: false, 
                error: 'Authentication required' 
            });
        }

        const userRole = req.adminUser.role;
        const userId = req.adminUser.id;

        // Admins and super admins bypass ownership check
        if (userRole === 'admin' || userRole === 'super_admin') {
            return next();
        }

        // Editors must own the resource
        try {
            const ownerId = await getResourceOwnerId(req);
            if (ownerId !== userId) {
                return res.status(403).json({ 
                    success: false, 
                    error: 'You can only modify your own resources' 
                });
            }
        } catch (error) {
            return res.status(500).json({ 
                success: false, 
                error: 'Error checking resource ownership' 
            });
        }

        next();
    };
}

module.exports = {
    checkRole,
    checkPermission,
    checkOwnership,
    hasPermission,
    rolePermissions
};

