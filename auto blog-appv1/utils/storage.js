const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const axios = require('axios');

// Initialize Supabase Storage client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('⚠️  Supabase Storage: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Storage bucket name
const BUCKET_NAME = 'article-images';

// ============================================
// STORAGE UTILITIES
// ============================================

/**
 * Initialize storage bucket (run once)
 */
async function initializeBucket() {
    try {
        // Check if bucket exists
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
            console.error('Error listing buckets:', listError);
            return false;
        }

        const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);

        if (!bucketExists) {
            // Create bucket
            const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
                public: true,
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                fileSizeLimit: 5242880 // 5MB
            });

            if (error) {
                console.error('Error creating bucket:', error);
                return false;
            }

            console.log('✅ Storage bucket created:', BUCKET_NAME);
            return true;
        }

        console.log('✅ Storage bucket exists:', BUCKET_NAME);
        return true;
    } catch (error) {
        console.error('Error initializing bucket:', error);
        return false;
    }
}

/**
 * Upload image to Supabase Storage
 * @param {Buffer|string} imageData - Image data (Buffer or base64 string)
 * @param {string} fileName - File name
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Upload result with URL
 */
async function uploadImage(imageData, fileName, options = {}) {
    try {
        const {
            folder = 'uploads',
            resize = true,
            maxWidth = 1920,
            maxHeight = 1080,
            quality = 85,
            format = 'webp'
        } = options;

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const ext = fileName.split('.').pop() || 'jpg';
        const uniqueFileName = `${timestamp}-${randomStr}.${ext}`;
        const filePath = `${folder}/${uniqueFileName}`;

        let processedImage;

        // Handle base64 string
        if (typeof imageData === 'string' && imageData.startsWith('data:')) {
            // Extract base64 data
            const base64Data = imageData.split(',')[1];
            imageData = Buffer.from(base64Data, 'base64');
        }

        // Process image if resize is enabled
        if (resize && imageData instanceof Buffer) {
            try {
                const image = sharp(imageData);
                const metadata = await image.metadata();

                // Resize if needed
                if (metadata.width > maxWidth || metadata.height > maxHeight) {
                    processedImage = await image
                        .resize(maxWidth, maxHeight, {
                            fit: 'inside',
                            withoutEnlargement: true
                        })
                        .toFormat(format, { quality })
                        .toBuffer();
                } else {
                    // Just convert format
                    processedImage = await image
                        .toFormat(format, { quality })
                        .toBuffer();
                }
            } catch (error) {
                console.warn('Image processing failed, using original:', error.message);
                processedImage = imageData;
            }
        } else {
            processedImage = imageData;
        }

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, processedImage, {
                contentType: `image/${format}`,
                upsert: false
            });

        if (error) {
            console.error('Upload error:', error);
            throw error;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        return {
            success: true,
            path: filePath,
            url: urlData.publicUrl,
            fileName: uniqueFileName,
            size: processedImage.length
        };
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

/**
 * Delete image from Supabase Storage
 * @param {string} filePath - File path in storage
 * @returns {Promise<boolean>} - Success status
 */
async function deleteImage(filePath) {
    try {
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            console.error('Error deleting image:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting image:', error);
        return false;
    }
}

/**
 * Download image from URL and upload to storage
 * @param {string} imageUrl - Image URL
 * @param {string} fileName - File name
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Upload result
 */
async function uploadImageFromURL(imageUrl, fileName, options = {}) {
    try {
        // Download image
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 30000
        });

        const imageBuffer = Buffer.from(response.data);

        // Upload to storage
        return await uploadImage(imageBuffer, fileName, options);
    } catch (error) {
        console.error('Error uploading image from URL:', error);
        throw error;
    }
}

/**
 * Convert base64 to Buffer and upload
 * @param {string} base64String - Base64 image string
 * @param {string} fileName - File name
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Upload result
 */
async function uploadBase64Image(base64String, fileName, options = {}) {
    try {
        // Extract base64 data
        const base64Data = base64String.includes(',') 
            ? base64String.split(',')[1] 
            : base64String;
        
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        return await uploadImage(imageBuffer, fileName, options);
    } catch (error) {
        console.error('Error uploading base64 image:', error);
        throw error;
    }
}

/**
 * Get image URL from storage path
 * @param {string} filePath - File path in storage
 * @returns {string} - Public URL
 */
function getImageURL(filePath) {
    if (!filePath) return null;
    
    // If already a URL, return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }

    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return data.publicUrl;
}

module.exports = {
    initializeBucket,
    uploadImage,
    deleteImage,
    uploadImageFromURL,
    uploadBase64Image,
    getImageURL,
    BUCKET_NAME
};

