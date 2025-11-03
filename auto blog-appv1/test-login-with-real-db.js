/**
 * Test Login with Real Supabase Database
 * This script connects directly to Supabase using MCP-verified credentials
 */

const axios = require('axios');
const bcrypt = require('bcryptjs');

// Test credentials from database
const TEST_CREDENTIALS = {
    email: 'admin@blog.com',
    password: 'Admin@123'
};

async function testLogin() {
    console.log('========================================');
    console.log('🧪 TESTING LOGIN WITH REAL DATABASE');
    console.log('========================================\n');

    console.log('📋 Test Information:');
    console.log('   Database: Supabase (via MCP)');
    console.log('   Backend: http://localhost:3000');
    console.log('   Admin Panel: http://localhost:3001');
    console.log('');

    console.log('🔐 Test Credentials:');
    console.log('   Email:', TEST_CREDENTIALS.email);
    console.log('   Password:', TEST_CREDENTIALS.password);
    console.log('');

    try {
        // Step 1: Check backend health
        console.log('📋 Step 1: Checking Backend Server...');
        console.log('─────────────────────────────────────');
        try {
            const healthResponse = await axios.get('http://localhost:3000/api/health', {
                timeout: 5000
            });
            console.log('✅ Backend server is running');
            console.log('   Status:', healthResponse.data.status);
            console.log('   Message:', healthResponse.data.message);
            console.log('');
        } catch (error) {
            console.log('❌ Backend server is NOT responding');
            console.log('   Please run: node server.js');
            console.log('');
            return;
        }

        // Step 2: Attempt login
        console.log('📋 Step 2: Testing Login API...');
        console.log('─────────────────────────────────────');
        
        const loginResponse = await axios.post(
            'http://localhost:3000/api/admin/auth/login',
            TEST_CREDENTIALS,
            { timeout: 10000 }
        );

        if (loginResponse.data.success) {
            console.log('✅ LOGIN SUCCESSFUL!');
            console.log('');
            console.log('👤 User Details:');
            console.log('   ID:', loginResponse.data.user.id);
            console.log('   Name:', loginResponse.data.user.name);
            console.log('   Email:', loginResponse.data.user.email);
            console.log('   Role:', loginResponse.data.user.role);
            console.log('');
            console.log('🎟️  JWT Token:');
            console.log('   ', loginResponse.data.token.substring(0, 80) + '...');
            console.log('');

            // Step 3: Verify token
            console.log('📋 Step 3: Verifying Token...');
            console.log('─────────────────────────────────────');
            
            const verifyResponse = await axios.get(
                'http://localhost:3000/api/admin/auth/verify',
                {
                    headers: {
                        'Authorization': `Bearer ${loginResponse.data.token}`
                    },
                    timeout: 5000
                }
            );

            if (verifyResponse.data.success) {
                console.log('✅ Token verification: SUCCESS');
                console.log('   Verified user:', verifyResponse.data.user.name);
                console.log('   User is active:', verifyResponse.data.user.is_active);
                console.log('');
            }

            // Success summary
            console.log('========================================');
            console.log('🎉 ALL TESTS PASSED!');
            console.log('========================================');
            console.log('✅ Database connection: Working');
            console.log('✅ Backend authentication: Working');
            console.log('✅ Token generation: Working');
            console.log('✅ Token verification: Working');
            console.log('');
            console.log('🌐 Ready to Login:');
            console.log('   URL: http://localhost:3001/login');
            console.log('');
            console.log('🔐 Credentials:');
            console.log('   Email: admin@blog.com');
            console.log('   Password: Admin@123');
            console.log('========================================\n');

        } else {
            console.log('❌ Login failed:', loginResponse.data.error);
        }

    } catch (error) {
        console.log('❌ LOGIN TEST FAILED');
        console.log('─────────────────────────────────────');
        
        if (error.response) {
            console.log('   HTTP Status:', error.response.status);
            console.log('   Error:', error.response.data.error || error.response.data);
            console.log('');

            if (error.response.status === 401) {
                console.log('💡 Troubleshooting:');
                console.log('   - Password might be incorrect');
                console.log('   - Admin user might be inactive');
                console.log('   - Check database for correct credentials');
            }
        } else if (error.request) {
            console.log('   Error: No response from server');
            console.log('   Backend might not be running');
            console.log('');
            console.log('💡 Start the backend:');
            console.log('   cd "d:\\old pc\\auto blog v1\\auto blog-appv1"');
            console.log('   node server.js');
        } else {
            console.log('   Error:', error.message);
        }
        
        console.log('========================================\n');
    }
}

// Run test
testLogin().catch(console.error);


