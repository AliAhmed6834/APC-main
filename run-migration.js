import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

async function runMigration() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'airport_parking_supplier',
    user: 'postgres',
    password: 'asd',
  });

  const db = drizzle(pool);

  try {
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration(); 