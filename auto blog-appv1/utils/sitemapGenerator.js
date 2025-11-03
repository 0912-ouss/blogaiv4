/**
 * XML Sitemap Generator
 * Generates XML sitemap for SEO
 */

function generateSitemap(articles, siteConfig = {}) {
    const {
        siteUrl = 'http://localhost:3000',
        lastmod = new Date().toISOString().split('T')[0],
        changefreq = 'weekly',
        priority = '0.8'
    } = siteConfig;

    const urls = articles.map(article => {
        const articleLastmod = article.updated_at || article.published_at || article.created_at;
        const formattedDate = articleLastmod ? new Date(articleLastmod).toISOString().split('T')[0] : lastmod;
        
        // Determine priority based on article age/views
        let articlePriority = priority;
        if (article.is_featured) articlePriority = '1.0';
        else if (article.view_count > 1000) articlePriority = '0.9';
        else if (article.view_count > 100) articlePriority = '0.8';
        else articlePriority = '0.7';

        return `    <url>
      <loc>${siteUrl}/article.html?slug=${escapeXML(article.slug)}</loc>
      <lastmod>${formattedDate}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${articlePriority}</priority>
    </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/index.html</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${urls}
</urlset>`;
}

function escapeXML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

module.exports = {
    generateSitemap,
    escapeXML
};

