/**
 * RSS Feed Generator
 * Generates RSS 2.0 compliant XML feed from articles
 */

function generateRSSFeed(articles, siteConfig = {}) {
    const {
        title = 'Auto Blog',
        description = 'Latest blog articles',
        link = 'http://localhost:3000',
        language = 'en-US',
        copyright = `Copyright ${new Date().getFullYear()}`,
        managingEditor = 'admin@example.com',
        webMaster = 'admin@example.com',
        ttl = 60
    } = siteConfig;

    const pubDate = articles.length > 0 
        ? new Date(articles[0].published_at || articles[0].created_at).toUTCString()
        : new Date().toUTCString();

    const rssItems = articles.map(article => {
        const itemPubDate = new Date(article.published_at || article.created_at).toUTCString();
        const itemLink = `${link}/article.html?slug=${article.slug}`;
        const itemDescription = article.excerpt || article.content?.substring(0, 300).replace(/<[^>]*>/g, '') || '';
        const itemContent = article.content || '';
        const category = article.categories?.name || 'Uncategorized';
        const author = article.authors?.email || managingEditor;

        return `    <item>
      <title><![CDATA[${escapeXML(article.title)}]]></title>
      <link>${itemLink}</link>
      <guid isPermaLink="true">${itemLink}</guid>
      <description><![CDATA[${escapeXML(itemDescription)}]]></description>
      <content:encoded><![CDATA[${escapeXML(itemContent)}]]></content:encoded>
      <pubDate>${itemPubDate}</pubDate>
      <category><![CDATA[${escapeXML(category)}]]></category>
      <author>${author}</author>
      ${article.featured_image ? `<enclosure url="${article.featured_image}" type="image/jpeg" />` : ''}
    </item>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${escapeXML(title)}]]></title>
    <link>${link}</link>
    <description><![CDATA[${escapeXML(description)}]]></description>
    <language>${language}</language>
    <copyright>${copyright}</copyright>
    <managingEditor>${managingEditor}</managingEditor>
    <webMaster>${webMaster}</webMaster>
    <pubDate>${pubDate}</pubDate>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>${ttl}</ttl>
    <generator>Auto Blog RSS Generator</generator>
${rssItems}
  </channel>
</rss>`;
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

// Validate RSS feed XML
function validateRSSFeed(rssXML) {
    const errors = [];
    const warnings = [];

    // Check if XML is well-formed
    try {
        // Basic XML structure checks
        if (!rssXML.includes('<?xml')) {
            errors.push('Missing XML declaration');
        }

        if (!rssXML.includes('<rss')) {
            errors.push('Missing RSS root element');
        }

        if (!rssXML.includes('<channel>')) {
            errors.push('Missing channel element');
        }

        // Check required channel elements
        const requiredElements = ['title', 'link', 'description'];
        requiredElements.forEach(element => {
            if (!rssXML.includes(`<${element}>`)) {
                errors.push(`Missing required channel element: ${element}`);
            }
        });

        // Check for items
        if (!rssXML.includes('<item>')) {
            warnings.push('No items found in RSS feed');
        }

        // Check item structure
        const itemCount = (rssXML.match(/<item>/g) || []).length;
        if (itemCount > 0) {
            const itemMatches = rssXML.match(/<item>[\s\S]*?<\/item>/g) || [];
            itemMatches.forEach((item, index) => {
                if (!item.includes('<title>')) {
                    errors.push(`Item ${index + 1} missing title`);
                }
                if (!item.includes('<link>')) {
                    errors.push(`Item ${index + 1} missing link`);
                }
                if (!item.includes('<description>')) {
                    warnings.push(`Item ${index + 1} missing description`);
                }
            });
        }

        // Check for common RSS 2.0 issues
        if (rssXML.includes('<content:encoded>') && !rssXML.includes('xmlns:content')) {
            warnings.push('Using content:encoded without declaring namespace');
        }

    } catch (error) {
        errors.push(`XML parsing error: ${error.message}`);
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

module.exports = {
    generateRSSFeed,
    escapeXML,
    validateRSSFeed
};

