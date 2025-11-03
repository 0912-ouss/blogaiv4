require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
    process.exit(1);
}

async function runMigration() {
    try {
        console.log('📋 Reading migration file...');
        const migrationPath = path.join(__dirname, 'migrations', 'add-scheduled-at.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('🚀 Executing migration via Supabase REST API...');
        
        // Execute SQL via Supabase REST API
        const response = await axios.post(
            `${supabaseUrl}/rest/v1/rpc/exec_sql`,
            { query: sql },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`
                }
            }
        ).catch(async (error) => {
            // Try alternative endpoint
            console.log('   ⚠️  Trying alternative method...');
            
            // Method 2: Execute statements individually via PostgREST
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            for (const statement of statements) {
                if (statement.trim()) {
                    console.log(`\n📝 Executing: ${statement.substring(0, 60)}...`);
                    
                    try {
                        // For DDL statements, we need to use the SQL Editor API
                        // Since Supabase doesn't expose DDL via REST, we'll show instructions
                        console.log('   ⚠️  DDL statements must be run in Supabase SQL Editor');
                        console.log('   📝 Please copy and run this SQL manually:');
                        console.log('\n' + '='.repeat(60));
                        console.log(sql);
                        console.log('='.repeat(60));
                        return { success: false, needsManual: true };
                    } catch (err) {
                        console.error('   ❌ Error:', err.message);
                    }
                }
            }
            
            return { success: false, error: error.message };
        });

        if (response && response.data) {
            console.log('\n✅ Migration executed successfully!');
        } else {
            console.log('\n⚠️  Automatic execution not available.');
            console.log('📝 Please run the SQL manually in Supabase SQL Editor:');
            console.log('\n' + '='.repeat(60));
            console.log(sql);
            console.log('='.repeat(60));
        }

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.log('\n📝 Please run the SQL manually in Supabase SQL Editor:');
        const migrationPath = path.join(__dirname, 'migrations', 'add-scheduled-at.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log('\n' + '='.repeat(60));
        console.log(sql);
        console.log('='.repeat(60));
    }
}

runMigration();

