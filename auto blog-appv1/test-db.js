// Test database connection
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
    console.log('🔍 Testing Supabase connection...\n');
    
    try {
        // Test 1: Check categories
        console.log('📂 Fetching categories...');
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*');
        
        if (catError) {
            console.error('❌ Categories error:', catError.message);
        } else {
            console.log(`✅ Found ${categories.length} categories`);
            categories.forEach(cat => console.log(`   - ${cat.name} (${cat.slug})`));
        }
        
        console.log('');
        
        // Test 2: Check articles
        console.log('📰 Fetching articles...');
        const { data: articles, error: artError } = await supabase
            .from('articles')
            .select('*')
            .limit(5);
        
        if (artError) {
            console.error('❌ Articles error:', artError.message);
        } else {
            console.log(`✅ Found ${articles.length} articles`);
            articles.forEach(art => console.log(`   - ${art.title} (${art.slug})`));
        }
        
        console.log('\n✅ Database connection successful!\n');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.log('\n⚠️  Make sure you have:');
        console.log('   1. Created the tables in Supabase (run database-setup.sql)');
        console.log('   2. Set correct credentials in .env file');
        console.log('   3. Enabled Row Level Security policies\n');
    }
}

testConnection();

