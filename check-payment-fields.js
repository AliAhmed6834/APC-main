import { Client } from 'pg';

async function checkPaymentFields() {
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

    // Check bookings table for payment fields
    console.log('\n📋 Bookings table payment fields:');
    const bookingsFields = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'bookings'
      AND (column_name LIKE '%payment%' OR column_name LIKE '%transaction%' OR column_name LIKE '%amount%' OR column_name LIKE '%price%')
      ORDER BY ordinal_position
    `);

    if (bookingsFields.rows.length > 0) {
      bookingsFields.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
    } else {
      console.log('  ❌ No payment-related fields found in bookings table');
    }

    // Check all columns in bookings table
    console.log('\n📋 All bookings table columns:');
    const allBookingsFields = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'bookings'
      ORDER BY ordinal_position
    `);

    allBookingsFields.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    // Check if there are any payment-specific tables
    console.log('\n🔍 Looking for payment-related tables:');
    const paymentTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%payment%' OR table_name LIKE '%transaction%' OR table_name LIKE '%billing%')
    `);

    if (paymentTables.rows.length > 0) {
      console.log('  ✅ Payment-related tables found:');
      paymentTables.rows.forEach(row => {
        console.log(`    - ${row.table_name}`);
      });
    } else {
      console.log('  ❌ No payment-specific tables found');
    }

  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

checkPaymentFields();
