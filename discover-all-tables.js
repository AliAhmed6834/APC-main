import { Client } from 'pg';

// Get database URL from environment variable directly
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.log('Please make sure your database connection string is configured');
  process.exit(1);
}

const client = new Client({
  connectionString: DATABASE_URL,
});

async function discoverAllTables() {
  try {
    await client.connect();
    console.log('🔌 Connected to database successfully');

    // Query to get all tables
    const query = `
      SELECT 
        schemaname,
        tablename,
        tableowner,
        tablespace,
        hasindexes,
        hasrules,
        hastriggers,
        rowsecurity
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    const result = await client.query(query);
    
    console.log(`\n📊 Found ${result.rows.length} tables in your database:\n`);
    
    result.rows.forEach((table, index) => {
      console.log(`${index + 1}. ${table.tablename}`);
      console.log(`   Schema: ${table.schemaname}`);
      console.log(`   Owner: ${table.tableowner}`);
      console.log(`   Has Indexes: ${table.hasindexes}`);
      console.log(`   Has Rules: ${table.hasrules}`);
      console.log(`   Has Triggers: ${table.hastriggers}`);
      console.log(`   Row Security: ${table.rowsecurity}`);
      console.log('');
    });

    // Get table sizes
    const sizeQuery = `
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    `;

    const sizeResult = await client.query(sizeQuery);
    
    console.log(`\n📏 Table Sizes (largest first):\n`);
    sizeResult.rows.forEach((table, index) => {
      console.log(`${index + 1}. ${table.tablename} - ${table.size}`);
    });

    // Get column count for each table
    console.log(`\n🔍 Getting column details for each table...\n`);
    
    for (const table of result.rows) {
      const columnQuery = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position;
      `;
      
      const columnResult = await client.query(columnQuery, [table.tablename]);
      
      console.log(`📋 ${table.tablename} (${columnResult.rows.length} columns):`);
      columnResult.rows.forEach(column => {
        const nullable = column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultValue = column.column_default ? ` DEFAULT ${column.column_default}` : '';
        console.log(`   - ${column.column_name}: ${column.data_type} ${nullable}${defaultValue}`);
      });
      console.log('');
    }

    // Check if admin tables exist
    const adminTables = [
      'admin_users',
      'admin_sessions', 
      'admin_activity_logs',
      'customer_analytics',
      'supplier_analytics',
      'airport_analytics',
      'payment_analytics',
      'booking_analytics',
      'system_settings',
      'admin_notifications',
      'admin_reports'
    ];

    console.log(`\n👑 Checking Admin Tables:\n`);
    for (const adminTable of adminTables) {
      const existsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `;
      
      const existsResult = await client.query(existsQuery, [adminTable]);
      const exists = existsResult.rows[0].exists;
      
      console.log(`${exists ? '✅' : '❌'} ${adminTable}: ${exists ? 'EXISTS' : 'MISSING'}`);
    }

    console.log(`\n🎯 Summary:`);
    console.log(`- Total tables found: ${result.rows.length}`);
    console.log(`- Admin tables expected: ${adminTables.length}`);
    console.log(`- Admin tables missing: ${adminTables.filter(table => {
      const exists = result.rows.some(row => row.tablename === table);
      return !exists;
    }).length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the discovery
discoverAllTables();
