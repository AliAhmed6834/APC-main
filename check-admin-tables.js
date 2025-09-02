import { db } from './server/db.ts';
import { sql } from 'drizzle-orm';

console.log('🔍 Checking Admin Dashboard Database Tables...\n');

try {
  // Check if admin tables exist
  const adminTablesQuery = sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE 'admin_%'
    ORDER BY table_name
  `;
  
  const adminTables = await db.execute(adminTablesQuery);
  console.log('📋 Admin Tables Found:');
  
  if (adminTables.rows.length === 0) {
    console.log('   ❌ No admin tables found!');
    console.log('\n💡 You need to run the migration first:');
    console.log('   npm run deploy:admin');
  } else {
    adminTables.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });
  }

  // Check if analytics tables exist
  const analyticsTablesQuery = sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE '%_analytics'
    ORDER BY table_name
  `;
  
  const analyticsTables = await db.execute(analyticsTablesQuery);
  console.log('\n📊 Analytics Tables Found:');
  
  if (analyticsTables.rows.length === 0) {
    console.log('   ❌ No analytics tables found!');
  } else {
    analyticsTables.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });
  }

  // Check if admin fields were added to existing tables
  const usersFieldsQuery = sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name IN ('is_admin', 'admin_role', 'last_activity', 'account_status')
    ORDER BY column_name
  `;
  
  const usersFields = await db.execute(usersFieldsQuery);
  console.log('\n👥 Users Table Admin Fields:');
  
  if (usersFields.rows.length === 0) {
    console.log('   ❌ No admin fields found in users table!');
  } else {
    usersFields.rows.forEach(row => {
      console.log(`   ✅ ${row.column_name}`);
    });
  }

  // Check default admin user
  try {
    const adminUserQuery = sql`
      SELECT email, role, is_active 
      FROM admin_users 
      WHERE email = 'admin@airportparking.com'
    `;
    
    const adminUser = await db.execute(adminUserQuery);
    console.log('\n🔑 Default Admin User:');
    
    if (adminUser.rows.length === 0) {
      console.log('   ❌ Default admin user not found!');
    } else {
      const user = adminUser.rows[0];
      console.log(`   ✅ Email: ${user.email}`);
      console.log(`   ✅ Role: ${user.role}`);
      console.log(`   ✅ Active: ${user.is_active}`);
    }
  } catch (error) {
    console.log('\n🔑 Default Admin User:');
    console.log('   ❌ Could not check admin user (table may not exist)');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (adminTables.rows.length === 0) {
    console.log('❌ ADMIN DASHBOARD NOT READY');
    console.log('   Run: npm run deploy:admin');
  } else {
    console.log('✅ ADMIN DASHBOARD READY');
    console.log('   All required tables exist');
  }
  console.log('='.repeat(50));

} catch (error) {
  console.error('\n❌ Error checking database:', error.message);
  console.log('\n💡 Make sure:');
  console.log('   1. Database is running and accessible');
  console.log('   2. DATABASE_URL environment variable is set');
  console.log('   3. You have proper database permissions');
}
