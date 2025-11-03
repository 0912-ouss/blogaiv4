const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

let verifyToken, logActivity;

module.exports = (supabase, middleware) => {
    verifyToken = middleware.verifyToken;
    logActivity = middleware.logActivity;

    // Get all admin users
    router.get('/', verifyToken, async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('admin_users')
                .select('id, email, name, role, avatar_url, is_active, last_login, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;
            res.json({ success: true, data });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Create new admin user
    router.post('/', verifyToken, async (req, res) => {
        try {
            const { email, password, name, role = 'admin' } = req.body;

            if (!email || !password || !name) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Email, password, and name are required' 
                });
            }

            // Hash password
            const password_hash = await bcrypt.hash(password, 10);

            const { data, error } = await supabase
                .from('admin_users')
                .insert([{ email: email.toLowerCase(), password_hash, name, role }])
                .select('id, email, name, role, is_active, created_at')
                .single();

            if (error) throw error;

            await logActivity(supabase, req.adminUser.id, req.adminUser.email, 'create', 'user', data.id, name);

            res.json({ success: true, data, message: 'User created successfully' });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Update admin user
    router.put('/:id', verifyToken, async (req, res) => {
        try {
            const { name, role, is_active, email } = req.body;
            const updateData = {};
            
            if (name) updateData.name = name;
            if (role) updateData.role = role;
            if (typeof is_active === 'boolean') updateData.is_active = is_active;
            if (email) updateData.email = email.toLowerCase();

            const { data, error } = await supabase
                .from('admin_users')
                .update(updateData)
                .eq('id', req.params.id)
                .select('id, email, name, role, is_active')
                .single();

            if (error) throw error;

            await logActivity(supabase, req.adminUser.id, req.adminUser.email, 'update', 'user', data.id, data.name);

            res.json({ success: true, data, message: 'User updated successfully' });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Delete admin user
    router.delete('/:id', verifyToken, async (req, res) => {
        try {
            // Prevent self-deletion
            if (parseInt(req.params.id) === req.adminUser.id) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Cannot delete your own account' 
                });
            }

            const { data } = await supabase
                .from('admin_users')
                .select('name')
                .eq('id', req.params.id)
                .single();

            const { error } = await supabase
                .from('admin_users')
                .delete()
                .eq('id', req.params.id);

            if (error) throw error;

            await logActivity(supabase, req.adminUser.id, req.adminUser.email, 'delete', 'user', req.params.id, data?.name);

            res.json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Get all authors (for blog articles)
    router.get('/authors', verifyToken, async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('authors')
                .select('*')
                .order('name');

            if (error) throw error;
            res.json({ success: true, data });
        } catch (error) {
            console.error('Error fetching authors:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Create author
    router.post('/authors', verifyToken, async (req, res) => {
        try {
            const { name, slug, bio, avatar_url, email, facebook_url, twitter_url, instagram_url } = req.body;

            const { data, error } = await supabase
                .from('authors')
                .insert([{ name, slug, bio, avatar_url, email, facebook_url, twitter_url, instagram_url }])
                .select()
                .single();

            if (error) throw error;

            await logActivity(supabase, req.adminUser.id, req.adminUser.email, 'create', 'author', data.id, name);

            res.json({ success: true, data, message: 'Author created successfully' });
        } catch (error) {
            console.error('Error creating author:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Update author
    router.put('/authors/:id', verifyToken, async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('authors')
                .update(req.body)
                .eq('id', req.params.id)
                .select()
                .single();

            if (error) throw error;

            await logActivity(supabase, req.adminUser.id, req.adminUser.email, 'update', 'author', data.id, data.name);

            res.json({ success: true, data, message: 'Author updated successfully' });
        } catch (error) {
            console.error('Error updating author:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Delete author
    router.delete('/authors/:id', verifyToken, async (req, res) => {
        try {
            const { data } = await supabase
                .from('authors')
                .select('name')
                .eq('id', req.params.id)
                .single();

            const { error } = await supabase
                .from('authors')
                .delete()
                .eq('id', req.params.id);

            if (error) throw error;

            await logActivity(supabase, req.adminUser.id, req.adminUser.email, 'delete', 'author', req.params.id, data?.name);

            res.json({ success: true, message: 'Author deleted successfully' });
        } catch (error) {
            console.error('Error deleting author:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return router;
};

