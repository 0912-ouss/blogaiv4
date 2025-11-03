// Utility functions for article features

/**
 * Calculate reading time in minutes from HTML content
 */
function calculateReadingTime(content) {
    if (!content) return 0;
    
    // Strip HTML tags
    const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    
    // Calculate reading time (average reading speed: 200-250 words per minute)
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / 225); // Using 225 as average
    
    return minutes || 1; // Minimum 1 minute
}

/**
 * Save article version before update
 */
async function saveArticleVersion(supabase, articleId, articleData, userId, notes = null) {
    try {
        // Get current version number
        const { data: versions } = await supabase
            .from('article_versions')
            .select('version_number')
            .eq('article_id', articleId)
            .order('version_number', { ascending: false })
            .limit(1);
        
        const nextVersion = versions && versions.length > 0 
            ? versions[0].version_number + 1 
            : 1;
        
        // Save version
        const versionData = {
            article_id: articleId,
            title: articleData.title,
            slug: articleData.slug,
            content: articleData.content,
            excerpt: articleData.excerpt,
            featured_image: articleData.featured_image,
            meta_title: articleData.meta_title,
            meta_description: articleData.meta_description,
            meta_keywords: articleData.meta_keywords || [],
            status: articleData.status,
            version_number: nextVersion,
            created_by: userId,
            notes: notes || `Version ${nextVersion}`,
            created_at: new Date().toISOString()
        };
        
        const { error } = await supabase
            .from('article_versions')
            .insert([versionData]);
        
        if (error) {
            console.error('Error saving article version:', error);
            // Don't fail the update if versioning fails
        }
        
        return { success: true, version: nextVersion };
    } catch (error) {
        console.error('Error in saveArticleVersion:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get related articles based on category, tags, and keywords
 */
async function getRelatedArticles(supabase, articleId, articleData, limit = 5) {
    try {
        let query = supabase
            .from('articles')
            .select('id, title, slug, excerpt, featured_image, published_at, view_count, category_id')
            .eq('status', 'published')
            .neq('id', articleId)
            .limit(limit * 2); // Get more than needed for better filtering
        
        // Filter by category first
        if (articleData.category_id) {
            query = query.eq('category_id', articleData.category_id);
        }
        
        const { data: articles, error } = await query;
        
        if (error) throw error;
        
        if (!articles || articles.length === 0) {
            // If no articles in same category, get any published articles
            const { data: allArticles } = await supabase
                .from('articles')
                .select('id, title, slug, excerpt, featured_image, published_at, view_count, category_id')
                .eq('status', 'published')
                .neq('id', articleId)
                .order('published_at', { ascending: false })
                .limit(limit);
            
            return allArticles || [];
        }
        
        // Score articles by relevance
        const scoredArticles = articles.map(article => {
            let score = 0;
            
            // Same category: +10 points
            if (article.category_id === articleData.category_id) {
                score += 10;
            }
            
            // Tags match: +5 points per matching tag
            if (articleData.tags && Array.isArray(articleData.tags)) {
                const articleTags = article.tags || [];
                const matchingTags = articleData.tags.filter(tag => 
                    articleTags.some(t => t.toLowerCase() === tag.toLowerCase())
                );
                score += matchingTags.length * 5;
            }
            
            // Title keywords match: +3 points per matching word
            if (articleData.title) {
                const titleWords = articleData.title.toLowerCase().split(/\s+/);
                const articleTitleWords = article.title.toLowerCase().split(/\s+/);
                const matchingWords = titleWords.filter(word => 
                    word.length > 3 && articleTitleWords.includes(word)
                );
                score += matchingWords.length * 3;
            }
            
            // More views: +1 point per 100 views
            score += Math.floor((article.view_count || 0) / 100);
            
            return { ...article, relevanceScore: score };
        });
        
        // Sort by score and return top results
        scoredArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);
        
        return scoredArticles.slice(0, limit).map(({ relevanceScore, ...article }) => article);
        
    } catch (error) {
        console.error('Error getting related articles:', error);
        return [];
    }
}

module.exports = {
    calculateReadingTime,
    saveArticleVersion,
    getRelatedArticles
};

