const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const http = require('http');
require('dotenv').config();

async function testSupabase() {
    console.log('🔍 DETAILED SUPABASE CONNECTION TEST\n');
    
    console.log('Environment:');
    console.log('  SUPABASE_URL:', process.env.SUPABASE_URL);
    console.log('  KEY LENGTH:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length);
    console.log('');

    // Test 1: Try with custom fetch
    console.log('Test 1: Supabase client with default config...');
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { data, error } = await supabase
            .from('admin_users')
            .select('email, name')
            .limit(1);

        if (error) {
            console.log('❌ Error:', error.message);
            console.log('   Code:', error.code);
        } else {
            console.log('✅ SUCCESS! Data:', data);
        }
    } catch (err) {
        console.log('❌ Exception:', err.message);
        console.log('   Cause:', err.cause?.message);
    }
    console.log('');

    // Test 2: Try with node-fetch
    console.log('Test 2: Using node-fetch directly...');
    try {
        const nodeFetch = require('node-fetch');
        const response = await nodeFetch(`${process.env.SUPABASE_URL}/rest/v1/admin_users?limit=1`, {
            headers: {
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
            }
        });
        const data = await response.json();
        console.log('✅ Response:', data);
    } catch (err) {
        console.log('❌ Error:', err.message);
    }
    console.log('');

    // Test 3: Check if node-fetch is installed
    console.log('Test 3: Checking node-fetch availability...');
    try {
        require.resolve('node-fetch');
        console.log('✅ node-fetch is installed');
    } catch (e) {
        console.log('⚠️  node-fetch is NOT installed');
        console.log('   Installing it might fix the issue');
    }
}

testSupabase().catch(console.error);


