const express = require('express');
const router = express.Router();

module.exports = (supabase, middleware) => {
    const verifyToken = middleware.verifyToken;

    // ============================================
    // GET ACTIVITY LOGS
    // ============================================
    router.get('/', verifyToken, async (req, res) => {
        try {
            const {
                page = 1,
                limit = 50,
                userId,
                action,
                entityType,
                startDate,
                endDate,
                search
            } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);

            // Build query
            let query = supabase
                .from('activity_logs')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(offset, offset + parseInt(limit) - 1);

            // Apply filters
            if (userId) {
                query = query.eq('user_id', userId);
            }
            if (action) {
                query = query.eq('action', action);
            }
            if (entityType) {
                query = query.eq('entity_type', entityType);
            }
            if (startDate) {
                query = query.gte('created_at', startDate);
            }
            if (endDate) {
                query = query.lte('created_at', endDate);
            }
            if (search) {
                query = query.or(`user_email.ilike.%${search}%,entity_title.ilike.%${search}%,action.ilike.%${search}%`);
            }

            const { data, error, count } = await query;

            if (error) {
                console.error('Error fetching activity logs:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch activity logs'
                });
            }

            return res.json({
                success: true,
                data: data || [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / parseInt(limit))
                }
            });
        } catch (error) {
            console.error('Error in activity logs endpoint:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    // ============================================
    // GET ACTIVITY LOG STATISTICS
    // ============================================
    router.get('/stats', verifyToken, async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            let query = supabase
                .from('activity_logs')
                .select('action, entity_type, created_at');

            if (startDate) {
                query = query.gte('created_at', startDate);
            }
            if (endDate) {
                query = query.lte('created_at', endDate);
            }

            const { data, error } = await query;

            if (error) {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch statistics'
                });
            }

            // Calculate statistics
            const stats = {
                total: data?.length || 0,
                byAction: {},
                byEntityType: {},
                byUser: {},
                recentActivity: data?.slice(0, 10) || []
            };

            data?.forEach(log => {
                // Count by action
                stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
                
                // Count by entity type
                if (log.entity_type) {
                    stats.byEntityType[log.entity_type] = (stats.byEntityType[log.entity_type] || 0) + 1;
                }
                
                // Count by user
                if (log.user_email) {
                    stats.byUser[log.user_email] = (stats.byUser[log.user_email] || 0) + 1;
                }
            });

            return res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error in activity stats endpoint:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    // ============================================
    // EXPORT ACTIVITY LOGS
    // ============================================
    router.get('/export', verifyToken, async (req, res) => {
        try {
            const { format = 'json', userId, action, entityType, startDate, endDate } = req.query;

            let query = supabase
                .from('activity_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10000); // Max export limit

            // Apply filters
            if (userId) query = query.eq('user_id', userId);
            if (action) query = query.eq('action', action);
            if (entityType) query = query.eq('entity_type', entityType);
            if (startDate) query = query.gte('created_at', startDate);
            if (endDate) query = query.lte('created_at', endDate);

            const { data, error } = await query;

            if (error) {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to export activity logs'
                });
            }

            if (format === 'csv') {
                // Convert to CSV
                const headers = ['ID', 'User Email', 'Action', 'Entity Type', 'Entity ID', 'Entity Title', 'Created At'];
                const rows = data?.map(log => [
                    log.id,
                    log.user_email || '',
                    log.action,
                    log.entity_type || '',
                    log.entity_id || '',
                    log.entity_title || '',
                    new Date(log.created_at).toISOString()
                ]) || [];

                const csv = [
                    headers.join(','),
                    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
                ].join('\n');

                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=activity-logs.csv');
                return res.send(csv);
            } else {
                // JSON format
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=activity-logs.json');
                return res.json({
                    success: true,
                    data: data || [],
                    exportedAt: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error exporting activity logs:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    return router;
};

