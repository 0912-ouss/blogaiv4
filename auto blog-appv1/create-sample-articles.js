// Create sample articles without AI generation
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sample articles for each category
const articles = [
    // Technology (category 1)
    {
        title: 'The Future of Artificial Intelligence in 2025',
        slug: 'future-of-ai-2025-' + Date.now(),
        content: '<div class="post-content"><h2>The AI Revolution Continues</h2><p>Artificial Intelligence is transforming every aspect of our lives in 2025. From healthcare to transportation, AI systems are becoming more sophisticated and integrated into our daily routines.</p><h3>Key Developments</h3><ul><li>Advanced neural networks with human-like reasoning</li><li>AI-powered automation in industries</li><li>Ethical AI frameworks and regulations</li><li>Personalized AI assistants for everyone</li></ul><h3>Impact on Society</h3><p>The impact of AI extends beyond technology. It\'s reshaping education, healthcare, and how we work. Companies are investing billions in AI research, leading to breakthrough innovations.</p><h3>The Road Ahead</h3><p>As we move forward, the focus is on creating responsible AI that benefits humanity while addressing concerns about privacy, job displacement, and ethical use.</p></div>',
        excerpt: 'Exploring how Artificial Intelligence is revolutionizing technology and society in 2025, from advanced neural networks to ethical AI frameworks.',
        category_id: 1,
        featured_image: '/images/all/1.jpg',
        author: 'Tech Reporter',
        status: 'published',
        view_count: 245
    },
    {
        title: 'Quantum Computing: Breaking New Boundaries',
        slug: 'quantum-computing-boundaries-' + Date.now(),
        content: '<div class="post-content"><h2>Enter the Quantum Era</h2><p>Quantum computing is no longer science fiction. Recent breakthroughs have brought us closer to practical quantum computers that can solve problems impossible for classical computers.</p><h3>What is Quantum Computing?</h3><p>Quantum computers use quantum bits (qubits) that can exist in multiple states simultaneously, enabling massive parallel processing capabilities.</p><h3>Recent Breakthroughs</h3><ul><li>Quantum supremacy achieved by major tech companies</li><li>Error correction methods improving stability</li><li>New quantum algorithms for drug discovery</li><li>Cloud-based quantum computing services</li></ul><h3>Real-World Applications</h3><p>From cryptography to drug development, quantum computing promises to revolutionize multiple industries. Scientists are already using quantum computers to simulate complex molecular interactions.</p></div>',
        excerpt: 'Discover the latest breakthroughs in quantum computing and how this revolutionary technology is changing the future of computation.',
        category_id: 1,
        featured_image: '/images/bg/1.jpg',
        author: 'Science Editor',
        status: 'published',
        view_count: 189
    },
    
    // Business (category 2)
    {
        title: 'Top Business Strategies for Startup Success',
        slug: 'startup-success-strategies-' + Date.now(),
        content: '<div class="post-content"><h2>Building a Successful Startup</h2><p>Starting a business in today\'s competitive landscape requires more than just a good idea. It demands strategic planning, execution, and adaptability.</p><h3>Essential Strategies</h3><ul><li><strong>Customer-First Approach:</strong> Understanding and solving real customer problems</li><li><strong>Lean Operations:</strong> Starting small and scaling efficiently</li><li><strong>Data-Driven Decisions:</strong> Using analytics to guide business choices</li><li><strong>Strong Team Building:</strong> Hiring the right people for growth</li></ul><h3>Financial Planning</h3><p>Proper financial management is crucial. Create detailed budgets, monitor cash flow, and plan for sustainability from day one.</p><h3>Market Positioning</h3><p>Identify your unique value proposition and communicate it effectively to stand out in the market.</p></div>',
        excerpt: 'Learn the essential strategies for building and scaling a successful startup in today\'s competitive business environment.',
        category_id: 2,
        featured_image: '/images/all/1.jpg',
        author: 'Business Analyst',
        status: 'published',
        view_count: 312
    },
    {
        title: 'E-commerce Trends Reshaping Retail Industry',
        slug: 'ecommerce-trends-retail-' + Date.now(),
        content: '<div class="post-content"><h2>The E-commerce Revolution</h2><p>The retail industry is undergoing a massive transformation. E-commerce is no longer just an alternative to physical stores—it\'s become the primary shopping method for millions.</p><h3>Major Trends for 2025</h3><ul><li>AI-powered personalization engines</li><li>Social commerce integration</li><li>Sustainable and ethical shopping</li><li>Augmented reality try-before-you-buy</li><li>Voice commerce and smart assistants</li></ul><h3>Mobile-First Shopping</h3><p>With over 70% of online shopping happening on mobile devices, businesses must optimize for mobile experiences.</p><h3>The Future of Retail</h3><p>Traditional retailers are adopting omnichannel strategies, blending online and offline experiences to meet customer expectations.</p></div>',
        excerpt: 'Explore the major e-commerce trends transforming the retail industry and how businesses are adapting to digital-first consumers.',
        category_id: 2,
        featured_image: '/images/bg/2.jpg',
        author: 'Retail Expert',
        status: 'published',
        view_count: 278
    },
    
    // Science (category 3)
    {
        title: 'Breakthrough in Renewable Energy Research',
        slug: 'renewable-energy-breakthrough-' + Date.now(),
        content: '<div class="post-content"><h2>Clean Energy Revolution</h2><p>Scientists have achieved a major breakthrough in renewable energy that could change how we power our world. New solar panel technology promises unprecedented efficiency.</p><h3>The Innovation</h3><p>Researchers developed a new type of perovskite solar cell that achieves 35% efficiency—a significant improvement over current technology.</p><h3>Key Features</h3><ul><li>Higher energy conversion rates</li><li>Lower manufacturing costs</li><li>Longer lifespan and durability</li><li>Environmentally friendly materials</li></ul><h3>Global Impact</h3><p>This breakthrough could accelerate the transition to renewable energy, making solar power more accessible and affordable worldwide.</p><h3>Next Steps</h3><p>The technology is moving from lab to commercial production, with pilot projects planned in several countries.</p></div>',
        excerpt: 'Scientists achieve major breakthrough in solar technology that could revolutionize renewable energy and combat climate change.',
        category_id: 3,
        featured_image: '/images/all/1.jpg',
        author: 'Science Writer',
        status: 'published',
        view_count: 421
    },
    {
        title: 'Space Exploration: Mars Mission Updates',
        slug: 'mars-mission-updates-' + Date.now(),
        content: '<div class="post-content"><h2>Journey to the Red Planet</h2><p>The latest Mars mission has sent back remarkable data that\'s reshaping our understanding of the Red Planet and its potential for supporting human life.</p><h3>Key Discoveries</h3><ul><li>Evidence of ancient water systems</li><li>Potential biosignatures in rock samples</li><li>Underground ice deposits mapped</li><li>Radiation levels measured for human missions</li></ul><h3>Mission Progress</h3><p>The rover has covered over 20 kilometers, collecting samples and conducting experiments that will inform future human missions to Mars.</p><h3>Human Mission Timeline</h3><p>Space agencies are planning crewed missions to Mars within the next decade, with infrastructure development already underway.</p></div>',
        excerpt: 'Latest updates from Mars exploration missions reveal exciting discoveries that bring us closer to understanding the Red Planet.',
        category_id: 3,
        featured_image: '/images/bg/1.jpg',
        author: 'Space Correspondent',
        status: 'published',
        view_count: 395
    },
    
    // Health (category 4)
    {
        title: 'Revolutionary Health Tech Innovations',
        slug: 'health-tech-innovations-' + Date.now(),
        content: '<div class="post-content"><h2>The Future of Healthcare</h2><p>Healthcare technology is advancing at an unprecedented pace, bringing new tools and treatments that are saving lives and improving quality of care.</p><h3>Latest Innovations</h3><ul><li><strong>AI Diagnostics:</strong> Machine learning algorithms detecting diseases earlier</li><li><strong>Telemedicine:</strong> Remote healthcare becoming mainstream</li><li><strong>Wearable Health Monitors:</strong> Continuous health tracking</li><li><strong>Personalized Medicine:</strong> Treatments tailored to genetic profiles</li></ul><h3>Impact on Patients</h3><p>These technologies are making healthcare more accessible, affordable, and effective. Patients can now monitor their health in real-time and receive instant medical advice.</p><h3>The Road Ahead</h3><p>As technology continues to evolve, we\'re moving toward a future where preventive care and early detection become the norm.</p></div>',
        excerpt: 'Discover the revolutionary health tech innovations transforming healthcare delivery and improving patient outcomes worldwide.',
        category_id: 4,
        featured_image: '/images/all/1.jpg',
        author: 'Health Reporter',
        status: 'published',
        view_count: 356
    },
    {
        title: 'Mental Health Awareness in Modern Society',
        slug: 'mental-health-awareness-' + Date.now(),
        content: '<div class="post-content"><h2>Breaking the Stigma</h2><p>Mental health awareness has grown significantly in recent years, but there\'s still work to be done. Understanding and addressing mental health is crucial for overall well-being.</p><h3>Common Mental Health Challenges</h3><ul><li>Anxiety and stress management</li><li>Depression and mood disorders</li><li>Work-life balance issues</li><li>Social isolation effects</li></ul><h3>Available Resources</h3><p>Numerous resources are now available, from therapy apps to support groups, making mental health support more accessible than ever.</p><h3>Self-Care Strategies</h3><p>Regular exercise, meditation, proper sleep, and social connections all play vital roles in maintaining mental health.</p><h3>Seeking Help</h3><p>Remember, seeking professional help is a sign of strength, not weakness. Mental health professionals can provide valuable support and guidance.</p></div>',
        excerpt: 'Understanding the importance of mental health awareness and available resources for support in modern society.',
        category_id: 4,
        featured_image: '/images/bg/2.jpg',
        author: 'Wellness Coach',
        status: 'published',
        view_count: 429
    },
    
    // Politics (category 5)
    {
        title: 'Global Climate Policy Changes 2025',
        slug: 'climate-policy-changes-2025-' + Date.now(),
        content: '<div class="post-content"><h2>A New Era of Climate Action</h2><p>2025 marks a turning point in global climate policy. Countries worldwide are implementing aggressive measures to combat climate change and transition to sustainable economies.</p><h3>Major Policy Shifts</h3><ul><li>Carbon pricing mechanisms expanding</li><li>Renewable energy subsidies increasing</li><li>Fossil fuel phase-out timelines accelerating</li><li>International cooperation strengthening</li></ul><h3>Economic Implications</h3><p>The transition to a green economy is creating new job opportunities while transforming traditional industries. Investment in clean energy is at an all-time high.</p><h3>Challenges Ahead</h3><p>Despite progress, challenges remain in balancing economic growth with environmental protection, particularly in developing nations.</p><h3>The Path Forward</h3><p>Success requires continued commitment from governments, businesses, and individuals to reduce emissions and build a sustainable future.</p></div>',
        excerpt: 'Examining the major global climate policy changes in 2025 and their impact on environmental protection and economic development.',
        category_id: 5,
        featured_image: '/images/all/1.jpg',
        author: 'Political Analyst',
        status: 'published',
        view_count: 287
    },
    {
        title: 'Digital Democracy and Voting Systems',
        slug: 'digital-democracy-voting-' + Date.now(),
        content: '<div class="post-content"><h2>Modernizing Democratic Processes</h2><p>Digital technology is transforming how citizens participate in democracy. From online voting to digital civic engagement platforms, the future of democracy is increasingly digital.</p><h3>Digital Voting Benefits</h3><ul><li>Increased accessibility for all voters</li><li>Higher voter turnout potential</li><li>Faster result tabulation</li><li>Reduced costs for election administration</li></ul><h3>Security Concerns</h3><p>Ensuring the security and integrity of digital voting systems is paramount. Blockchain technology and advanced encryption are being explored as solutions.</p><h3>Civic Engagement 2.0</h3><p>Digital platforms are enabling citizens to participate more directly in policy discussions and decision-making processes beyond just voting.</p><h3>Global Adoption</h3><p>Several countries are piloting digital voting systems, with early results showing promise for broader implementation.</p></div>',
        excerpt: 'How digital technology is revolutionizing democratic processes and citizen engagement in the modern political landscape.',
        category_id: 5,
        featured_image: '/images/bg/1.jpg',
        author: 'Democracy Expert',
        status: 'published',
        view_count: 198
    }
];

async function createArticles() {
    console.log('🚀 Creating sample articles...\n');
    console.log('=' .repeat(60));
    
    let successCount = 0;
    let failCount = 0;
    
    for (const article of articles) {
        try {
            console.log(`\n📝 Creating: "${article.title}"`);
            
            const { data, error } = await supabase
                .from('articles')
                .insert([article])
                .select();
            
            if (error) {
                console.error(`❌ Error: ${error.message}`);
                failCount++;
            } else {
                console.log(`✅ Created successfully! (ID: ${data[0].id})`);
                successCount++;
            }
            
            // Small delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
            failCount++;
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully created: ${successCount} articles`);
    console.log(`❌ Failed: ${failCount} articles`);
    console.log(`📝 Total attempts: ${articles.length} articles`);
    console.log('='.repeat(60));
    console.log('\n🎉 Done! Check your blog at: http://localhost:3000/index.html\n');
}

createArticles()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });

