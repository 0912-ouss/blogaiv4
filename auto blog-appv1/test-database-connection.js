const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const API_URL = 'http://localhost:3000/api';

// Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDatabaseConnection() {
    console.log('========================================');
    console.log('🧪 DATABASE & LOGIN CONNECTION TEST');
    console.log('========================================\n');

    let allTestsPassed = true;

    // TEST 1: Environment Variables
    console.log('📋 TEST 1: Environment Variables');
    console.log('─────────────────────────────────────');
    if (process.env.SUPABASE_URL) {
        console.log('✅ SUPABASE_URL:', process.env.SUPABASE_URL.substring(0, 30) + '...');
    } else {
        console.log('❌ SUPABASE_URL: Missing!');
        allTestsPassed = false;
    }
    
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log('✅ SUPABASE_SERVICE_ROLE_KEY: Set (length:', process.env.SUPABASE_SERVICE_ROLE_KEY.length + ')');
    } else {
        console.log('❌ SUPABASE_SERVICE_ROLE_KEY: Missing!');
        allTestsPassed = false;
    }
    
    if (process.env.JWT_SECRET) {
        console.log('✅ JWT_SECRET: Set (length:', process.env.JWT_SECRET.length + ')');
    } else {
        console.log('❌ JWT_SECRET: Missing!');
        allTestsPassed = false;
    }
    console.log('');

    // TEST 2: Supabase Connection
    console.log('📋 TEST 2: Supabase Database Connection');
    console.log('─────────────────────────────────────');
    try {
        const { data, error } = await supabase
            .from('admin_users')
            .select('count')
            .limit(1);
        
        if (error) throw error;
        console.log('✅ Database connection: SUCCESS');
        console.log('');
    } catch (error) {
        console.log('❌ Database connection: FAILED');
        console.log('   Error:', error.message);
        console.log('');
        allTestsPassed = false;
    }

    // TEST 3: Check admin_users table
    console.log('📋 TEST 3: Admin Users Table');
    console.log('─────────────────────────────────────');
    try {
        const { data: users, error } = await supabase
            .from('admin_users')
            .select('id, email, name, role, is_active, created_at')
            .limit(10);
        
        if (error) throw error;
        
        if (users && users.length > 0) {
            console.log('✅ Found', users.length, 'admin user(s)');
            console.log('');
            users.forEach((user, index) => {
                console.log(`   User ${index + 1}:`);
                console.log('   ├─ ID:', user.id);
                console.log('   ├─ Email:', user.email);
                console.log('   ├─ Name:', user.name);
                console.log('   ├─ Role:', user.role);
                console.log('   ├─ Active:', user.is_active ? '✅' : '❌');
                console.log('   └─ Created:', new Date(user.created_at).toLocaleDateString());
                console.log('');
            });
        } else {
            console.log('⚠️  No admin users found in database');
            console.log('   Run: node create-admin-user.js');
            console.log('');
            allTestsPassed = false;
        }
    } catch (error) {
        console.log('❌ Failed to query admin_users table');
        console.log('   Error:', error.message);
        console.log('   Make sure to run: admin-database-setup.sql');
        console.log('');
        allTestsPassed = false;
    }

    // TEST 4: Test Backend Server Connectivity
    console.log('📋 TEST 4: Backend Server Connection');
    console.log('─────────────────────────────────────');
    try {
        const response = await axios.get(`${API_URL}/health`, {
            timeout: 5000
        });
        
        if (response.data.status === 'OK') {
            console.log('✅ Backend server: RUNNING');
            console.log('   URL:', API_URL);
            console.log('   Status:', response.data.message);
            console.log('');
        }
    } catch (error) {
        console.log('❌ Backend server: NOT RESPONDING');
        if (error.code === 'ECONNREFUSED') {
            console.log('   Error: Connection refused');
            console.log('   Make sure to run: node server.js');
        } else {
            console.log('   Error:', error.message);
        }
        console.log('');
        allTestsPassed = false;
    }

    // TEST 5: Test Admin Login API
    console.log('📋 TEST 5: Admin Login API Test');
    console.log('─────────────────────────────────────');
    
    const credentials = {
        email: 'admin@blog.com',
        password: 'Admin@123'
    };

    try {
        console.log('📧 Testing credentials:');
        console.log('   Email:', credentials.email);
        console.log('   Password:', credentials.password);
        console.log('');

        const response = await axios.post(`${API_URL}/admin/auth/login`, credentials, {
            timeout: 10000
        });

        if (response.data.success) {
            console.log('✅ Login API: SUCCESS');
            console.log('');
            console.log('👤 User Details:');
            console.log('   ├─ ID:', response.data.user.id);
            console.log('   ├─ Name:', response.data.user.name);
            console.log('   ├─ Email:', response.data.user.email);
            console.log('   ├─ Role:', response.data.user.role);
            console.log('   └─ Token:', response.data.token.substring(0, 50) + '...');
            console.log('');

            // TEST 6: Test Token Verification
            console.log('📋 TEST 6: Token Verification');
            console.log('─────────────────────────────────────');
            try {
                const verifyResponse = await axios.get(`${API_URL}/admin/auth/verify`, {
                    headers: {
                        'Authorization': `Bearer ${response.data.token}`
                    },
                    timeout: 5000
                });

                if (verifyResponse.data.success) {
                    console.log('✅ Token verification: SUCCESS');
                    console.log('   Verified user:', verifyResponse.data.user.name);
                    console.log('');
                }
            } catch (error) {
                console.log('❌ Token verification: FAILED');
                console.log('   Error:', error.response?.data?.error || error.message);
                console.log('');
                allTestsPassed = false;
            }

            // TEST 7: Test Password Hash
            console.log('📋 TEST 7: Password Hash Verification');
            console.log('─────────────────────────────────────');
            try {
                const { data: user, error } = await supabase
                    .from('admin_users')
                    .select('password_hash')
                    .eq('email', credentials.email)
                    .single();

                if (error) throw error;

                const isValid = await bcrypt.compare(credentials.password, user.password_hash);
                
                if (isValid) {
                    console.log('✅ Password hash matches correctly');
                    console.log('');
                } else {
                    console.log('❌ Password hash mismatch');
                    console.log('');
                    allTestsPassed = false;
                }
            } catch (error) {
                console.log('❌ Password verification failed');
                console.log('   Error:', error.message);
                console.log('');
                allTestsPassed = false;
            }

        } else {
            console.log('❌ Login failed:', response.data.error);
            console.log('');
            allTestsPassed = false;
        }

    } catch (error) {
        console.log('❌ Login API: FAILED');
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Error:', error.response.data.error || error.response.data);
        } else if (error.request) {
            console.log('   Error: No response from server');
            console.log('   Make sure backend is running: node server.js');
        } else {
            console.log('   Error:', error.message);
        }
        console.log('');
        allTestsPassed = false;
    }

    // FINAL SUMMARY
    console.log('========================================');
    if (allTestsPassed) {
        console.log('🎉 ALL TESTS PASSED!');
        console.log('========================================');
        console.log('✅ Database connection: Working');
        console.log('✅ Backend server: Running');
        console.log('✅ Admin login: Working');
        console.log('✅ Authentication: Working');
        console.log('');
        console.log('🌐 You can now login at:');
        console.log('   http://localhost:3001/login');
        console.log('');
        console.log('🔐 Credentials:');
        console.log('   Email: admin@blog.com');
        console.log('   Password: Admin@123');
    } else {
        console.log('⚠️  SOME TESTS FAILED');
        console.log('========================================');
        console.log('');
        console.log('📋 Troubleshooting Steps:');
        console.log('1. Make sure .env file exists with correct values');
        console.log('2. Run SQL script: admin-database-setup.sql');
        console.log('3. Create admin user: node create-admin-user.js');
        console.log('4. Start backend: node server.js');
        console.log('5. Run this test again: node test-database-connection.js');
    }
    console.log('========================================\n');
}

// Run the test
testDatabaseConnection().catch(console.error);


