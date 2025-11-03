// Test API article creation
const axios = require('axios');

const article = {
  "title": "The Future of AI Technology in 2025",
  "slug": "future-of-ai-technology-2025-" + Date.now(),
  "content": "<div class='post-content'><h2>Introduction</h2><p>Artificial Intelligence is revolutionizing our world in unprecedented ways. From healthcare to transportation, AI systems are becoming more sophisticated every day.</p><h3>Key Developments</h3><ul><li>Advanced neural networks</li><li>Natural language processing breakthroughs</li><li>AI-powered automation</li><li>Ethical AI frameworks</li></ul><h3>Impact on Society</h3><p>The transformation brought by AI extends far beyond technology. It's reshaping education, healthcare, and how we work.</p><h3>Conclusion</h3><p>As we move forward, responsible AI development will be crucial for humanity's future.</p></div>",
  "excerpt": "Exploring how Artificial Intelligence is transforming technology and society in 2025, from neural networks to ethical frameworks.",
  "category_id": 1,
  "featured_image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
  "author": "AI Content Generator",
  "status": "published",
  "view_count": 0
};

async function testCreateArticle() {
    console.log('🚀 Testing Article Creation via API');
    console.log('=' .repeat(60));
    console.log('\n📝 Article Data:');
    console.log('   Title:', article.title);
    console.log('   Slug:', article.slug);
    console.log('   Category ID:', article.category_id);
    console.log('   Author:', article.author);
    console.log('   Image:', article.featured_image);
    console.log('\n📡 Sending POST request to API...\n');
    
    try {
        const response = await axios.post('http://localhost:3000/api/articles', article, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ SUCCESS! Article created successfully!');
        console.log('=' .repeat(60));
        console.log('\n📊 Response Data:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log('\n🔗 View your article at:');
        console.log(`   http://localhost:3000/article.html?slug=${response.data.data.slug}`);
        console.log('\n🏠 Homepage:');
        console.log('   http://localhost:3000/index.html');
        console.log('\n=' .repeat(60));
        
    } catch (error) {
        console.error('❌ ERROR creating article!');
        console.error('=' .repeat(60));
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
        console.error('=' .repeat(60));
    }
}

testCreateArticle();

