const express = require('express');
const router = express.Router();

let verifyToken, logActivity;

module.exports = (supabase, middleware) => {
    verifyToken = middleware.verifyToken;
    logActivity = middleware.logActivity;

    // Get all categories
    router.get('/', verifyToken, async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;
            res.json({ success: true, data });
        } catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Create category
    router.post('/', verifyToken, async (req, res) => {
        try {
            const { name, slug, description, icon, color } = req.body;

            const { data, error } = await supabase
                .from('categories')
                .insert([{ name, slug, description, icon, color }])
                .select()
                .single();

            if (error) throw error;

            await logActivity(supabase, req.adminUser.id, req.adminUser.email, 'create', 'category', data.id, name);

            res.json({ success: true, data, message: 'Category created successfully' });
        } catch (error) {
            console.error('Error creating category:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Update category
    router.put('/:id', verifyToken, async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .update(req.body)
                .eq('id', req.params.id)
                .select()
                .single();

            if (error) throw error;

            await logActivity(supabase, req.adminUser.id, req.adminUser.email, 'update', 'category', data.id, data.name);

            res.json({ success: true, data, message: 'Category updated successfully' });
        } catch (error) {
            console.error('Error updating category:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Delete category
    router.delete('/:id', verifyToken, async (req, res) => {
        try {
            const { data } = await supabase
                .from('categories')
                .select('name')
                .eq('id', req.params.id)
                .single();

            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', req.params.id);

            if (error) throw error;

            await logActivity(supabase, req.adminUser.id, req.adminUser.email, 'delete', 'category', req.params.id, data?.name);

            res.json({ success: true, message: 'Category deleted successfully' });
        } catch (error) {
            console.error('Error deleting category:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Get all tags
    router.get('/tags', verifyToken, async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('tags')
                .select('*')
                .order('name');

            if (error) throw error;
            res.json({ success: true, data });
        } catch (error) {
            console.error('Error fetching tags:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Create tag
    router.post('/tags', verifyToken, async (req, res) => {
        try {
            const { name, slug } = req.body;

            const { data, error } = await supabase
                .from('tags')
                .insert([{ name, slug }])
                .select()
                .single();

            if (error) throw error;

            await logActivity(supabase, req.adminUser.id, req.adminUser.email, 'create', 'tag', data.id, name);

            res.json({ success: true, data, message: 'Tag created successfully' });
        } catch (error) {
            console.error('Error creating tag:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Update tag
    router.put('/tags/:id', verifyToken, async (req, res) => {
        try {
            const { id } = req.params;
            const { name, slug } = req.body;

            if (!name || !slug) {
                return res.status(400).json({ success: false, error: 'Name and slug are required' });
            }

            const { data, error } = await supabase
                .from('tags')
                .update({ name, slug })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logActivity(supabase, req.adminUser.id, req.adminUser.email, 'update', 'tag', data.id, name);

            res.json({ success: true, data, message: 'Tag updated successfully' });
        } catch (error) {
            console.error('Error updating tag:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Delete tag
    router.delete('/tags/:id', verifyToken, async (req, res) => {
        try {
            const { data } = await supabase
                .from('tags')
                .select('name')
                .eq('id', req.params.id)
                .single();

            const { error } = await supabase
                .from('tags')
                .delete()
                .eq('id', req.params.id);

            if (error) throw error;

            await logActivity(supabase, req.adminUser.id, req.adminUser.email, 'delete', 'tag', req.params.id, data?.name);

            res.json({ success: true, message: 'Tag deleted successfully' });
        } catch (error) {
            console.error('Error deleting tag:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return router;
};

