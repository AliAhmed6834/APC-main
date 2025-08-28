import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  // Database configuration
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'airport_parking_supplier',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'asd',
  };

  console.log('Setting up database...');
  console.log('Config:', { ...config, password: '***' });

  // Create client for database operations
  const client = new Client(config);

  try {
    // Connect to PostgreSQL
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Read and execute the SQL setup script
    const sqlScript = fs.readFileSync(path.join(__dirname, 'database-setup.sql'), 'utf8');
    
    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await client.query(statement);
          console.log(`✓ Executed statement ${i + 1}/${statements.length}`);
        } catch (error) {
          if (error.code === '42P07') {
            // Table already exists, this is fine
            console.log(`- Statement ${i + 1}/${statements.length} (table already exists)`);
          } else {
            console.error(`✗ Error in statement ${i + 1}:`, error.message);
          }
        }
      }
    }

    console.log('Database setup completed successfully!');

    // Test the connection by querying some data
    const result = await client.query('SELECT COUNT(*) as count FROM parking_suppliers');
    console.log(`Found ${result.rows[0].count} parking suppliers in database`);

  } catch (error) {
    console.error('Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the setup
setupDatabase(); 