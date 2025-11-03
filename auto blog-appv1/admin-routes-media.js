const express = require('express');
const multer = require('multer');
const router = express.Router();
const { 
    uploadImage, 
    deleteImage, 
    uploadImageFromURL, 
    uploadBase64Image,
    getImageURL,
    initializeBucket 
} = require('./utils/storage');

// Configure multer for file uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

let verifyToken, logActivity;

module.exports = (supabase, middleware) => {
    verifyToken = middleware.verifyToken;
    logActivity = middleware.logActivity;

    // Initialize bucket on startup
    initializeBucket().catch(err => {
        console.error('Failed to initialize storage bucket:', err);
    });

    // ============================================
    // UPLOAD IMAGE (Multipart Form Data)
    // ============================================
    router.post('/upload', verifyToken, upload.single('image'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No image file provided'
                });
            }

            const fileName = req.file.originalname || `image-${Date.now()}.jpg`;
            const options = {
                folder: req.body.folder || 'uploads',
                resize: req.body.resize !== 'false',
                maxWidth: parseInt(req.body.maxWidth) || 1920,
                maxHeight: parseInt(req.body.maxHeight) || 1080,
                quality: parseInt(req.body.quality) || 85,
                format: req.body.format || 'webp'
            };

            const result = await uploadImage(req.file.buffer, fileName, options);

            // Save to media_items table
            const { data: mediaItem, error: dbError } = await supabase
                .from('media_items')
                .insert([{
                    filename: result.fileName,
                    original_filename: req.file.originalname,
                    url: result.url,
                    file_type: 'image',
                    mime_type: req.file.mimetype,
                    file_size: req.file.size,
                    width: result.width || null,
                    height: result.height || null,
                    folder: options.folder || 'uploads',
                    uploaded_by: req.adminUser.id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            // Log activity
            await logActivity(
                supabase,
                req.adminUser.id,
                req.adminUser.email,
                'upload_image',
                'media',
                mediaItem?.id || null,
                fileName,
                { url: result.url, size: result.size }
            );

            res.json({
                success: true,
                data: {
                    ...result,
                    id: mediaItem?.id,
                    mediaItem: mediaItem
                }
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to upload image'
            });
        }
    });

    // ============================================
    // UPLOAD BASE64 IMAGE
    // ============================================
    router.post('/upload-base64', verifyToken, async (req, res) => {
        try {
            const { image, fileName, folder, resize, maxWidth, maxHeight, quality, format } = req.body;

            if (!image) {
                return res.status(400).json({
                    success: false,
                    error: 'No image data provided'
                });
            }

            const options = {
                folder: folder || 'uploads',
                resize: resize !== false,
                maxWidth: maxWidth || 1920,
                maxHeight: maxHeight || 1080,
                quality: quality || 85,
                format: format || 'webp'
            };

            const result = await uploadBase64Image(
                image,
                fileName || `image-${Date.now()}.jpg`,
                options
            );

            // Save to media_items table
            const { data: mediaItem, error: dbError } = await supabase
                .from('media_items')
                .insert([{
                    filename: result.fileName,
                    original_filename: fileName || `image-${Date.now()}.jpg`,
                    url: result.url,
                    file_type: 'image',
                    mime_type: image.split(';')[0].split(':')[1] || 'image/jpeg',
                    file_size: result.size || null,
                    width: result.width || null,
                    height: result.height || null,
                    folder: options.folder || 'uploads',
                    uploaded_by: req.adminUser.id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            // Log activity
            await logActivity(
                supabase,
                req.adminUser.id,
                req.adminUser.email,
                'upload_image',
                'media',
                mediaItem?.id || null,
                result.fileName,
                { url: result.url, size: result.size }
            );

            res.json({
                success: true,
                data: {
                    ...result,
                    id: mediaItem?.id,
                    mediaItem: mediaItem
                }
            });
        } catch (error) {
            console.error('Error uploading base64 image:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to upload image'
            });
        }
    });

    // ============================================
    // UPLOAD IMAGE FROM URL
    // ============================================
    router.post('/upload-from-url', verifyToken, async (req, res) => {
        try {
            const { url, fileName, folder, resize, maxWidth, maxHeight, quality, format } = req.body;

            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'Image URL is required'
                });
            }

            const options = {
                folder: folder || 'uploads',
                resize: resize !== false,
                maxWidth: maxWidth || 1920,
                maxHeight: maxHeight || 1080,
                quality: quality || 85,
                format: format || 'webp'
            };

            const result = await uploadImageFromURL(
                url,
                fileName || `image-${Date.now()}.jpg`,
                options
            );

            // Log activity
            await logActivity(
                supabase,
                req.adminUser.id,
                req.adminUser.email,
                'upload_image_from_url',
                'media',
                null,
                result.fileName,
                { url: result.url, size: result.size, sourceUrl: url }
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error uploading image from URL:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to upload image from URL'
            });
        }
    });

    // ============================================
    // DELETE IMAGE (Legacy - by path)
    // ============================================
    router.delete('/path/:path(*)', verifyToken, async (req, res) => {
        try {
            const filePath = req.params.path;

            if (!filePath) {
                return res.status(400).json({
                    success: false,
                    error: 'File path is required'
                });
            }

            const success = await deleteImage(filePath);

            if (!success) {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to delete image'
                });
            }

            // Also delete from database if exists
            await supabase
                .from('media_items')
                .delete()
                .eq('url', filePath)
                .or(`url.ilike.%${filePath}%`);

            // Log activity
            await logActivity(
                supabase,
                req.adminUser.id,
                req.adminUser.email,
                'delete_image',
                'media',
                null,
                filePath
            );

            res.json({
                success: true,
                message: 'Image deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting image:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to delete image'
            });
        }
    });

    // ============================================
    // GET ALL MEDIA ITEMS
    // ============================================
    router.get('/', verifyToken, async (req, res) => {
        try {
            const { page = 1, limit = 50, file_type, folder, search } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            let query = supabase
                .from('media_items')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false });

            if (file_type) {
                query = query.eq('file_type', file_type);
            }

            if (folder) {
                query = query.eq('folder', folder);
            }

            if (search) {
                query = query.or(`filename.ilike.%${search}%,original_filename.ilike.%${search}%,alt_text.ilike.%${search}%`);
            }

            const { data, error, count } = await query
                .range(offset, offset + parseInt(limit) - 1);

            if (error) throw error;

            res.json({
                success: true,
                data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / parseInt(limit))
                }
            });

        } catch (error) {
            console.error('Error fetching media items:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch media items'
            });
        }
    });

    // ============================================
    // GET SINGLE MEDIA ITEM
    // ============================================
    router.get('/:id', verifyToken, async (req, res) => {
        try {
            const { id } = req.params;

            const { data, error } = await supabase
                .from('media_items')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (!data) {
                return res.status(404).json({
                    success: false,
                    error: 'Media item not found'
                });
            }

            res.json({
                success: true,
                data
            });

        } catch (error) {
            console.error('Error fetching media item:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch media item'
            });
        }
    });

    // ============================================
    // UPDATE MEDIA ITEM METADATA
    // ============================================
    router.put('/:id', verifyToken, async (req, res) => {
        try {
            const { id } = req.params;
            const { alt_text, caption, description, folder, tags } = req.body;

            const updateData = {
                updated_at: new Date().toISOString()
            };

            if (alt_text !== undefined) updateData.alt_text = alt_text;
            if (caption !== undefined) updateData.caption = caption;
            if (description !== undefined) updateData.description = description;
            if (folder !== undefined) updateData.folder = folder;
            if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [tags];

            const { data, error } = await supabase
                .from('media_items')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            res.json({
                success: true,
                data,
                message: 'Media item updated successfully'
            });

        } catch (error) {
            console.error('Error updating media item:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update media item'
            });
        }
    });

    // ============================================
    // DELETE MEDIA ITEM BY ID
    // ============================================
    router.delete('/:id', verifyToken, async (req, res) => {
        try {
            const { id } = req.params;

            // Get media item first
            const { data: mediaItem, error: fetchError } = await supabase
                .from('media_items')
                .select('url')
                .eq('id', id)
                .single();

            if (fetchError || !mediaItem) {
                return res.status(404).json({
                    success: false,
                    error: 'Media item not found'
                });
            }

            // Delete from storage
            try {
                await deleteImage(mediaItem.url);
            } catch (storageError) {
                console.warn('Could not delete from storage:', storageError);
                // Continue with database deletion even if storage deletion fails
            }

            // Delete from database
            const { error: deleteError } = await supabase
                .from('media_items')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            // Log activity
            await logActivity(
                supabase,
                req.adminUser.id,
                req.adminUser.email,
                'delete_media',
                'media',
                parseInt(id),
                mediaItem.url
            );

            res.json({
                success: true,
                message: 'Media item deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting media item:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete media item'
            });
        }
    });

    // ============================================
    // GET IMAGE URL
    // ============================================
    router.get('/url/:path(*)', verifyToken, async (req, res) => {
        try {
            const filePath = req.params.path;
            const url = getImageURL(filePath);

            if (!url) {
                return res.status(404).json({
                    success: false,
                    error: 'Image not found'
                });
            }

            res.json({
                success: true,
                data: { url }
            });
        } catch (error) {
            console.error('Error getting image URL:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get image URL'
            });
        }
    });

    // ============================================
    // MIGRATE BASE64 TO STORAGE
    // ============================================
    router.post('/migrate-base64', verifyToken, async (req, res) => {
        try {
            const { articleId } = req.body;

            if (!articleId) {
                return res.status(400).json({
                    success: false,
                    error: 'Article ID is required'
                });
            }

            // Get article
            const { data: article, error: articleError } = await supabase
                .from('articles')
                .select('id, title, featured_image')
                .eq('id', articleId)
                .single();

            if (articleError || !article) {
                return res.status(404).json({
                    success: false,
                    error: 'Article not found'
                });
            }

            // Check if image is base64
            if (!article.featured_image || !article.featured_image.startsWith('data:image')) {
                return res.json({
                    success: true,
                    message: 'Article does not have a base64 image to migrate',
                    data: { articleId, alreadyMigrated: true }
                });
            }

            // Upload base64 image to storage
            const uploadResult = await uploadBase64Image(
                article.featured_image,
                `article-${articleId}-${Date.now()}.jpg`,
                { folder: 'articles', resize: true }
            );

            // Update article with new URL
            const { error: updateError } = await supabase
                .from('articles')
                .update({
                    featured_image: uploadResult.url,
                    featured_image_url: uploadResult.url,
                    updated_at: new Date().toISOString()
                })
                .eq('id', articleId);

            if (updateError) {
                throw updateError;
            }

            // Log activity
            await logActivity(
                supabase,
                req.adminUser.id,
                req.adminUser.email,
                'migrate_image',
                'article',
                articleId,
                article.title,
                { oldType: 'base64', newUrl: uploadResult.url }
            );

            res.json({
                success: true,
                message: 'Image migrated successfully',
                data: {
                    articleId,
                    oldImage: article.featured_image.substring(0, 50) + '...',
                    newUrl: uploadResult.url
                }
            });
        } catch (error) {
            console.error('Error migrating image:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to migrate image'
            });
        }
    });

    return router;
};

