import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

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

let pool: Pool;
let db: any;

try {
  const config = getDatabaseConfig();
  pool = new Pool(config);
  db = drizzle(pool, { schema });
  
  if (process.env.DATABASE_URL) {
    console.log("Connected to PostgreSQL database via DATABASE_URL");
  } else {
    console.log("Connected to local PostgreSQL database");
  }
} catch (error) {
  console.error("Failed to connect to PostgreSQL:", error);
  throw error; // Don't fall back to mock, require database connection
}

export { pool, db };