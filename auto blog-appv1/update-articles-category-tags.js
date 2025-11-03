require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateArticlesWithCategoryAndTags() {
    console.log('🔄 Updating articles with category names and tags...\n');

    try {
        // Get all articles with category_id
        const { data: articles, error: articlesError } = await supabase
            .from('articles')
            .select('id, title, category_id, category, tags');

        if (articlesError) {
            throw articlesError;
        }

        console.log(`📝 Found ${articles.length} articles to update\n`);

        // Get all categories
        const { data: categories, error: catsError } = await supabase
            .from('categories')
            .select('id, name');

        if (catsError) {
            throw catsError;
        }

        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.id] = cat.name;
        });

        let updated = 0;

        for (const article of articles) {
            if (!article.category_id) continue;

            const categoryName = categoryMap[article.category_id];
            if (!categoryName) continue;

            // Generate tags from category and title
            const titleWords = article.title
                .toLowerCase()
                .replace(/[^\w\s]/g, ' ') // Remove special characters
                .split(/\s+/)
                .filter(w => w.length > 3)
                .slice(0, 3);

            const tags = [categoryName.toLowerCase(), ...titleWords].filter(Boolean);

            // Update article
            const { error: updateError } = await supabase
                .from('articles')
                .update({
                    category: categoryName,
                    tags: tags
                })
                .eq('id', article.id);

            if (updateError) {
                console.error(`❌ Error updating article ${article.id}:`, updateError.message);
            } else {
                updated++;
                console.log(`✅ Updated article ${article.id}: "${article.title.substring(0, 50)}..."`);
                console.log(`   Category: ${categoryName}, Tags: ${tags.join(', ')}`);
            }
        }

        console.log(`\n✅ Successfully updated ${updated} articles!`);
        console.log(`📊 Total articles: ${articles.length}`);
        console.log(`✅ Updated: ${updated}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateArticlesWithCategoryAndTags();

