require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCurrentSchema() {
    console.log('🔍 Testing current database schema...\n');

    // Test 1: Check what columns exist in articles table
    console.log('📋 Step 1: Checking articles table columns...');
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Error:', error.message);
        } else {
            const columns = data.length > 0 ? Object.keys(data[0]) : [];
            console.log('✅ Current columns:', columns.join(', '));
            console.log('');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    // Test 2: Try to create article with ONLY columns that exist
    console.log('📝 Step 2: Testing article creation with safe fields...');
    
    const testArticle = {
        title: 'Test Article - ' + Date.now(),
        slug: 'test-article-' + Date.now(),
        content: '<div><h2>Test Content</h2><p>This is a test article.</p></div>',
        excerpt: 'This is a test excerpt',
        category_id: 1,
        status: 'published',
        view_count: 0
    };

    // Try with different author field names
    const authorFields = ['author', 'author_name', 'created_by'];
    
    for (const field of authorFields) {
        console.log(`\n🧪 Trying with "${field}" field...`);
        const articleToTest = { ...testArticle, [field]: 'Test Author' };
        
        try {
            const { data, error } = await supabase
                .from('articles')
                .insert([articleToTest])
                .select()
                .single();

            if (error) {
                console.log(`   ❌ Failed: ${error.message}`);
            } else {
                console.log(`   ✅ SUCCESS! Article created with ID: ${data.id}`);
                console.log(`   📊 Created article:`, JSON.stringify(data, null, 2));
                
                // Clean up test article
                await supabase.from('articles').delete().eq('id', data.id);
                console.log(`   🗑️  Test article cleaned up`);
                
                console.log('\n' + '='.repeat(60));
                console.log('✅ WORKING BODY FORMAT FOR N8N:');
                console.log('='.repeat(60));
                console.log(JSON.stringify({
                    title: "Your Article Title",
                    slug: "your-article-slug-{{$now.format('x')}}",
                    content: "<div><h2>Your Content</h2><p>Article text here...</p></div>",
                    excerpt: "Article excerpt here",
                    category_id: 1,
                    [field]: "AI Content Generator",
                    status: "published",
                    view_count: 0
                }, null, 2));
                console.log('='.repeat(60));
                
                return; // Exit after first success
            }
        } catch (error) {
            console.log(`   ❌ Exception: ${error.message}`);
        }
    }

    // Test 3: Check if featured_image column exists and its type
    console.log('\n📸 Step 3: Checking featured_image column...');
    try {
        const testWithImage = {
            ...testArticle,
            author: 'Test',
            featured_image: 'https://example.com/image.jpg'
        };

        const { data, error } = await supabase
            .from('articles')
            .insert([testWithImage])
            .select()
            .single();

        if (error) {
            console.log('❌ featured_image column issue:', error.message);
            console.log('⚠️  You need to run ADD-MISSING-COLUMNS.sql to fix this!');
        } else {
            console.log('✅ featured_image column exists and works!');
            await supabase.from('articles').delete().eq('id', data.id);
        }
    } catch (error) {
        console.log('❌ featured_image test failed:', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📝 RECOMMENDATION:');
    console.log('='.repeat(60));
    console.log('1. Run ADD-MISSING-COLUMNS.sql in Supabase');
    console.log('2. Then you can use the full enhanced body format');
    console.log('3. This will fix featured_image and add all missing fields');
    console.log('='.repeat(60));
}

testCurrentSchema()
    .then(() => {
        console.log('\n✅ Test completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });

