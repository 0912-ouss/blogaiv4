require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sample articles data - 10 different articles across categories
const articles = [
    {
        title: "The Future of AI Technology in 2025",
        slug: "future-of-ai-technology-2025-" + Date.now(),
        subtitle: "Exploring cutting-edge innovations shaping tomorrow",
        content: "<div class='post-content'><h2>Introduction</h2><p>Artificial Intelligence is revolutionizing our world in unprecedented ways. From healthcare to transportation, AI systems are becoming more sophisticated every day.</p><h3>Key Developments</h3><ul><li>Advanced neural networks</li><li>Natural language processing breakthroughs</li><li>AI-powered automation</li><li>Ethical AI frameworks</li></ul><h3>Impact on Society</h3><p>The transformation brought by AI extends far beyond technology. It's reshaping education, healthcare, and how we work.</p><h3>Conclusion</h3><p>As we move forward, responsible AI development will be crucial for humanity's future.</p></div>",
        excerpt: "Exploring how Artificial Intelligence is transforming technology and society in 2025, from neural networks to ethical frameworks.",
        category_id: 1,
        author_name: "AI Content Generator",
        author_id: 1,
        featured_image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
        featured_image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
        image_copyright: "© Unsplash 2025",
        tags: ["AI", "Technology", "Innovation"],
        meta_title: "The Future of AI Technology in 2025 - Complete Guide",
        meta_description: "Comprehensive guide to AI technology in 2025. Learn about the latest innovations in artificial intelligence and their impact on society.",
        meta_keywords: "AI, artificial intelligence, technology, innovation, machine learning, 2025",
        status: "published",
        view_count: 0,
        comment_count: 0,
        likes_count: 0,
        is_featured: true,
        is_trending: true,
        ai_generated: true
    },
    {
        title: "Blockchain Revolution: Transforming Business Operations",
        slug: "blockchain-revolution-business-" + (Date.now() + 1),
        subtitle: "How decentralized technology is reshaping industries",
        content: "<div class='post-content'><h2>The Blockchain Era</h2><p>Blockchain technology has moved beyond cryptocurrency to revolutionize how businesses operate. Companies worldwide are adopting this transparent and secure technology.</p><h3>Business Applications</h3><ul><li>Supply chain management</li><li>Smart contracts automation</li><li>Secure data sharing</li><li>Financial transactions</li></ul><h3>Industry Impact</h3><p>From finance to healthcare, blockchain is creating trust and efficiency in unprecedented ways. The decentralized nature ensures security and transparency.</p><h3>Future Outlook</h3><p>As technology matures, we'll see even more innovative applications transforming traditional business models.</p></div>",
        excerpt: "Discover how blockchain technology is revolutionizing business operations and creating new opportunities for innovation and growth.",
        category_id: 1,
        author_name: "Tech Innovator",
        author_id: 1,
        featured_image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80",
        featured_image_url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80",
        image_copyright: "© Unsplash 2025",
        tags: ["Blockchain", "Technology", "Business"],
        meta_title: "Blockchain Revolution in Business 2025",
        meta_description: "Explore how blockchain technology is transforming business operations and creating new opportunities.",
        meta_keywords: "blockchain, business, technology, cryptocurrency, innovation",
        status: "published",
        view_count: 0,
        comment_count: 0,
        likes_count: 0,
        is_featured: true,
        is_trending: false,
        ai_generated: true
    },
    {
        title: "5 Proven Strategies to Scale Your Startup",
        slug: "scale-startup-strategies-" + (Date.now() + 2),
        subtitle: "Essential growth tactics for modern entrepreneurs",
        content: "<div class='post-content'><h2>Growing Your Business</h2><p>Scaling a startup requires careful planning and execution. These proven strategies have helped countless entrepreneurs achieve sustainable growth.</p><h3>Strategy 1: Focus on Core Competencies</h3><p>Identify what makes your business unique and double down on those strengths. Don't try to be everything to everyone.</p><h3>Strategy 2: Build a Strong Team</h3><p>Your team is your greatest asset. Invest in hiring, training, and retaining top talent who share your vision.</p><h3>Strategy 3: Leverage Technology</h3><p>Automate repetitive tasks and use data analytics to make informed decisions. Technology can be a force multiplier.</p><h3>Strategy 4: Customer-Centric Approach</h3><p>Listen to your customers and iterate based on feedback. Happy customers become your best advocates.</p><h3>Strategy 5: Secure Funding Wisely</h3><p>Whether bootstrapping or seeking investment, manage your finances carefully and plan for the long term.</p></div>",
        excerpt: "Learn five essential strategies that successful startups use to scale their operations and achieve sustainable growth.",
        category_id: 2,
        author_name: "Business Strategist",
        author_id: 1,
        featured_image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80",
        featured_image_url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80",
        image_copyright: "© Unsplash 2025",
        tags: ["Business", "Startup", "Growth", "Entrepreneurship"],
        meta_title: "5 Proven Strategies to Scale Your Startup Successfully",
        meta_description: "Discover essential growth tactics and strategies for scaling your startup effectively.",
        meta_keywords: "startup, business growth, entrepreneurship, scaling, strategy",
        status: "published",
        view_count: 0,
        comment_count: 0,
        likes_count: 0,
        is_featured: false,
        is_trending: true,
        ai_generated: true
    },
    {
        title: "Sustainable Living: Simple Steps to Reduce Your Carbon Footprint",
        slug: "sustainable-living-carbon-footprint-" + (Date.now() + 3),
        subtitle: "Practical tips for an eco-friendly lifestyle",
        content: "<div class='post-content'><h2>Living Sustainably</h2><p>Climate change is one of the biggest challenges of our time. But every individual can make a difference through conscious lifestyle choices.</p><h3>Energy Conservation</h3><ul><li>Switch to LED bulbs</li><li>Use renewable energy sources</li><li>Optimize home insulation</li><li>Unplug unused devices</li></ul><h3>Sustainable Transportation</h3><p>Consider walking, cycling, or using public transport. Electric vehicles are becoming more accessible and affordable.</p><h3>Conscious Consumption</h3><p>Buy local products, reduce plastic use, and support sustainable brands. Every purchase is a vote for the world you want.</p><h3>Food Choices</h3><p>Reduce meat consumption, minimize food waste, and grow your own vegetables if possible.</p></div>",
        excerpt: "Practical tips and strategies for adopting a sustainable lifestyle and reducing your environmental impact.",
        category_id: 3,
        author_name: "Eco Warrior",
        author_id: 1,
        featured_image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
        featured_image_url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
        image_copyright: "© Unsplash 2025",
        tags: ["Lifestyle", "Sustainability", "Environment", "Green Living"],
        meta_title: "Sustainable Living Guide - Reduce Your Carbon Footprint",
        meta_description: "Learn practical steps to live more sustainably and reduce your environmental impact.",
        meta_keywords: "sustainable living, carbon footprint, eco-friendly, green lifestyle",
        status: "published",
        view_count: 0,
        comment_count: 0,
        likes_count: 0,
        is_featured: false,
        is_trending: false,
        ai_generated: true
    },
    {
        title: "Olympic Champions: Training Secrets of Elite Athletes",
        slug: "olympic-training-secrets-" + (Date.now() + 4),
        subtitle: "Inside the rigorous preparation for peak performance",
        content: "<div class='post-content'><h2>The Path to Excellence</h2><p>Olympic athletes represent the pinnacle of human athletic achievement. Their success comes from years of dedicated training and mental preparation.</p><h3>Physical Training</h3><ul><li>Periodization and progressive overload</li><li>Sport-specific skill development</li><li>Strength and conditioning programs</li><li>Recovery and injury prevention</li></ul><h3>Mental Preparation</h3><p>Champions develop mental toughness through visualization, meditation, and working with sports psychologists.</p><h3>Nutrition and Recovery</h3><p>Elite athletes follow precise nutrition plans and prioritize sleep and recovery as much as training itself.</p><h3>The Winning Mindset</h3><p>Success at the highest level requires unwavering dedication, resilience, and the ability to perform under pressure.</p></div>",
        excerpt: "Discover the training methods, mental preparation, and lifestyle choices that make Olympic athletes champions.",
        category_id: 4,
        author_name: "Sports Analyst",
        author_id: 1,
        featured_image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
        featured_image_url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
        image_copyright: "© Unsplash 2025",
        tags: ["Sports", "Olympics", "Training", "Athletes"],
        meta_title: "Olympic Training Secrets - How Champions Prepare",
        meta_description: "Explore the training methods and mental preparation of Olympic champions.",
        meta_keywords: "olympics, sports training, athletes, fitness, performance",
        status: "published",
        view_count: 0,
        comment_count: 0,
        likes_count: 0,
        is_featured: false,
        is_trending: false,
        ai_generated: true
    },
    {
        title: "Mental Health in the Digital Age: Finding Balance",
        slug: "mental-health-digital-age-" + (Date.now() + 5),
        subtitle: "Navigating wellness in a hyperconnected world",
        content: "<div class='post-content'><h2>The Digital Dilemma</h2><p>While technology brings incredible benefits, it also presents new challenges for mental health. Finding balance is essential for well-being.</p><h3>Digital Detox Strategies</h3><ul><li>Set boundaries for screen time</li><li>Create tech-free zones at home</li><li>Practice mindful social media use</li><li>Schedule regular offline activities</li></ul><h3>Stress Management</h3><p>Incorporate meditation, exercise, and quality sleep into your routine. These fundamentals remain crucial despite technological changes.</p><h3>Building Real Connections</h3><p>Prioritize face-to-face interactions and meaningful relationships. Virtual connections can supplement but shouldn't replace real human contact.</p><h3>Seeking Help</h3><p>Mental health support is more accessible than ever through teletherapy and online resources. Don't hesitate to reach out.</p></div>",
        excerpt: "Learn how to maintain mental wellness and find balance in our increasingly digital world.",
        category_id: 5,
        author_name: "Wellness Expert",
        author_id: 1,
        featured_image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80",
        featured_image_url: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80",
        image_copyright: "© Unsplash 2025",
        tags: ["Health", "Mental Health", "Wellness", "Digital Balance"],
        meta_title: "Mental Health in the Digital Age - Finding Balance",
        meta_description: "Discover strategies for maintaining mental wellness in our hyperconnected digital world.",
        meta_keywords: "mental health, digital wellness, stress management, mindfulness",
        status: "published",
        view_count: 0,
        comment_count: 0,
        likes_count: 0,
        is_featured: true,
        is_trending: false,
        ai_generated: true
    },
    {
        title: "Remote Work Revolution: The New Normal",
        slug: "remote-work-revolution-" + (Date.now() + 6),
        subtitle: "How distributed teams are reshaping the workplace",
        content: "<div class='post-content'><h2>The Future of Work</h2><p>The shift to remote work has fundamentally changed how companies operate. This isn't just a temporary trend—it's the new reality.</p><h3>Benefits of Remote Work</h3><ul><li>Increased flexibility and work-life balance</li><li>Access to global talent pools</li><li>Reduced overhead costs</li><li>Environmental benefits from less commuting</li></ul><h3>Challenges to Overcome</h3><p>Communication, collaboration, and maintaining company culture require new approaches and tools in a distributed environment.</p><h3>Best Practices</h3><p>Successful remote teams use async communication, clear documentation, and regular video check-ins to stay connected.</p><h3>The Hybrid Future</h3><p>Many companies are adopting hybrid models, combining the best of remote and in-office work.</p></div>",
        excerpt: "Explore how remote work is transforming business and what it means for the future of employment.",
        category_id: 2,
        author_name: "Future of Work Analyst",
        author_id: 1,
        featured_image: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=1200&q=80",
        featured_image_url: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=1200&q=80",
        image_copyright: "© Unsplash 2025",
        tags: ["Business", "Remote Work", "Future", "Workplace"],
        meta_title: "Remote Work Revolution - The New Normal Workplace",
        meta_description: "Discover how remote work is reshaping business and the future of employment.",
        meta_keywords: "remote work, distributed teams, future of work, workplace, business",
        status: "published",
        view_count: 0,
        comment_count: 0,
        likes_count: 0,
        is_featured: false,
        is_trending: true,
        ai_generated: true
    },
    {
        title: "Quantum Computing: The Next Technological Frontier",
        slug: "quantum-computing-frontier-" + (Date.now() + 7),
        subtitle: "Understanding the technology that will change everything",
        content: "<div class='post-content'><h2>Beyond Classical Computing</h2><p>Quantum computing represents a paradigm shift in computational power. While still in early stages, its potential is revolutionary.</p><h3>What is Quantum Computing?</h3><p>Unlike classical computers that use bits (0 or 1), quantum computers use qubits that can exist in multiple states simultaneously through superposition.</p><h3>Practical Applications</h3><ul><li>Drug discovery and molecular modeling</li><li>Cryptography and security</li><li>Financial modeling and optimization</li><li>Weather prediction and climate modeling</li></ul><h3>Current Challenges</h3><p>Quantum computers are extremely sensitive to environmental interference and require near-absolute-zero temperatures to operate.</p><h3>The Road Ahead</h3><p>While practical quantum computers are still years away, research progress is accelerating rapidly.</p></div>",
        excerpt: "Dive into quantum computing and discover how this revolutionary technology will transform science and industry.",
        category_id: 1,
        author_name: "Quantum Researcher",
        author_id: 1,
        featured_image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80",
        featured_image_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80",
        image_copyright: "© Unsplash 2025",
        tags: ["Technology", "Quantum", "Science", "Innovation"],
        meta_title: "Quantum Computing - The Next Technological Frontier",
        meta_description: "Explore quantum computing and its potential to revolutionize science and technology.",
        meta_keywords: "quantum computing, technology, science, innovation, future tech",
        status: "published",
        view_count: 0,
        comment_count: 0,
        likes_count: 0,
        is_featured: false,
        is_trending: false,
        ai_generated: true
    },
    {
        title: "The Mediterranean Diet: A Blueprint for Longevity",
        slug: "mediterranean-diet-longevity-" + (Date.now() + 8),
        subtitle: "Science-backed nutrition for a healthier, longer life",
        content: "<div class='post-content'><h2>Ancient Wisdom, Modern Science</h2><p>The Mediterranean diet has been extensively studied and proven to promote longevity and reduce chronic disease risk.</p><h3>Core Principles</h3><ul><li>Abundant fruits and vegetables</li><li>Whole grains and legumes</li><li>Olive oil as primary fat source</li><li>Moderate fish and poultry</li><li>Limited red meat and sweets</li></ul><h3>Health Benefits</h3><p>Research shows this diet reduces heart disease, type 2 diabetes, and cognitive decline. It's not just about food—it's a lifestyle.</p><h3>Practical Implementation</h3><p>Start by replacing butter with olive oil, eating more vegetables, and choosing whole grains over refined carbohydrates.</p><h3>Beyond the Plate</h3><p>The Mediterranean lifestyle includes regular physical activity, social meals, and stress reduction—all contributing to wellbeing.</p></div>",
        excerpt: "Discover how the Mediterranean diet can improve your health and potentially extend your lifespan.",
        category_id: 5,
        author_name: "Nutrition Scientist",
        author_id: 1,
        featured_image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
        featured_image_url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
        image_copyright: "© Unsplash 2025",
        tags: ["Health", "Nutrition", "Diet", "Longevity"],
        meta_title: "Mediterranean Diet Guide - Blueprint for Longevity",
        meta_description: "Learn how the Mediterranean diet promotes health and longevity through science-backed nutrition.",
        meta_keywords: "mediterranean diet, nutrition, health, longevity, healthy eating",
        status: "published",
        view_count: 0,
        comment_count: 0,
        likes_count: 0,
        is_featured: false,
        is_trending: false,
        ai_generated: true
    },
    {
        title: "Hidden Gems: Off-the-Beaten-Path Travel Destinations 2025",
        slug: "hidden-travel-destinations-2025-" + (Date.now() + 9),
        subtitle: "Discover amazing places before the crowds arrive",
        content: "<div class='post-content'><h2>Undiscovered Paradise</h2><p>While everyone flocks to popular tourist spots, these hidden gems offer authentic experiences without the crowds.</p><h3>1. Faroe Islands, Denmark</h3><p>Dramatic cliffs, pristine nature, and charming villages make this Nordic archipelago a photographer's dream.</p><h3>2. Valletta, Malta</h3><p>Rich history, stunning architecture, and Mediterranean charm in one of Europe's smallest capitals.</p><h3>3. Raja Ampat, Indonesia</h3><p>Paradise for divers with the world's most biodiverse marine life and untouched coral reefs.</p><h3>4. Tbilisi, Georgia</h3><p>Ancient culture meets modern creativity in this affordable and incredibly hospitable city.</p><h3>5. Azores, Portugal</h3><p>Volcanic islands with hot springs, crater lakes, and opportunities for whale watching.</p><h3>Travel Tips</h3><p>Visit during shoulder seasons, respect local cultures, and support sustainable tourism initiatives.</p></div>",
        excerpt: "Explore incredible travel destinations that most tourists haven't discovered yet. Your next adventure awaits!",
        category_id: 6,
        author_name: "Travel Explorer",
        author_id: 1,
        featured_image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
        featured_image_url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
        image_copyright: "© Unsplash 2025",
        tags: ["Travel", "Adventure", "Tourism", "Hidden Gems"],
        meta_title: "Hidden Travel Destinations 2025 - Off-the-Beaten-Path",
        meta_description: "Discover amazing off-the-beaten-path travel destinations for your next adventure in 2025.",
        meta_keywords: "travel, destinations, hidden gems, adventure, tourism, 2025",
        status: "published",
        view_count: 0,
        comment_count: 0,
        likes_count: 0,
        is_featured: false,
        is_trending: false,
        ai_generated: true
    }
];

async function deleteAllArticles() {
    console.log('🗑️  Deleting all existing articles...');
    
    try {
        const { error } = await supabase
            .from('articles')
            .delete()
            .neq('id', 0); // Delete all (id != 0 means all records)

        if (error) {
            console.error('❌ Error deleting articles:', error);
            return false;
        }

        console.log('✅ All articles deleted successfully!\n');
        return true;
    } catch (error) {
        console.error('❌ Exception:', error);
        return false;
    }
}

async function createArticles() {
    console.log('📝 Creating 10 new articles...\n');
    
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        console.log(`📰 [${i + 1}/10] Creating: "${article.title}"...`);

        try {
            const { data, error } = await supabase
                .from('articles')
                .insert([article])
                .select()
                .single();

            if (error) {
                console.error(`   ❌ Failed: ${error.message}`);
                failCount++;
            } else {
                console.log(`   ✅ Created successfully! ID: ${data.id}`);
                successCount++;
            }
        } catch (error) {
            console.error(`   ❌ Exception: ${error.message}`);
            failCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully created: ${successCount} articles`);
    console.log(`❌ Failed: ${failCount} articles`);
    console.log('='.repeat(60));
}

async function verifyArticles() {
    console.log('\n🔍 Verifying created articles...\n');

    try {
        const { data, error } = await supabase
            .from('articles')
            .select('id, title, category_id, is_featured, is_trending')
            .order('id', { ascending: true });

        if (error) {
            console.error('❌ Error:', error);
            return;
        }

        console.log('📋 Articles in database:');
        console.log('─'.repeat(80));
        data.forEach((article, index) => {
            const featured = article.is_featured ? '⭐' : '  ';
            const trending = article.is_trending ? '🔥' : '  ';
            console.log(`${index + 1}. ${featured}${trending} [ID:${article.id}] ${article.title} (Category: ${article.category_id})`);
        });
        console.log('─'.repeat(80));
        console.log(`Total articles: ${data.length}`);

    } catch (error) {
        console.error('❌ Exception:', error);
    }
}

async function main() {
    console.log('='.repeat(60));
    console.log('🚀 ARTICLE GENERATION SCRIPT');
    console.log('='.repeat(60));
    console.log('');

    // Step 1: Delete all articles
    const deleted = await deleteAllArticles();
    if (!deleted) {
        console.error('⚠️  Failed to delete articles. Aborting...');
        process.exit(1);
    }

    // Step 2: Create 10 new articles
    await createArticles();

    // Step 3: Verify
    await verifyArticles();

    console.log('\n✅ All done! Check your database and homepage! 🎉');
    console.log('🌐 Visit: http://localhost:3000/index.html\n');
}

// Run the script
main()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });

