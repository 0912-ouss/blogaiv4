const express = require('express');
const router = express.Router();

module.exports = (supabase, middleware) => {
    const verifyToken = middleware.verifyToken;

    // ============================================
    // EXPORT ARTICLES TO CSV
    // ============================================
    router.get('/export/csv', verifyToken, async (req, res) => {
        try {
            const { status, category_id, startDate, endDate } = req.query;

            let query = supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10000);

            if (status) query = query.eq('status', status);
            if (category_id) query = query.eq('category_id', category_id);
            if (startDate) query = query.gte('created_at', startDate);
            if (endDate) query = query.lte('created_at', endDate);

            const { data: articles, error } = await query;

            if (error) throw error;

            // Convert to CSV
            const headers = ['ID', 'Title', 'Slug', 'Status', 'Published At', 'Views', 'Category', 'Author', 'Created At'];
            const rows = articles?.map(article => [
                article.id,
                `"${(article.title || '').replace(/"/g, '""')}"`,
                article.slug || '',
                article.status || '',
                article.published_at || '',
                article.view_count || 0,
                article.category_id || '',
                article.author_id || '',
                article.created_at || ''
            ]) || [];

            const csv = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=articles-export-${new Date().toISOString().split('T')[0]}.csv`);
            return res.send(csv);
        } catch (error) {
            console.error('Error exporting articles to CSV:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to export articles'
            });
        }
    });

    // ============================================
    // EXPORT ARTICLES TO JSON
    // ============================================
    router.get('/export/json', verifyToken, async (req, res) => {
        try {
            const { status, category_id, startDate, endDate } = req.query;

            let query = supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10000);

            if (status) query = query.eq('status', status);
            if (category_id) query = query.eq('category_id', category_id);
            if (startDate) query = query.gte('created_at', startDate);
            if (endDate) query = query.lte('created_at', endDate);

            const { data: articles, error } = await query;

            if (error) throw error;

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=articles-export-${new Date().toISOString().split('T')[0]}.json`);
            return res.json({
                success: true,
                data: articles || [],
                exportedAt: new Date().toISOString(),
                count: articles?.length || 0
            });
        } catch (error) {
            console.error('Error exporting articles to JSON:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to export articles'
            });
        }
    });

    // ============================================
    // IMPORT ARTICLES FROM CSV
    // ============================================
    router.post('/import/csv', verifyToken, async (req, res) => {
        try {
            const { csvData } = req.body;

            if (!csvData) {
                return res.status(400).json({
                    success: false,
                    error: 'CSV data is required'
                });
            }

            // Parse CSV (simple parser - you might want to use a library like papaparse)
            const lines = csvData.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const articles = [];

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                const article = {};

                headers.forEach((header, index) => {
                    const value = values[index];
                    if (header === 'ID') return; // Skip ID
                    if (header === 'Published At' || header === 'Created At') {
                        article[header.toLowerCase().replace(' ', '_')] = value || null;
                    } else if (header === 'Views') {
                        article['view_count'] = parseInt(value) || 0;
                    } else {
                        article[header.toLowerCase().replace(' ', '_')] = value || null;
                    }
                });

                // Set default values
                article.status = article.status || 'draft';
                article.created_at = article.created_at || new Date().toISOString();
                article.updated_at = new Date().toISOString();

                articles.push(article);
            }

            // Insert articles
            const { data, error } = await supabase
                .from('articles')
                .insert(articles)
                .select();

            if (error) throw error;

            return res.json({
                success: true,
                data: data,
                message: `Successfully imported ${data.length} article(s)`
            });
        } catch (error) {
            console.error('Error importing articles from CSV:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to import articles: ' + error.message
            });
        }
    });

    // ============================================
    // IMPORT ARTICLES FROM JSON
    // ============================================
    router.post('/import/json', verifyToken, async (req, res) => {
        try {
            const { articles } = req.body;

            if (!articles || !Array.isArray(articles)) {
                return res.status(400).json({
                    success: false,
                    error: 'Articles array is required'
                });
            }

            // Prepare articles for import
            const articlesToImport = articles.map(article => ({
                ...article,
                id: undefined, // Remove ID to let database generate
                created_at: article.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
                status: article.status || 'draft'
            }));

            // Insert articles
            const { data, error } = await supabase
                .from('articles')
                .insert(articlesToImport)
                .select();

            if (error) throw error;

            return res.json({
                success: true,
                data: data,
                message: `Successfully imported ${data.length} article(s)`
            });
        } catch (error) {
            console.error('Error importing articles from JSON:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to import articles: ' + error.message
            });
        }
    });

    return router;
};

