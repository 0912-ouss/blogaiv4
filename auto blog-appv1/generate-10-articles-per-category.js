// Delete all articles and generate 10 articles per category using Option 2 structure
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Different image URLs for each category - Option 2 style
// Each article gets UNIQUE featured image, content images also unique per article
const categoryImages = {
    1: { // Technology - 3 different featured images
        featured: [
            'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        ],
        content1: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        content2: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
        content3: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
        content4: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    },
    2: { // Business - 3 different featured images
        featured: [
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        ],
        content1: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
        content2: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
        content3: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
        content4: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    },
    3: { // Science - 3 different featured images
        featured: [
            'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80',
        ],
        content1: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
        content2: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        content3: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
        content4: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=1200&q=80',
    },
    4: { // Health - 3 different featured images
        featured: [
            'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80',
        ],
        content1: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
        content2: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
        content3: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=1200&q=80',
        content4: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80',
    },
    5: { // Politics - 3 different featured images
        featured: [
            'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
        ],
        content1: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
        content2: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
        content3: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
        content4: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=1200&q=80',
    },
};

// Article topics for each category (3 per category)
const articleTopics = {
    1: [ // Technology
        "Die Zukunft der Künstlichen Intelligenz: Revolutionäre Entwicklungen 2025",
        "Quantencomputer: Wie sie die Technologie revolutionieren",
        "Cybersecurity im Zeitalter der KI: Neue Herausforderungen und Lösungen",
    ],
    2: [ // Business
        "Remote Work Revolution: Wie KI die Zukunft der Arbeit gestaltet",
        "Startup-Ökosystem 2025: Trends und Chancen für Gründer",
        "Nachhaltigkeit im Unternehmen: ESG-Strategien für Erfolg",
    ],
    3: [ // Science
        "Klimawandel: Neue Erkenntnisse und Lösungsansätze",
        "Weltraumforschung: Die neuesten Entdeckungen im All",
        "Medizinische Durchbrüche: Revolutionäre Behandlungsmethoden",
    ],
    4: [ // Health
        "Mental Health: Neue Ansätze zur psychischen Gesundheit",
        "Personalized Medicine: Behandlungen maßgeschneidert für jeden",
        "Gesunde Ernährung: Wissenschaftliche Erkenntnisse",
    ],
    5: [ // Politics
        "Europäische Politik: Die Zukunft der EU",
        "Klimapolitik: Internationale Abkommen und Maßnahmen",
        "Digitale Demokratie: E-Voting und Bürgerbeteiligung",
    ],
};

// Category names mapping - use database category names
const categoryNames = {
    1: "Technology",
    2: "Business",
    3: "Science",
    4: "Health",
    5: "Politics",
};

// Generate article content using OpenAI - Option 2 style
async function generateArticleContent(topic, categoryName) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are a professional German blog writer. Write engaging, well-structured articles in German (Deutsch) with modern HTML structure. Use a conversational, engaging style that keeps readers reading.`
                    },
                    {
                        role: 'user',
                        content: `Schreibe einen fesselnden Blog-Artikel zum Thema: "${topic}" in der Kategorie ${categoryName}.

Struktur-Anforderungen:
- Starte mit einem fesselnden ersten Absatz mit class="has-drop-cap"
- Verwende eine moderne, einzigartige Struktur mit verschiedenen Elementen:
  * H2 Überschriften mit class="mb_head" für Hauptabschnitte
  * H3 Überschriften für Unterabschnitte
  * Bilder mit Struktur: <div class="single-post-content_text_media fl-wrap"><div class="row"><div class="col-md-6"><img src="[IMAGE_1]" alt="..." class="respimg article-content-image"></div><div class="col-md-6"><p>Text...</p></div></div></div>
  * Verwende verschiedene Bild-Platzhalter: [IMAGE_1], [IMAGE_2], [IMAGE_3], [IMAGE_4] für unterschiedliche Bilder
  * Blockquotes für wichtige Zitate: <blockquote class="article-quote"><p>...</p></blockquote>
  * Listen mit class="article-list" für Bullet-Points
  * Info-Boxen: <div class="modern-info-box info"><h4>💡 Titel</h4><p>Inhalt...</p></div>

Inhalt-Anforderungen:
- 1000-1200 Wörter
- Verwende konkrete Beispiele, Zahlen und Statistiken
- Schreibe in einem persönlichen, einladenden Ton
- Baue Spannung auf und halte den Leser interessiert
- Verwende verschiedene Strukturelemente für visuelle Abwechslung
- Integriere 3-4 verschiedene Bilder-Platzhalter ([IMAGE_1], [IMAGE_2], [IMAGE_3], [IMAGE_4]) im Artikel
- Verwende verschiedene Layouts (Bild links, Bild rechts, Vollbreite)
- Füge mindestens 2 Blockquotes ein
- Füge 2-3 Info-Boxen ein (info, warning, success)
- Beende mit einem Aufruf zum Handeln

WICHTIG: Verwende NUR HTML, kein Markdown. Keine Wrapper-Divs außer den spezifizierten Strukturen. Verwende verschiedene Bild-Platzhalter für unterschiedliche Bilder.`
                    }
                ],
                max_tokens: 3000,
                temperature: 0.8
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const content = response.data.choices[0].message.content.trim();
        
        // Remove markdown code block delimiters
        let cleanedContent = content
            .replace(/^```html\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
        
        return cleanedContent;
        
    } catch (error) {
        console.error('❌ Error generating content:', error.message);
        throw error;
    }
}

// Generate slug from title
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Generate excerpt from content
function generateExcerpt(content) {
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent.substring(0, 200) + (textContent.length > 200 ? '...' : '');
}

// Delete all articles
async function deleteAllArticles() {
    try {
        console.log('\n🗑️  Deleting all articles...');
        const { error } = await supabase
            .from('articles')
            .delete()
            .neq('id', 0); // Delete all (using neq to match all)
        
        if (error) throw error;
        console.log('✅ All articles deleted successfully!');
        return true;
    } catch (error) {
        console.error('❌ Error deleting articles:', error.message);
        return false;
    }
}

// Generate 3 articles for a category
async function generateArticlesForCategory(categoryId, categoryName) {
    const topics = articleTopics[categoryId];
    const images = categoryImages[categoryId];
    const articles = [];
    
    console.log(`\n📝 Generating 3 articles for category: ${categoryName} (ID: ${categoryId})`);
    console.log('='.repeat(60));
    
    for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];
        console.log(`\n[${i + 1}/3] Generating: "${topic}"`);
        
        try {
            // Use German category name for AI generation
            const germanCategoryName = {
                1: "Technologie",
                2: "Business",
                3: "Wissenschaft",
                4: "Gesundheit",
                5: "Politik",
            }[categoryId] || categoryName;
            
            // Generate content
            const content = await generateArticleContent(topic, germanCategoryName);
            
            // Replace image placeholders with DIFFERENT images
            let finalContent = content
                .replace(/\[IMAGE_1\]/g, images.content1)
                .replace(/\[IMAGE_2\]/g, images.content2)
                .replace(/\[IMAGE_3\]/g, images.content3)
                .replace(/\[IMAGE_4\]/g, images.content4)
                .replace(/\[FEATURED_IMAGE_URL\]/g, images.content1);
            
            // Use UNIQUE featured image for each article (use index to get different image)
            const featuredImage = images.featured[i % images.featured.length];
            
                const slug = generateSlug(topic) + '-' + Date.now() + '-' + i;
                const excerpt = generateExcerpt(finalContent);
                
                // Generate tags from category name and title keywords
                const titleWords = topic.toLowerCase()
                    .split(/\s+/)
                    .filter(w => w.length > 3)
                    .slice(0, 3);
                const tags = [categoryName.toLowerCase(), ...titleWords].filter(Boolean);
                
                articles.push({
                    title: topic,
                    slug: slug,
                    excerpt: excerpt,
                    content: finalContent,
                    category_id: categoryId, // Ensure category_id is set correctly
                    category: categoryName, // Populate category column
                    tags: tags, // Generate tags automatically
                    featured_image: featuredImage,
                    featured_image_url: featuredImage,
                    // author_name will be set by the backend based on category_id
                    author_name: null, // Will be auto-assigned by backend
                    status: 'published',
                    view_count: Math.floor(Math.random() * 500),
                    meta_title: topic,
                    meta_description: excerpt,
                    meta_keywords: [categoryName],
                    published_at: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            
            console.log(`✅ Article ${i + 1} generated successfully`);
            console.log(`   Featured Image: ${featuredImage.substring(0, 60)}...`);
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            console.error(`❌ Error generating article ${i + 1}:`, error.message);
            continue;
        }
    }
    
    // Insert all articles for this category
    if (articles.length > 0) {
        console.log(`\n💾 Saving ${articles.length} articles to database...`);
        const { data, error } = await supabase
            .from('articles')
            .insert(articles)
            .select();
        
        if (error) {
            console.error(`❌ Error saving articles for ${categoryName}:`, error.message);
            console.error('Error details:', error);
            return false;
        }
        
        console.log(`✅ Successfully saved ${data.length} articles for ${categoryName}`);
        // Verify categories
        const categoryCheck = data.map(a => ({ id: a.id, category_id: a.category_id, title: a.title }));
        console.log(`📋 Category verification:`, categoryCheck.slice(0, 3));
        return true;
    }
    
    return false;
}

// Main function
async function main() {
    try {
        console.log('\n🚀 Starting Article Generation Process');
        console.log('='.repeat(60));
        
        // Step 1: Delete all articles
        const deleted = await deleteAllArticles();
        if (!deleted) {
            console.log('⚠️  Warning: Could not delete all articles. Continuing anyway...');
        }
        
        // Step 2: Generate articles for each category
        const categories = [1, 2, 3, 4, 5];
        let totalGenerated = 0;
        
        for (const categoryId of categories) {
            const categoryName = categoryNames[categoryId];
            const success = await generateArticlesForCategory(categoryId, categoryName);
            if (success) {
                totalGenerated += 10;
            }
            
            // Delay between categories
            console.log('\n⏳ Waiting 5 seconds before next category...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 Article Generation Complete!');
        console.log(`📊 Total articles generated: ${totalGenerated}`);
        console.log(`📂 Categories: ${categories.length}`);
        console.log(`📝 Articles per category: 3`);
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    if (!OPENAI_API_KEY) {
        console.error('❌ Error: OPENAI_API_KEY not found in environment variables');
        console.error('Please add OPENAI_API_KEY to your .env file');
        process.exit(1);
    }

    main()
        .then(() => {
            console.log('\n✅ Process completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Process failed:', error);
            process.exit(1);
        });
}

module.exports = { main, generateArticlesForCategory, deleteAllArticles };

