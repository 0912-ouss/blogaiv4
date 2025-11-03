const { createClient } = require('@supabase/supabase-js');
const https = require('https');
require('dotenv').config();

async function testSupabaseConnection() {
    console.log('========================================');
    console.log('🔍 DETAILED SUPABASE CONNECTION TEST');
    console.log('========================================\n');

    // Test 1: Check environment variables
    console.log('📋 TEST 1: Environment Variables');
    console.log('─────────────────────────────────────');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL || '❌ MISSING');
    console.log('SUPABASE_KEY exists:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ YES' : '❌ NO');
    console.log('Key length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0);
    console.log('');

    // Test 2: Check if URL is reachable via HTTPS
    console.log('📋 TEST 2: Network Connectivity Test');
    console.log('─────────────────────────────────────');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
        console.log('❌ No Supabase URL configured');
        return;
    }

    const urlObj = new URL(supabaseUrl);
    console.log('Testing connection to:', urlObj.hostname);
    
    await new Promise((resolve) => {
        const req = https.request({
            hostname: urlObj.hostname,
            port: 443,
            path: '/rest/v1/',
            method: 'GET',
            timeout: 5000,
            headers: {
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY
            }
        }, (res) => {
            console.log('✅ HTTPS Connection: SUCCESS');
            console.log('   Status Code:', res.statusCode);
            console.log('   Status Message:', res.statusMessage);
            console.log('');
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('Response preview:', data.substring(0, 200));
                console.log('');
                resolve();
            });
        });

        req.on('error', (error) => {
            console.log('❌ HTTPS Connection: FAILED');
            console.log('   Error Code:', error.code);
            console.log('   Error Message:', error.message);
            console.log('');
            console.log('Possible causes:');
            console.log('1. No internet connection');
            console.log('2. Firewall blocking the connection');
            console.log('3. Supabase project is paused or deleted');
            console.log('4. DNS resolution issue');
            console.log('');
            resolve();
        });

        req.on('timeout', () => {
            console.log('❌ Connection timeout after 5 seconds');
            req.destroy();
            resolve();
        });

        req.end();
    });

    // Test 3: Try Supabase client connection
    console.log('📋 TEST 3: Supabase Client Connection');
    console.log('─────────────────────────────────────');
    
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        console.log('✅ Supabase client created');
        console.log('');

        // Try a simple query
        console.log('📋 TEST 4: Database Query Test');
        console.log('─────────────────────────────────────');
        console.log('Attempting to query admin_users table...');
        
        const { data, error, status, statusText } = await supabase
            .from('admin_users')
            .select('count')
            .limit(1);

        if (error) {
            console.log('❌ Query failed');
            console.log('   Error:', error.message);
            console.log('   Code:', error.code);
            console.log('   Details:', error.details);
            console.log('   Hint:', error.hint);
            console.log('');
            
            if (error.code === 'PGRST116') {
                console.log('💡 The admin_users table does not exist!');
                console.log('   You need to run: admin-database-setup.sql in Supabase');
            }
        } else {
            console.log('✅ Query successful!');
            console.log('   Status:', status);
            console.log('   Data:', data);
            console.log('');
        }

    } catch (error) {
        console.log('❌ Supabase client error');
        console.log('   Error:', error.message);
        console.log('   Stack:', error.stack);
        console.log('');
    }

    console.log('========================================');
    console.log('TEST COMPLETE');
    console.log('========================================\n');
}

testSupabaseConnection().catch(console.error);


