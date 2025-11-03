const express = require('express');
const router = express.Router();

let verifyToken, logActivity;

module.exports = (supabase, middleware) => {
    verifyToken = middleware.verifyToken;
    logActivity = middleware.logActivity;

    // Get all settings
    router.get('/', verifyToken, async (req, res) => {
        try {
            const { category } = req.query;

            let query = supabase
                .from('site_settings')
                .select('*')
                .order('category')
                .order('setting_key');

            if (category) {
                query = query.eq('category', category);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Group by category
            const grouped = data.reduce((acc, setting) => {
                if (!acc[setting.category]) {
                    acc[setting.category] = [];
                }
                acc[setting.category].push(setting);
                return acc;
            }, {});

            res.json({ success: true, data: grouped });
        } catch (error) {
            console.error('Error fetching settings:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Get single setting by key
    router.get('/:key', verifyToken, async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .eq('setting_key', req.params.key)
                .single();

            if (error) throw error;

            res.json({ success: true, data });
        } catch (error) {
            console.error('Error fetching setting:', error);
            res.status(404).json({ success: false, error: 'Setting not found' });
        }
    });

    // Update or create setting
    router.put('/:key', verifyToken, async (req, res) => {
        try {
            const { setting_value, setting_type, category, description, is_public } = req.body;

            // Check if setting exists
            const { data: existing } = await supabase
                .from('site_settings')
                .select('id')
                .eq('setting_key', req.params.key)
                .single();

            let data, error;

            if (existing) {
                // Update existing
                ({ data, error } = await supabase
                    .from('site_settings')
                    .update({
                        setting_value,
                        setting_type,
                        category,
                        description,
                        is_public,
                        updated_by: req.adminUser.id
                    })
                    .eq('setting_key', req.params.key)
                    .select()
                    .single());
            } else {
                // Create new
                ({ data, error } = await supabase
                    .from('site_settings')
                    .insert([{
                        setting_key: req.params.key,
                        setting_value,
                        setting_type,
                        category,
                        description,
                        is_public,
                        updated_by: req.adminUser.id
                    }])
                    .select()
                    .single());
            }

            if (error) throw error;

            await logActivity(supabase, req.adminUser.id, req.adminUser.email, 'update', 'setting', data.id, req.params.key);

            res.json({ success: true, data, message: 'Setting saved successfully' });
        } catch (error) {
            console.error('Error saving setting:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Bulk update settings
    router.post('/bulk-update', verifyToken, async (req, res) => {
        try {
            const { settings } = req.body;

            if (!settings || typeof settings !== 'object') {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Invalid settings data' 
                });
            }

            const updates = [];
            for (const [key, value] of Object.entries(settings)) {
                updates.push(
                    supabase
                        .from('site_settings')
                        .update({ 
                            setting_value: value,
                            updated_by: req.adminUser.id 
                        })
                        .eq('setting_key', key)
                );
            }

            await Promise.all(updates);

            await logActivity(supabase, req.adminUser.id, req.adminUser.email, 'bulk_update', 'setting', null, `${Object.keys(settings).length} settings`);

            res.json({ success: true, message: 'Settings updated successfully' });
        } catch (error) {
            console.error('Error updating settings:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Delete setting
    router.delete('/:key', verifyToken, async (req, res) => {
        try {
            const { error } = await supabase
                .from('site_settings')
                .delete()
                .eq('setting_key', req.params.key);

            if (error) throw error;

            await logActivity(supabase, req.adminUser.id, req.adminUser.email, 'delete', 'setting', null, req.params.key);

            res.json({ success: true, message: 'Setting deleted successfully' });
        } catch (error) {
            console.error('Error deleting setting:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return router;
};

