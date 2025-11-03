// Fix article images - replace missing/invalid images with existing website images
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Available images in the website
const availableImages = [
    '/images/all/1.jpg',
    '/images/all/banner.jpg',
    '/images/bg/1.jpg',
    '/images/bg/2.jpg'
];

function getRandomImage() {
    return availableImages[Math.floor(Math.random() * availableImages.length)];
}

function getCategoryImage(categoryId) {
    // Assign specific images to categories
    const categoryImages = {
        1: '/images/bg/1.jpg',    // Technology - blue background
        2: '/images/all/banner.jpg', // Business - banner
        3: '/images/bg/2.jpg',    // Science - alternate background
        4: '/images/all/1.jpg',   // Health - main image
        5: '/images/bg/1.jpg'     // Politics - blue background
    };
    return categoryImages[categoryId] || '/images/all/1.jpg';
}

async function fixArticleImages() {
    console.log('\n🔍 Checking and Fixing Article Images');
    console.log('=' .repeat(60));
    
    try {
        // Fetch all articles
        const { data: articles, error } = await supabase
            .from('articles')
            .select('*')
            .order('id');
        
        if (error) {
            console.error('❌ Error fetching articles:', error.message);
            return;
        }
        
        console.log(`📊 Found ${articles.length} articles to check\n`);
        
        let updatedCount = 0;
        let skippedCount = 0;
        
        for (const article of articles) {
            const needsUpdate = 
                !article.featured_image || 
                article.featured_image.startsWith('data:image/svg') || 
                article.featured_image === '' ||
                article.featured_image === null;
            
            if (needsUpdate) {
                // Get appropriate image based on category
                const newImage = getCategoryImage(article.category_id);
                
                console.log(`📝 Article ID ${article.id}: "${article.title}"`);
                console.log(`   Current: ${article.featured_image ? article.featured_image.substring(0, 50) + '...' : 'NULL'}`);
                console.log(`   New: ${newImage}`);
                
                // Update the article
                const { error: updateError } = await supabase
                    .from('articles')
                    .update({ featured_image: newImage })
                    .eq('id', article.id);
                
                if (updateError) {
                    console.log(`   ❌ Error updating: ${updateError.message}\n`);
                } else {
                    console.log(`   ✅ Updated successfully\n`);
                    updatedCount++;
                }
            } else {
                console.log(`✓ Article ID ${article.id}: "${article.title.substring(0, 40)}..." - Image OK`);
                skippedCount++;
            }
        }
        
        console.log('=' .repeat(60));
        console.log('📊 SUMMARY');
        console.log('=' .repeat(60));
        console.log(`✅ Updated: ${updatedCount} articles`);
        console.log(`⏭️  Skipped: ${skippedCount} articles (already have valid images)`);
        console.log(`📝 Total: ${articles.length} articles`);
        console.log('=' .repeat(60));
        console.log('\n🎉 Image fix complete!');
        console.log('🌐 Refresh your blog at: http://localhost:3000/index.html\n');
        
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
    }
}

// Run the script
fixArticleImages()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });

