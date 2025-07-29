import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// For local development, use a mock database if DATABASE_URL is not set
let pool: any;
let db: any;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set, using mock database for development");
  // Create a mock pool for development
  pool = {
    query: async () => ({ rows: [] }),
    end: async () => {},
  };
  
  db = drizzle({ client: pool, schema });
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { pool, db };