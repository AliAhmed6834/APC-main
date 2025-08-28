import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/parking_system'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read and execute the migration
    const migrationPath = './drizzle/0002_add_parking_lot_details_to_bookings.sql';
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      return;
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📖 Migration SQL:', migrationSQL);

    // Execute the migration
    await client.query(migrationSQL);
    console.log('✅ Migration executed successfully');

    // Verify the column was added
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      AND column_name = 'parking_lot_details'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Column verification successful:', result.rows[0]);
    } else {
      console.log('❌ Column verification failed - column not found');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

runMigration();
