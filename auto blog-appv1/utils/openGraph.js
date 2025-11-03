/**
 * Open Graph Meta Tags Generator
 * Generates Open Graph and Twitter Card meta tags for articles
 */

function generateOpenGraphTags(article, siteConfig = {}) {
    const {
        siteUrl = 'http://localhost:3000',
        siteName = 'Auto Blog',
        siteDescription = 'Latest blog articles',
        twitterHandle = '@autoblog'
    } = siteConfig;

    const articleUrl = `${siteUrl}/article.html?slug=${article.slug}`;
    const articleImage = article.featured_image || `${siteUrl}/images/default-og-image.jpg`;
    const articleTitle = article.meta_title || article.title;
    const articleDescription = article.meta_description || article.excerpt || article.content?.substring(0, 200).replace(/<[^>]*>/g, '') || siteDescription;
    const articleType = 'article';
    const publishedTime = article.published_at || article.created_at;

    return {
        // Open Graph
        'og:title': articleTitle,
        'og:description': articleDescription,
        'og:type': articleType,
        'og:url': articleUrl,
        'og:image': articleImage,
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:site_name': siteName,
        'og:locale': 'en_US',
        'article:published_time': publishedTime,
        'article:modified_time': article.updated_at,
        'article:author': article.authors?.name || siteName,
        'article:section': article.categories?.name || 'General',
        
        // Twitter Card
        'twitter:card': 'summary_large_image',
        'twitter:site': twitterHandle,
        'twitter:creator': twitterHandle,
        'twitter:title': articleTitle,
        'twitter:description': articleDescription,
        'twitter:image': articleImage,
        
        // Standard Meta
        'title': articleTitle,
        'description': articleDescription,
        'keywords': Array.isArray(article.meta_keywords) ? article.meta_keywords.join(', ') : article.meta_keywords || '',
        'author': article.authors?.name || siteName,
        'canonical': articleUrl
    };
}

function generateMetaTagsHTML(tags) {
    return Object.entries(tags)
        .map(([name, content]) => {
            if (!content) return '';
            const property = name.startsWith('og:') || name.startsWith('twitter:') || name.startsWith('article:') ? 'property' : 'name';
            return `<meta ${property}="${name}" content="${escapeHTML(content)}" />`;
        })
        .filter(tag => tag)
        .join('\n    ');
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

module.exports = {
    generateOpenGraphTags,
    generateMetaTagsHTML
};

