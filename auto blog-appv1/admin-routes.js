const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Import rate limiters
const { loginLimiter, apiLimiter, aiGenerationLimiter } = require('./middleware/rateLimiter');

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d';

// ============================================
// MIDDLEWARE: Verify JWT Token
// ============================================
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.adminUser = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
};

// Import enhanced role checking
const { checkRole, checkPermission } = require('./middleware/roleCheck');

// ============================================
// HELPER: Log Activity
// ============================================
const logActivity = async (supabase, userId, userEmail, action, entityType, entityId, entityTitle, details = {}) => {
    try {
        await supabase.rpc('log_admin_activity', {
            p_user_id: userId,
            p_user_email: userEmail,
            p_action: action,
            p_entity_type: entityType,
            p_entity_id: entityId,
            p_entity_title: entityTitle,
            p_details: details,
            p_ip_address: null,
            p_user_agent: null
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

module.exports = (supabase) => {
    // ============================================
    // AUTHENTICATION ENDPOINTS
    // ============================================

    // Login (with rate limiting)
    router.post('/auth/login', loginLimiter, async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Email and password are required' 
                });
            }

            // Find admin user
            const { data: user, error } = await supabase
                .from('admin_users')
                .select('*')
                .eq('email', email.toLowerCase())
                .eq('is_active', true)
                .single();

            if (error || !user) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Invalid email or password' 
                });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Invalid email or password' 
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email, 
                    name: user.name,
                    role: user.role 
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            // Update last login
            await supabase
                .from('admin_users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', user.id);

            // Log activity
            await logActivity(supabase, user.id, user.email, 'login', 'admin', user.id, user.name);

            // Return success with token and user info
            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar_url: user.avatar_url
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ success: false, error: 'Login failed' });
        }
    });

    // Verify Token
    router.get('/auth/verify', verifyToken, async (req, res) => {
        try {
            // Get fresh user data
            const { data: user, error } = await supabase
                .from('admin_users')
                .select('id, email, name, role, avatar_url, is_active')
                .eq('id', req.adminUser.id)
                .eq('is_active', true)
                .single();

            if (error || !user) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'User not found or inactive' 
                });
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Verify token error:', error);
            res.status(500).json({ success: false, error: 'Verification failed' });
        }
    });

    // Logout
    router.post('/auth/logout', verifyToken, async (req, res) => {
        try {
            // Log activity
            await logActivity(
                supabase, 
                req.adminUser.id, 
                req.adminUser.email, 
                'logout', 
                'admin', 
                req.adminUser.id, 
                req.adminUser.name
            );

            res.json({ success: true, message: 'Logged out successfully' });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ success: false, error: 'Logout failed' });
        }
    });

    // Change Password
    router.post('/auth/change-password', verifyToken, async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Current password and new password are required' 
                });
            }

            // Get user with password hash
            const { data: user, error } = await supabase
                .from('admin_users')
                .select('password_hash')
                .eq('id', req.adminUser.id)
                .single();

            if (error || !user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Current password is incorrect' 
                });
            }

            // Hash new password
            const newPasswordHash = await bcrypt.hash(newPassword, 10);

            // Update password
            await supabase
                .from('admin_users')
                .update({ password_hash: newPasswordHash })
                .eq('id', req.adminUser.id);

            // Log activity
            await logActivity(
                supabase, 
                req.adminUser.id, 
                req.adminUser.email, 
                'change_password', 
                'admin', 
                req.adminUser.id, 
                req.adminUser.name
            );

            res.json({ success: true, message: 'Password changed successfully' });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ success: false, error: 'Failed to change password' });
        }
    });

    return router;
};

