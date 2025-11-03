require('dotenv').config();
const axios = require('axios');

console.log('='.repeat(60));
console.log('🧪 TESTING N8N-STYLE ARTICLE CREATION');
console.log('='.repeat(60));
console.log('');

// Simulate what n8n might be sending
const testCases = [
    {
        name: "Case 1: With slug provided (WILL FAIL if slug exists)",
        data: {
            title: "Test Article",
            slug: "test-article", // ❌ This will cause duplicate!
            content: "<div class='post-content'><p>Content</p></div>",
            excerpt: "Excerpt",
            category_id: 1,
            status: "published"
        }
    },
    {
        name: "Case 2: Without slug (WILL SUCCEED)",
        data: {
            title: "Test Article",
            // No slug provided - let backend generate it
            content: "<div class='post-content'><p>Content</p></div>",
            excerpt: "Excerpt",
            category_id: 1,
            status: "published"
        }
    },
    {
        name: "Case 3: With slug but empty (WILL SUCCEED)",
        data: {
            title: "Test Article",
            slug: "", // Empty slug - backend will generate
            content: "<div class='post-content'><p>Content</p></div>",
            excerpt: "Excerpt",
            category_id: 1,
            status: "published"
        }
    }
];

async function testCase(testCase) {
    console.log(`\n📋 ${testCase.name}`);
    console.log('   Data:', JSON.stringify(testCase.data, null, 2).substring(0, 150) + '...');
    
    try {
        const response = await axios.post('http://localhost:3000/api/articles', testCase.data);
        console.log('   ✅ SUCCESS!');
        console.log('   Generated slug:', response.data.data.slug);
        return true;
    } catch (error) {
        if (error.response?.data?.error?.includes('duplicate key')) {
            console.log('   ❌ DUPLICATE KEY ERROR!');
            console.log('   Problem: Slug already exists in database');
            console.log('   Solution: Remove "slug" field from n8n or set it to empty');
        } else {
            console.log('   ❌ ERROR:', error.response?.data?.error || error.message);
        }
        return false;
    }
}

async function runTests() {
    console.log('🔍 Checking if the problem is from n8n sending a slug...\n');
    
    for (const tc of testCases) {
        await testCase(tc);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('\n✅ Solution: In your n8n workflow:');
    console.log('   Option 1: Remove "slug" field completely');
    console.log('   Option 2: Set "slug": "" (empty string)');
    console.log('   Option 3: Set "slug": null');
    console.log('\n   Let the backend generate unique slugs automatically!');
    console.log('\n' + '='.repeat(60));
}

runTests();

