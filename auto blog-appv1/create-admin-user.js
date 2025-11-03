const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminUser() {
    console.log('🔐 Creating Admin User...\n');

    // Admin credentials
    const email = 'admin@blog.com';
    const password = 'Admin@123';
    const name = 'Super Admin';
    const role = 'super_admin';

    try {
        // Hash the password
        console.log('🔒 Hashing password...');
        const password_hash = await bcrypt.hash(password, 10);
        console.log('✅ Password hashed successfully\n');

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('admin_users')
            .select('id, email')
            .eq('email', email)
            .single();

        if (existingUser) {
            console.log('⚠️  Admin user already exists!');
            console.log('📧 Email:', existingUser.email);
            console.log('🆔 ID:', existingUser.id);
            console.log('\n🔄 Updating password...');

            // Update existing user
            const { error: updateError } = await supabase
                .from('admin_users')
                .update({ password_hash, name, role, is_active: true })
                .eq('email', email);

            if (updateError) {
                throw updateError;
            }

            console.log('✅ Admin user updated successfully!\n');
        } else {
            console.log('➕ Creating new admin user...');

            // Insert new admin user
            const { data, error } = await supabase
                .from('admin_users')
                .insert([{
                    email,
                    password_hash,
                    name,
                    role,
                    is_active: true
                }])
                .select()
                .single();

            if (error) {
                throw error;
            }

            console.log('✅ Admin user created successfully!');
            console.log('🆔 ID:', data.id);
            console.log('📧 Email:', data.email);
            console.log('👤 Name:', data.name);
            console.log('🔑 Role:', data.role);
            console.log('');
        }

        // Test password verification
        console.log('🧪 Testing password verification...');
        const isValid = await bcrypt.compare(password, password_hash);
        
        if (isValid) {
            console.log('✅ Password verification: SUCCESS\n');
        } else {
            console.log('❌ Password verification: FAILED\n');
        }

        console.log('========================================');
        console.log('🎉 ADMIN USER READY!');
        console.log('========================================');
        console.log('📍 Login URL: http://localhost:3001/login');
        console.log('');
        console.log('🔐 Credentials:');
        console.log('   Email:    admin@blog.com');
        console.log('   Password: Admin@123');
        console.log('');
        console.log('⚠️  IMPORTANT: Change this password after first login!');
        console.log('========================================\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\n💡 Make sure you have run the admin-database-setup.sql file in Supabase first!\n');
    }
}

// Run the script
createAdminUser();

