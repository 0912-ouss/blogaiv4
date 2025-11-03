// Create ANOTHER demo article option with different topic and images
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Different image URLs for variety - DIFFERENT IMAGES FOR EACH PLACEMENT
const imageUrls = {
    featured: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80', // Technology/Work
    content1: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80', // Team/Work
    content2: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', // Data/Chart
    content3: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80', // Innovation/Network
    content4: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80', // Business/Office
};

// Generate article content using OpenAI
async function generateArticleContent(topic, categoryName) {
    try {
        console.log(`🤖 Generating fresh content for: "${topic}"...`);
        
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
        
        // Remove markdown code block delimiters (```html, ```, etc.)
        let cleanedContent = content
            .replace(/^```html\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
        
        console.log(`✅ Content generated (${cleanedContent.length} chars)`);
        return cleanedContent;
        
    } catch (error) {
        console.error('❌ Error generating content:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        throw error;
    }
}

// Generate article with new structure - OPTION 2
async function createDemoArticleOption2() {
    try {
        const topic = "Die Revolution des Remote Work: Wie KI die Zukunft der Arbeit gestaltet";
        const categoryName = "Business";
        
        console.log('\n🚀 Creating Demo Article OPTION 2 - Different Style...');
        console.log('='.repeat(60));
        console.log(`📰 Topic: "${topic}"`);
        console.log(`📂 Category: ${categoryName}`);
        console.log('='.repeat(60));

        // Generate content
        const content = await generateArticleContent(topic, categoryName);

        // Replace image placeholders with DIFFERENT images
        let finalContent = content
            .replace(/\[IMAGE_1\]/g, imageUrls.content1)
            .replace(/\[IMAGE_2\]/g, imageUrls.content2)
            .replace(/\[IMAGE_3\]/g, imageUrls.content3)
            .replace(/\[IMAGE_4\]/g, imageUrls.content4)
            .replace(/\[FEATURED_IMAGE_URL\]/g, imageUrls.content1); // Fallback for any remaining placeholders

        // Use different featured image
        const featuredImage = imageUrls.featured;

        // Create article object
        const demoArticle = {
            title: topic,
            slug: "remote-work-ki-revolution-2025-option2",
            excerpt: "Entdecken Sie, wie Künstliche Intelligenz die Art und Weise revolutioniert, wie wir arbeiten – von automatisierten Aufgaben bis hin zu intelligenten Collaboration-Tools.",
            content: finalContent,
            category_id: 2, // Business
            featured_image: featuredImage,
            featured_image_url: featuredImage,
            author_name: 'AI Blog',
            status: 'published',
            view_count: 0,
            meta_title: 'Remote Work Revolution: Wie KI die Zukunft der Arbeit gestaltet',
            meta_description: 'Erfahren Sie, wie Künstliche Intelligenz Remote Work revolutioniert und die Arbeitswelt von morgen gestaltet.',
            meta_keywords: ['Remote Work', 'KI', 'Arbeitswelt', 'Digitalisierung', 'Home Office', 'Zukunft der Arbeit'],
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Check if article already exists
        const { data: existing } = await supabase
            .from('articles')
            .select('id, slug')
            .eq('slug', demoArticle.slug)
            .single();

        if (existing) {
            console.log(`⚠️  Article with slug "${demoArticle.slug}" already exists. Updating...`);
            
            const { data, error } = await supabase
                .from('articles')
                .update({
                    title: demoArticle.title,
                    content: demoArticle.content,
                    excerpt: demoArticle.excerpt,
                    featured_image: demoArticle.featured_image,
                    featured_image_url: demoArticle.featured_image_url,
                    author_name: demoArticle.author_name,
                    meta_title: demoArticle.meta_title,
                    meta_description: demoArticle.meta_description,
                    meta_keywords: demoArticle.meta_keywords,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)
                .select();

            if (error) throw error;

            console.log(`✅ Article updated successfully!`);
            console.log(`🔗 URL: http://localhost:3000/article.html?slug=${demoArticle.slug}`);
            return data[0];
        }

        // Create new article
        const { data, error } = await supabase
            .from('articles')
            .insert([demoArticle])
            .select();

        if (error) throw error;

        console.log(`\n✅ Article created successfully!`);
        console.log(`📝 Article ID: ${data[0].id}`);
        console.log(`🔗 URL: http://localhost:3000/article.html?slug=${demoArticle.slug}`);
        console.log('\n' + '='.repeat(60));
        console.log('📋 OPTION 2 Article Features:');
        console.log('- Different topic: Remote Work & KI');
        console.log('- Different category: Business');
        console.log('- Different featured image');
        console.log('- AI-generated fresh content');
        console.log('- Modern HTML structure');
        console.log('- Varied layouts');
        console.log('- Interactive elements');
        console.log('='.repeat(60));
        console.log('\n💡 You now have 2 demo articles to compare:');
        console.log('   1. KI & Nachhaltigkeit (Technology)');
        console.log('   2. Remote Work Revolution (Business)');

        return data[0];
    } catch (error) {
        console.error('❌ Error creating demo article:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        throw error;
    }
}

// Run the script
if (require.main === module) {
    if (!OPENAI_API_KEY) {
        console.error('❌ Error: OPENAI_API_KEY not found in environment variables');
        console.error('Please add OPENAI_API_KEY to your .env file');
        process.exit(1);
    }

    createDemoArticleOption2()
        .then(() => {
            console.log('\n✅ Demo article option 2 creation completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Failed to create demo article:', error);
            process.exit(1);
        });
}

module.exports = { createDemoArticleOption2, generateArticleContent };

