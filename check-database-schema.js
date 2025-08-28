import { Client } from 'pg';

async function checkDatabaseSchema() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'airport_parking_supplier',
    user: 'postgres',
    password: 'asd',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if the parking_lot_details column exists
    const columnCheck = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      AND column_name = 'parking_lot_details'
    `);

    if (columnCheck.rows.length > 0) {
      console.log('✅ parking_lot_details column exists:', columnCheck.rows[0]);
    } else {
      console.log('❌ parking_lot_details column not found - migration may have failed');
    }

    // Check the full bookings table structure
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'bookings'
      ORDER BY ordinal_position
    `);

    console.log('📋 Bookings table structure:');
    tableStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

checkDatabaseSchema();
