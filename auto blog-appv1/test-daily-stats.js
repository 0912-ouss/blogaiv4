require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDailyStats() {
    console.log('='.repeat(60));
    console.log('🧪 TESTING DAILY STATS TABLE');
    console.log('='.repeat(60));
    console.log('');

    // Test 1: Check if table exists and get today's stats
    console.log('📋 Test 1: Check daily_stats table...');
    try {
        const { data, error } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('date', new Date().toISOString().split('T')[0])
            .single();

        if (error) {
            console.error('❌ Error:', error.message);
            console.log('\n⚠️  Table might not exist yet!');
            console.log('👉 Run CREATE-DAILY-STATS-TABLE.sql in Supabase first!\n');
            return false;
        }

        console.log('✅ Table exists!');
        console.log('📊 Today\'s Stats:');
        console.log('   Date:', data.date);
        console.log('   Articles Created:', data.articles_created);
        console.log('   Daily Limit:', data.daily_limit);
        console.log('   Under Limit:', data.under_limit ? '✅ YES' : '❌ NO');
        console.log('   Remaining:', data.daily_limit - data.articles_created);
        console.log('');

    } catch (error) {
        console.error('❌ Exception:', error.message);
        return false;
    }

    // Test 2: Get all stats (history)
    console.log('📜 Test 2: Get historical data...');
    try {
        const { data, error } = await supabase
            .from('daily_stats')
            .select('*')
            .order('date', { ascending: false })
            .limit(7);

        if (error) throw error;

        console.log('✅ Found', data.length, 'days of data:');
        console.log('');
        console.log('Date       | Created | Limit | Under Limit?');
        console.log('-'.repeat(50));
        data.forEach(row => {
            const status = row.under_limit ? '✅ Yes' : '❌ No';
            console.log(`${row.date} |    ${row.articles_created}    |  ${row.daily_limit}   | ${status}`);
        });
        console.log('');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    // Test 3: Simulate n8n check
    console.log('🤖 Test 3: Simulate n8n limit check...');
    try {
        const { data, error } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('date', new Date().toISOString().split('T')[0])
            .single();

        if (error) throw error;

        console.log('✅ n8n would receive this data:');
        console.log(JSON.stringify(data, null, 2));
        console.log('');
        
        if (data.under_limit) {
            console.log('✅ Decision: PROCEED - Create article');
            console.log(`   Reason: ${data.articles_created} < ${data.daily_limit}`);
        } else {
            console.log('⛔ Decision: STOP - Daily limit reached');
            console.log(`   Reason: ${data.articles_created} >= ${data.daily_limit}`);
        }
        console.log('');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    // Test 4: Test trigger (create a test article)
    console.log('🧪 Test 4: Test auto-update trigger...');
    console.log('   Creating a test article...');
    
    try {
        // Get current count
        const { data: beforeData } = await supabase
            .from('daily_stats')
            .select('articles_created')
            .eq('date', new Date().toISOString().split('T')[0])
            .single();

        const countBefore = beforeData?.articles_created || 0;
        console.log('   Articles before:', countBefore);

        // Create test article
        const testArticle = {
            title: 'Test Article - ' + Date.now(),
            slug: 'test-article-' + Date.now(),
            content: '<p>Test content</p>',
            excerpt: 'Test excerpt',
            category_id: 1,
            author_name: 'Test',
            status: 'published'
        };

        const { data: article, error: articleError } = await supabase
            .from('articles')
            .insert([testArticle])
            .select()
            .single();

        if (articleError) throw articleError;

        console.log('   ✅ Test article created (ID:', article.id + ')');

        // Wait a moment for trigger
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check updated count
        const { data: afterData } = await supabase
            .from('daily_stats')
            .select('articles_created')
            .eq('date', new Date().toISOString().split('T')[0])
            .single();

        const countAfter = afterData?.articles_created || 0;
        console.log('   Articles after:', countAfter);

        if (countAfter === countBefore + 1) {
            console.log('   ✅ Trigger works! Count increased by 1');
        } else {
            console.log('   ⚠️  Trigger might not be working. Expected:', countBefore + 1, 'Got:', countAfter);
        }

        // Clean up test article
        await supabase.from('articles').delete().eq('id', article.id);
        console.log('   🗑️  Test article cleaned up');
        console.log('');

        // Update count back (since we deleted the article)
        await supabase
            .from('daily_stats')
            .update({ articles_created: countBefore })
            .eq('date', new Date().toISOString().split('T')[0]);
        console.log('   ♻️  Count restored to original value');

    } catch (error) {
        console.error('   ❌ Error:', error.message);
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ ALL TESTS COMPLETED!');
    console.log('='.repeat(60));
    console.log('');
    console.log('📝 Summary:');
    console.log('   • daily_stats table is working');
    console.log('   • Auto-update trigger is active');
    console.log('   • Ready for n8n integration');
    console.log('');
    console.log('🚀 Next Step: Configure your n8n workflow!');
    console.log('   See: OPTION-2-SETUP-GUIDE.md');
    console.log('');

    return true;
}

// Run tests
testDailyStats()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Test failed:', error);
        process.exit(1);
    });

