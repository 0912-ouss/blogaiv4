require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    try {
        console.log('📋 Reading migration file...');
        const migrationPath = path.join(__dirname, 'migrations', 'add-scheduled-at.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('🚀 Executing migration...');
        console.log('SQL:', sql);

        // Split SQL into individual statements
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            if (statement.trim()) {
                console.log(`\n📝 Executing: ${statement.substring(0, 50)}...`);
                
                // Use RPC or direct query
                const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement }).catch(async () => {
                    // If RPC doesn't exist, try direct query via REST API
                    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': supabaseServiceKey,
                            'Authorization': `Bearer ${supabaseServiceKey}`
                        },
                        body: JSON.stringify({ sql_query: statement })
                    }).catch(() => null);

                    if (!response || !response.ok) {
                        // Try alternative: execute via PostgREST
                        const { error: directError } = await supabase
                            .from('articles')
                            .select('*')
                            .limit(0); // Just test connection
                        
                        return { error: directError || new Error('Could not execute SQL') };
                    }
                    
                    return { data: await response.json() };
                });

                if (error) {
                    // For ALTER TABLE and CREATE INDEX, we can ignore "already exists" errors
                    if (error.message && (
                        error.message.includes('already exists') ||
                        error.message.includes('duplicate') ||
                        error.message.includes('column') && error.message.includes('exists')
                    )) {
                        console.log('   ⚠️  Warning (ignored):', error.message);
                    } else {
                        throw error;
                    }
                } else {
                    console.log('   ✅ Success');
                }
            }
        }

        console.log('\n✅ Migration completed successfully!');
        console.log('\n📊 Verifying...');
        
        // Verify the column was added
        const { data: columns, error: checkError } = await supabase
            .from('articles')
            .select('scheduled_at')
            .limit(1);

        if (checkError && checkError.message.includes('column') && checkError.message.includes('does not exist')) {
            console.log('   ⚠️  Column check failed - column may need to be added manually');
            console.log('   📝 Please run the SQL manually in Supabase SQL Editor:');
            console.log('\n' + sql);
        } else {
            console.log('   ✅ Column verified successfully!');
        }

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.log('\n📝 Please run the SQL manually in Supabase SQL Editor:');
        const migrationPath = path.join(__dirname, 'migrations', 'add-scheduled-at.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log('\n' + sql);
        process.exit(1);
    }
}

runMigration();

