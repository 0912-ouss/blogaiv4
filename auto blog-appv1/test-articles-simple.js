require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSimpleArticles() {
    console.log('🧪 Testing Simple Articles Fetch...\n');

    try {
        // Test 1: Fetch articles without any joins
        console.log('1️⃣ Fetching articles (no joins)...');
        const { data: articles, error: articlesError } = await supabase
            .from('articles')
            .select('*')
            .limit(5);

        if (articlesError) {
            console.log('❌ Error fetching articles:', articlesError);
        } else {
            console.log(`✅ Found ${articles.length} articles`);
            console.log('Articles:', articles.map(a => ({ id: a.id, title: a.title, category_id: a.category_id, author_id: a.author_id })));
        }

        // Test 2: Fetch categories
        console.log('\n2️⃣ Fetching categories...');
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*');

        if (catError) {
            console.log('❌ Error fetching categories:', catError);
        } else {
            console.log(`✅ Found ${categories.length} categories`);
            console.log('Categories:', categories);
        }

        // Test 3: Fetch authors
        console.log('\n3️⃣ Fetching authors...');
        const { data: authors, error: authError } = await supabase
            .from('authors')
            .select('*');

        if (authError) {
            console.log('❌ Error fetching authors:', authError);
        } else {
            console.log(`✅ Found ${authors.length} authors`);
            console.log('Authors:', authors);
        }

        // Test 4: Try with join
        console.log('\n4️⃣ Trying to fetch with join...');
        const { data: joined, error: joinError } = await supabase
            .from('articles')
            .select(`
                *,
                categories(id, name, slug),
                authors(id, name, slug)
            `)
            .limit(5);

        if (joinError) {
            console.log('❌ Error with join:', joinError);
        } else {
            console.log(`✅ Join successful! Found ${joined.length} articles`);
            console.log('Joined data sample:', JSON.stringify(joined[0], null, 2));
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testSimpleArticles();

