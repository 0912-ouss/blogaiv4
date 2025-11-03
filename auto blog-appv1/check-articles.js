require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkArticles() {
    console.log('='.repeat(60));
    console.log('🔍 CHECKING ARTICLES IN DATABASE');
    console.log('='.repeat(60));
    console.log('');

    // Check ALL articles (no status filter)
    console.log('📋 All articles in database:');
    const { data: allArticles, error: allError } = await supabase
        .from('articles')
        .select('id, title, slug, status, published_at')
        .order('created_at', { ascending: false });

    if (allError) {
        console.error('❌ Error:', allError.message);
        return;
    }

    if (allArticles.length === 0) {
        console.log('   ⚠️  No articles found in database!');
    } else {
        console.log(`   ✅ Found ${allArticles.length} articles:\n`);
        allArticles.forEach((article, index) => {
            console.log(`   ${index + 1}. ID: ${article.id}`);
            console.log(`      Title: ${article.title}`);
            console.log(`      Status: ${article.status || 'NULL'} ${article.status === 'published' ? '✅' : '❌'}`);
            console.log(`      Published: ${article.published_at || 'NULL'}`);
            console.log(`      Slug: ${article.slug?.substring(0, 50)}...`);
            console.log('');
        });
    }

    // Check published articles only
    console.log('📋 Published articles only:');
    const { data: publishedArticles, error: pubError } = await supabase
        .from('articles')
        .select('id, title, status')
        .eq('status', 'published');

    if (pubError) {
        console.error('❌ Error:', pubError.message);
        return;
    }

    console.log(`   Found ${publishedArticles.length} published articles`);

    console.log('');
    console.log('='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total articles: ${allArticles.length}`);
    console.log(`Published: ${publishedArticles.length}`);
    console.log(`Not published: ${allArticles.length - publishedArticles.length}`);
    console.log('');

    if (allArticles.length > 0 && publishedArticles.length === 0) {
        console.log('⚠️  PROBLEM FOUND!');
        console.log('   Your articles exist but status is NOT "published"');
        console.log('');
        console.log('✅ SOLUTION:');
        console.log('   Run this SQL in Supabase:');
        console.log('   UPDATE articles SET status = \'published\' WHERE status IS NULL OR status != \'published\';');
    }
}

checkArticles();

