const { Client } = require('pg');

// Database configuration
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }
  
  // Local development configuration
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'airport_parking_supplier',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'asd',
  };
};

async function checkAdminTables() {
  const config = getDatabaseConfig();
  const client = new Client(config);

  try {
    await client.connect();
    console.log('🔌 Connected to database successfully');
    
    if (process.env.DATABASE_URL) {
      console.log('📊 Using production database via DATABASE_URL');
    } else {
      console.log('📊 Using local database');
    }

    // Check if admin_users table exists
    const adminUsersQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_users'
      );
    `;
    
    const adminUsersResult = await client.query(adminUsersQuery);
    const adminUsersExists = adminUsersResult.rows[0].exists;
    
    console.log(`\n👑 Admin Users Table: ${adminUsersExists ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (adminUsersExists) {
      // Check for admin users
      const adminUsersCheck = await client.query(`
        SELECT email, role, is_active, created_at 
        FROM admin_users 
        ORDER BY created_at DESC
      `);
      
      console.log(`\n📋 Admin Users Found: ${adminUsersCheck.rows.length}`);
      adminUsersCheck.rows.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.role}) - ${user.is_active ? 'Active' : 'Inactive'}`);
      });
      
      // Check for specific admin email
      const specificAdminQuery = await client.query(`
        SELECT email, role, is_active, created_at 
        FROM admin_users 
        WHERE email = 'admin@parkingplatform.com'
      `);
      
      if (specificAdminQuery.rows.length > 0) {
        const admin = specificAdminQuery.rows[0];
        console.log(`\n🎯 Found admin@parkingplatform.com:`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Active: ${admin.is_active}`);
        console.log(`   Created: ${admin.created_at}`);
      } else {
        console.log(`\n❌ admin@parkingplatform.com not found in admin_users table`);
      }
    }

    // Check other admin tables
    const adminTables = [
      'admin_sessions',
      'admin_activity_logs', 
      'system_settings',
      'admin_notifications',
      'admin_reports'
    ];

    console.log(`\n📊 Other Admin Tables:`);
    for (const table of adminTables) {
      const existsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `;
      
      const existsResult = await client.query(existsQuery, [table]);
      const exists = existsResult.rows[0].exists;
      
      console.log(`   ${exists ? '✅' : '❌'} ${table}: ${exists ? 'EXISTS' : 'MISSING'}`);
    }

    // Check analytics tables
    const analyticsTables = [
      'customer_analytics',
      'supplier_analytics',
      'airport_analytics',
      'payment_analytics',
      'booking_analytics'
    ];

    console.log(`\n📈 Analytics Tables:`);
    for (const table of analyticsTables) {
      const existsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `;
      
      const existsResult = await client.query(existsQuery, [table]);
      const exists = existsResult.rows[0].exists;
      
      console.log(`   ${exists ? '✅' : '❌'} ${table}: ${exists ? 'EXISTS' : 'MISSING'}`);
    }

    // Summary
    console.log(`\n🎯 SUMMARY:`);
    console.log(`- Database: ${config.database || 'via DATABASE_URL'}`);
    console.log(`- Admin Users Table: ${adminUsersExists ? '✅ Ready' : '❌ Missing'}`);
    console.log(`- admin@parkingplatform.com: ${adminUsersExists ? 'Check above' : 'Cannot check - table missing'}`);

  } catch (error) {
    console.error('❌ Error checking admin tables:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

checkAdminTables();

