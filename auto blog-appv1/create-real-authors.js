require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Realistic author names with professional bios
const realAuthors = [
    {
        name: 'Sarah Müller',
        slug: 'sarah-muller',
        bio: 'Tech journalist and innovation writer with over 10 years of experience covering emerging technologies. Passionate about making complex tech topics accessible to everyone.',
        email: 'sarah.muller@blog.com',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
    },
    {
        name: 'Michael Schneider',
        slug: 'michael-schneider',
        bio: 'Business strategist and startup advisor. Former consultant at McKinsey, now helping entrepreneurs navigate the business landscape.',
        email: 'michael.schneider@blog.com',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
    },
    {
        name: 'Dr. Lisa Weber',
        slug: 'lisa-weber',
        bio: 'Medical researcher and health writer. PhD in Public Health, focusing on preventive medicine and wellness. Published author of 3 health books.',
        email: 'lisa.weber@blog.com',
        avatar_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=150&q=80'
    },
    {
        name: 'Thomas Fischer',
        slug: 'thomas-fischer',
        bio: 'Science communicator and astronomy enthusiast. Former researcher at Max Planck Institute, now sharing the wonders of the universe through writing.',
        email: 'thomas.fischer@blog.com',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    {
        name: 'Anna Hoffmann',
        slug: 'anna-hoffmann',
        bio: 'Politics and international relations analyst. Contributor to major German publications. Expert in European politics and policy analysis.',
        email: 'anna.hoffmann@blog.com',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80'
    },
    {
        name: 'David Klein',
        slug: 'david-klein',
        bio: 'Lifestyle and wellness expert. Certified nutritionist and fitness coach. Helping people live healthier, happier lives through evidence-based advice.',
        email: 'david.klein@blog.com',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    },
    {
        name: 'Emma Wagner',
        slug: 'emma-wagner',
        bio: 'Travel writer and cultural explorer. Visited over 60 countries. Sharing authentic travel experiences and cultural insights.',
        email: 'emma.wagner@blog.com',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    }
];

async function createRealAuthors() {
    console.log('🔄 Creating realistic authors...\n');

    try {
        const authorIds = [];

        for (const author of realAuthors) {
            // Check if author already exists
            const { data: existing } = await supabase
                .from('authors')
                .select('id')
                .eq('slug', author.slug)
                .single();

            if (existing) {
                console.log(`✓ Author "${author.name}" already exists (ID: ${existing.id})`);
                authorIds.push(existing.id);
                continue;
            }

            // Create author
            const { data, error } = await supabase
                .from('authors')
                .insert([author])
                .select('id')
                .single();

            if (error) {
                console.error(`❌ Error creating author "${author.name}":`, error.message);
            } else {
                console.log(`✅ Created author: ${author.name} (ID: ${data.id})`);
                authorIds.push(data.id);
            }
        }

        console.log(`\n✅ Created/verified ${authorIds.length} authors`);
        return authorIds;

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

async function updateArticlesWithRealAuthors() {
    console.log('\n🔄 Updating articles with real author names...\n');

    try {
        // Get all articles
        const { data: articles, error: articlesError } = await supabase
            .from('articles')
            .select('id, title, author_name, category_id');

        if (articlesError) {
            throw articlesError;
        }

        // Get all authors
        const { data: authors, error: authorsError } = await supabase
            .from('authors')
            .select('id, name, slug');

        if (authorsError) {
            throw authorsError;
        }

        console.log(`📝 Found ${articles.length} articles to update\n`);

        // Map categories to suitable authors (optional, for better matching)
        const categoryAuthorMap = {
            1: authors.find(a => a.slug === 'sarah-muller')?.id || authors[0].id, // Technology -> Sarah
            2: authors.find(a => a.slug === 'michael-schneider')?.id || authors[1].id, // Business -> Michael
            3: authors.find(a => a.slug === 'lisa-weber')?.id || authors[2].id, // Science -> Lisa
            4: authors.find(a => a.slug === 'lisa-weber')?.id || authors[2].id, // Health -> Lisa
            5: authors.find(a => a.slug === 'anna-hoffmann')?.id || authors[4].id, // Politics -> Anna
            6: authors.find(a => a.slug === 'david-klein')?.id || authors[5].id, // Lifestyle -> David
            7: authors.find(a => a.slug === 'emma-wagner')?.id || authors[6].id, // Entertainment -> Emma
        };

        let updated = 0;

        for (const article of articles) {
            // Skip if already has a real author (not automated author or "Admin")
            if (article.author_name && 
                article.author_name !== 'AI Blog' && 
                article.author_name !== 'Admin' &&
                !article.author_name.toLowerCase().includes('ai')) {
                continue;
            }

            // Select author based on category or random
            let authorId = null;
            let authorName = null;

            if (article.category_id && categoryAuthorMap[article.category_id]) {
                authorId = categoryAuthorMap[article.category_id];
            } else {
                // Random author if no category match
                authorId = authors[Math.floor(Math.random() * authors.length)].id;
            }

            const author = authors.find(a => a.id === authorId);
            if (author) {
                authorName = author.name;
            } else {
                authorName = authors[0].name;
                authorId = authors[0].id;
            }

            // Update article
            const { error: updateError } = await supabase
                .from('articles')
                .update({
                    author_name: authorName,
                    author_id: authorId
                })
                .eq('id', article.id);

            if (updateError) {
                console.error(`❌ Error updating article ${article.id}:`, updateError.message);
            } else {
                updated++;
                console.log(`✅ Updated article "${article.title.substring(0, 50)}..." → ${authorName}`);
            }
        }

        console.log(`\n✅ Successfully updated ${updated} articles with real author names!`);
        console.log(`📊 Total articles: ${articles.length}`);
        console.log(`✅ Updated: ${updated}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

async function main() {
    await createRealAuthors();
    await updateArticlesWithRealAuthors();
}

main();

