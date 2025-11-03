// Test creating an article via API
const axios = require('axios');

const newArticle = {
    title: "Test Article from API",
    slug: "test-article-from-api-" + Date.now(),
    content: "<div class='post-content'><h2>This is a test article</h2><p>This article was created via the API to test n8n integration.</p></div>",
    excerpt: "A test article created via API",
    category_id: 1,
    featured_image: "/images/all/1.jpg",
    author: "API Tester"
};

async function createArticle() {
    try {
        console.log('📝 Creating new article via API...\n');
        
        const response = await axios.post('http://localhost:3000/api/articles', newArticle);
        
        console.log('✅ Article created successfully!');
        console.log('📰 Article ID:', response.data.data.id);
        console.log('🔗 Article URL:', `http://localhost:3000/article.html?slug=${response.data.data.slug}`);
        console.log('\n📊 Full Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error creating article:', error.response?.data || error.message);
    }
}

createArticle();

