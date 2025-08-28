import { Client } from 'pg';

async function addColumnManually() {
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

    // Add the parking_lot_details column manually
    console.log('🔧 Adding parking_lot_details column...');
    await client.query(`
      ALTER TABLE "bookings" 
      ADD COLUMN "parking_lot_details" JSONB;
    `);
    console.log('✅ Column added successfully');

    // Add a comment to document the purpose
    await client.query(`
      COMMENT ON COLUMN "bookings"."parking_lot_details" IS 'Stores complete parking lot information for customer dashboard display including name, address, airport details, amenities, etc.';
    `);
    console.log('✅ Comment added successfully');

    // Verify the column was added
    const columnCheck = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      AND column_name = 'parking_lot_details'
    `);

    if (columnCheck.rows.length > 0) {
      console.log('✅ Column verification successful:', columnCheck.rows[0]);
    } else {
      console.log('❌ Column verification failed - column not found');
    }

  } catch (error) {
    console.error('❌ Failed to add column:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

addColumnManually();
