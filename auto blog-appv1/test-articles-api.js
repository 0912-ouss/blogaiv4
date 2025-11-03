const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testArticlesAPI() {
    console.log('🧪 Testing Articles API...\n');

    try {
        // Step 1: Login
        console.log('1️⃣ Logging in...');
        const loginResponse = await axios.post(`${API_URL}/admin/auth/login`, {
            email: 'admin@blog.com',
            password: 'Admin@123'
        });

        if (!loginResponse.data.success) {
            console.log('❌ Login failed!');
            return;
        }

        const token = loginResponse.data.token;
        console.log('✅ Login successful!\n');

        // Step 2: Fetch articles
        console.log('2️⃣ Fetching articles...');
        const articlesResponse = await axios.get(`${API_URL}/admin/articles`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Articles API Response:');
        console.log('   Success:', articlesResponse.data.success);
        console.log('   Total Articles:', articlesResponse.data.data?.length || 0);
        
        if (articlesResponse.data.data && articlesResponse.data.data.length > 0) {
            console.log('\n📄 Sample Article:');
            const article = articlesResponse.data.data[0];
            console.log('   ID:', article.id);
            console.log('   Title:', article.title);
            console.log('   Status:', article.status);
            console.log('   Created:', article.created_at);
        } else {
            console.log('\n⚠️  No articles found in database!');
            console.log('\n💡 To add test articles, run:');
            console.log('   INSERT INTO articles (title, content, excerpt, author_id, category_id, status) VALUES');
            console.log('   (\'Test Article\', \'Content here\', \'Excerpt\', 1, 1, \'published\');');
        }

        console.log('\n========================================');
        console.log('✅ API IS WORKING CORRECTLY!');
        console.log('========================================\n');

    } catch (error) {
        console.log('\n========================================');
        console.log('❌ ERROR TESTING API');
        console.log('========================================');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error:', error.response.data);
        } else if (error.request) {
            console.log('No response from server');
        } else {
            console.log('Error:', error.message);
        }
        console.log('========================================\n');
    }
}

testArticlesAPI();

