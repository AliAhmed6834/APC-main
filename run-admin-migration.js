const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Running Admin Dashboard Migration...\n');

try {
  // Check if drizzle is installed
  console.log('📦 Checking Drizzle installation...');
  execSync('npx drizzle-kit --version', { stdio: 'inherit' });
  
  // Run the migration
  console.log('\n🔄 Running migration: 0003_admin_dashboard_schema...');
  execSync('npx drizzle-kit push', { stdio: 'inherit' });
  
  console.log('\n✅ Admin Dashboard migration completed successfully!');
  console.log('\n📋 What was added:');
  console.log('   • Admin Users table for platform administration');
  console.log('   • Admin Sessions table for authentication');
  console.log('   • Admin Activity Logs for audit trail');
  console.log('   • Customer Analytics table for metrics');
  console.log('   • Supplier Analytics table for metrics');
  console.log('   • Airport Analytics table for metrics');
  console.log('   • Payment Analytics table for metrics');
  console.log('   • Booking Analytics table for metrics');
  console.log('   • System Settings table for configuration');
  console.log('   • Admin Notifications table for alerts');
  console.log('   • Admin Reports table for generated reports');
  console.log('   • Additional fields to existing tables');
  console.log('   • Performance indexes for admin queries');
  console.log('\n🔑 Default admin user created: admin@airportparking.com');
  console.log('⚠️  Remember to change the default password after first login!');
  
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  console.log('\n💡 Make sure you have:');
  console.log('   • Drizzle installed: npm install drizzle-orm drizzle-kit');
  console.log('   • Database connection configured');
  console.log('   • Proper environment variables set');
  process.exit(1);
}

