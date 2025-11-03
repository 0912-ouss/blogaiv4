require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyCleanDatabase() {
    console.log('='.repeat(60));
    console.log('🧹 VERIFYING DATABASE IS CLEAN');
    console.log('='.repeat(60));
    console.log('');

    // Check articles count
    console.log('1️⃣ Checking articles...');
    const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });

    if (articlesError) {
        console.error('   ❌ Error:', articlesError.message);
    } else {
        const count = articles?.length || 0;
        if (count === 0) {
            console.log('   ✅ Articles table is empty (0 articles)');
        } else {
            console.log('   ⚠️  Found', count, 'articles');
        }
    }

    console.log('');

    // Check daily stats
    console.log('2️⃣ Checking daily stats...');
    const { data: stats, error: statsError } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

    if (statsError) {
        console.error('   ❌ Error:', statsError.message);
    } else {
        console.log('   ✅ Daily stats found:');
        console.log('      Date:', stats.date);
        console.log('      Articles Created:', stats.articles_created);
        console.log('      Daily Limit:', stats.daily_limit);
        console.log('      Under Limit:', stats.under_limit ? '✅ YES' : '❌ NO');
        console.log('      Remaining:', stats.daily_limit - stats.articles_created);
    }

    console.log('');
    console.log('='.repeat(60));
    
    if (stats?.articles_created === 0) {
        console.log('✅ DATABASE IS CLEAN AND READY FOR TESTING!');
    } else {
        console.log('⚠️  Database still has data. Run CLEAR-ALL-ARTICLES-FOR-TEST.sql');
    }
    
    console.log('='.repeat(60));
    console.log('');
    console.log('🚀 You can now test your n8n workflow!');
    console.log('   Each article created will increment the counter.');
    console.log('');
}

verifyCleanDatabase();

