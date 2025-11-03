const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testAdminLogin() {
    console.log('🧪 Testing Admin Login...\n');

    const credentials = {
        email: 'admin@blog.com',
        password: 'Admin@123'
    };

    try {
        console.log('📧 Email:', credentials.email);
        console.log('🔑 Password:', credentials.password);
        console.log('\n🔄 Sending login request...\n');

        // Test login
        const response = await axios.post(`${API_URL}/admin/auth/login`, credentials);

        if (response.data.success) {
            console.log('========================================');
            console.log('✅ LOGIN SUCCESSFUL!');
            console.log('========================================');
            console.log('👤 User Info:');
            console.log('   ID:', response.data.user.id);
            console.log('   Name:', response.data.user.name);
            console.log('   Email:', response.data.user.email);
            console.log('   Role:', response.data.user.role);
            console.log('');
            console.log('🎟️  Token:', response.data.token.substring(0, 50) + '...');
            console.log('========================================\n');

            // Test token verification
            console.log('🧪 Testing token verification...\n');
            const verifyResponse = await axios.get(`${API_URL}/admin/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${response.data.token}`
                }
            });

            if (verifyResponse.data.success) {
                console.log('✅ Token verification: SUCCESS');
                console.log('👤 Verified User:', verifyResponse.data.user.name);
                console.log('');
            }

            console.log('========================================');
            console.log('🎉 ALL TESTS PASSED!');
            console.log('========================================');
            console.log('🌐 You can now login at:');
            console.log('   http://localhost:3001/login');
            console.log('========================================\n');

        } else {
            console.log('❌ Login failed:', response.data.error);
        }

    } catch (error) {
        console.log('========================================');
        console.log('❌ LOGIN TEST FAILED');
        console.log('========================================');
        
        if (error.response) {
            console.log('📛 Status:', error.response.status);
            console.log('💬 Error:', error.response.data.error || error.response.data);
        } else if (error.request) {
            console.log('💬 No response from server');
            console.log('🔍 Make sure the backend server is running on port 3000');
        } else {
            console.log('💬 Error:', error.message);
        }
        console.log('========================================\n');

        console.log('📋 Troubleshooting:');
        console.log('1. Run: node create-admin-user.js');
        console.log('2. Make sure backend is running: npm start');
        console.log('3. Check Supabase database is set up\n');
    }
}

// Run the test
testAdminLogin();

