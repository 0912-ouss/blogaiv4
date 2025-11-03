const bcrypt = require('bcryptjs');

async function verifyPassword() {
    console.log('🔍 Password Verification Test\n');
    
    // The password we want to use
    const testPassword = 'Admin@123';
    
    // Generate a proper hash
    const correctHash = await bcrypt.hash(testPassword, 10);
    
    console.log('Expected Password:', testPassword);
    console.log('Generated Hash:', correctHash);
    console.log('');
    
    // Test verification
    const isValid = await bcrypt.compare(testPassword, correctHash);
    console.log('Verification Result:', isValid ? '✅ PASS' : '❌ FAIL');
    console.log('');
    
    // Output SQL to update password
    console.log('========================================');
    console.log('SQL to Update Password in Database:');
    console.log('========================================');
    console.log(`UPDATE admin_users SET password_hash = '${correctHash}' WHERE email = 'admin@blog.com';`);
    console.log('========================================\n');
    
    return correctHash;
}

verifyPassword().catch(console.error);


