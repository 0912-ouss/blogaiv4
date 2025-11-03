require('dotenv').config();
const axios = require('axios');

// Your original data (with issues)
const originalData = {
    "slug": "einer-langen-geschichte-in-der-entwicklung-von-robusten-ger-ten-f-r-den-einsatz...",
    "title": "Neu: Getac S510AD vereint starke KI Leistung mit Nachhaltigkeit und vielseitigem, robusten Design",
    "content": "Mit einer langen Geschichte in der Entwicklung von robusten Geräten für den Einsatz in anspruchsvollen Umgebungen hat Getac den neuen S510AD vorgestellt. Dieses innovative Gerät kombiniert starke KI-Leistung mit Nachhaltigkeit und einem vielseitigen, robusten Design. Benutzer können vom leistungsstarken KI-Funktionen profitieren, die ihnen bei der Bewältigung komplexer Aufgaben unterstützen. Das Gerät ist für den Einsatz unter extremen Bedingungen konzipiert und bietet langfristig eine nachhaltige Lösung. Mit dem Getac S510AD können Benutzer nicht nur ihre Produktivität steigern, sondern auch einen Beitrag zum Umweltschutz leisten.",
    "excerpt": "",
    "meta_description": "",
    "focus_keyword": "einer langen geschichte...",
    "secondary_keywords": "",
    "status": "draft",
    "source_url": "https://www.maschinenmarkt.vogel.de/getac-technology-gmbh-c-262099/nachrichten/68e634b39c9af/",
    "created_at": "2025-10-08T13:35:28.135+02:00",
    "updated_at": "2025-10-08T13:35:28.135+02:00"
};

// Transform function (what n8n should do)
function transformData(data) {
    // Clean slug - remove special chars, limit length
    const cleanSlug = data.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 80);

    // Generate excerpt if empty
    const excerpt = data.excerpt || data.content.substring(0, 200).trim() + '...';

    // Wrap content in HTML
    const htmlContent = `<div class='post-content'>
  <h2>${data.title}</h2>
  ${data.content.split('\n').map(p => `<p>${p}</p>`).join('\n  ')}
  <p><strong>Quelle:</strong> <a href="${data.source_url}" target="_blank">Maschinenmarkt</a></p>
</div>`;

    return {
        title: data.title,
        slug: `${cleanSlug}-${Date.now()}`,
        content: htmlContent,
        excerpt: excerpt,
        category_id: 1, // Technology
        author_name: "Tech News Bot",
        featured_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        image_copyright: "© Unsplash 2025",
        meta_description: data.meta_description || excerpt,
        meta_keywords: data.focus_keyword,
        tags: ["Getac", "KI", "Nachhaltigkeit", "Technologie"],
        status: "published", // Change from draft to published
        ai_generated: true
    };
}

async function testWebhook() {
    console.log('='.repeat(60));
    console.log('🧪 TESTING WEBHOOK RESPONSE');
    console.log('='.repeat(60));
    console.log('');

    // Step 1: Show original data issues
    console.log('❌ Original Data Issues:');
    console.log('   • Slug length:', originalData.slug.length, 'chars (TOO LONG!)');
    console.log('   • Excerpt:', originalData.excerpt ? 'OK' : '❌ EMPTY');
    console.log('   • Category ID:', originalData.category_id || '❌ MISSING');
    console.log('   • Featured Image:', originalData.featured_image || '❌ MISSING');
    console.log('');

    // Step 2: Transform data
    console.log('🔄 Transforming data...');
    const transformedData = transformData(originalData);
    console.log('');

    // Step 3: Show fixed data
    console.log('✅ Fixed Data:');
    console.log('   • Slug length:', transformedData.slug.length, 'chars ✅');
    console.log('   • Excerpt length:', transformedData.excerpt.length, 'chars ✅');
    console.log('   • Category ID:', transformedData.category_id, '✅');
    console.log('   • Featured Image:', transformedData.featured_image ? '✅ YES' : '❌ NO');
    console.log('');

    // Step 4: Send to API
    console.log('📤 Sending to API...');
    try {
        const response = await axios.post('http://localhost:3000/api/articles', transformedData);
        
        console.log('✅ SUCCESS!');
        console.log('');
        console.log('📋 Response:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log('');
        
        if (response.data.success && response.data.data) {
            const article = response.data.data;
            console.log('🎉 Article Created:');
            console.log('   • ID:', article.id);
            console.log('   • Title:', article.title);
            console.log('   • Slug:', article.slug);
            console.log('   • URL: http://localhost:3000/article.html?slug=' + article.slug);
            console.log('   • Status:', article.status);
            console.log('   • Created:', article.created_at);
        }
        
    } catch (error) {
        console.error('❌ ERROR:', error.response?.data || error.message);
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ TEST COMPLETED');
    console.log('='.repeat(60));
}

// Run test
testWebhook();
