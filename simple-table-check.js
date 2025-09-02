// Simple script to check database tables using existing server setup
console.log('🔍 Simple Database Table Check');
console.log('==============================');

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);

// List all environment variables that might contain database info
const dbRelatedVars = Object.keys(process.env).filter(key => 
  key.includes('DATABASE') || 
  key.includes('DB') || 
  key.includes('POSTGRES') ||
  key.includes('CONNECTION')
);

console.log('\n🔍 Database-related environment variables:');
if (dbRelatedVars.length > 0) {
  dbRelatedVars.forEach(key => {
    const value = process.env[key];
    const preview = value ? value.substring(0, 30) + '...' : 'undefined';
    console.log(`  ${key}: ${preview}`);
  });
} else {
  console.log('  None found');
}

// Check if we can access the database through the server
console.log('\n🌐 Checking server database access...');

async function checkServerDatabase() {
  try {
    // Try to access the server's database inspection endpoint
    const serverUrl = 'https://airport-management-system-nxzu.onrender.com';
    
    console.log(`\n🔌 Testing connection to: ${serverUrl}`);
    
    // Test basic connectivity
    const response = await fetch(`${serverUrl}/api/admin/inspect`);
    if (response.ok) {
      console.log('✅ Server is accessible');
      console.log('📊 You can view your database at:');
      console.log(`   ${serverUrl}/api/admin/inspect`);
      console.log(`   ${serverUrl}/database-inspection.html`);
    } else {
      console.log(`❌ Server responded with status: ${response.status}`);
    }
    
  } catch (error) {
    console.log('❌ Could not connect to server:', error.message);
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch !== 'undefined') {
  checkServerDatabase();
} else {
  console.log('\n⚠️ Fetch not available in this Node.js version');
  console.log('You can manually check your database at:');
  console.log('https://airport-management-system-nxzu.onrender.com/api/admin/inspect');
}

console.log('\n📋 Manual Database Check Options:');
console.log('1. Visit: https://airport-management-system-nxzu.onrender.com/api/admin/inspect');
console.log('2. Check your Render.com environment variables for DATABASE_URL');
console.log('3. Look for .env file in your project root');
console.log('4. Check your server logs for database connection errors');

console.log('\n🎯 Next Steps:');
console.log('- Check your Render.com dashboard for environment variables');
console.log('- Verify DATABASE_URL is set correctly');
console.log('- Restart your server after setting environment variables');
console.log('- Use the web interface to inspect your database');


