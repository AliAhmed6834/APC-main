#!/usr/bin/env node

/**
 * Sample Data Insertion Script for Stage 1.5
 * 
 * This script only inserts sample data for the new tables
 * without trying to create tables that already exist.
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'airport_parking_supplier',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'asd',
};

async function insertSampleData() {
  const client = new Client(config);
  
  try {
    console.log('🚀 Starting Sample Data Insertion for Stage 1.5...');
    console.log(`📊 Connecting to database: ${config.database} on ${config.host}:${config.port}`);
    
    await client.connect();
    console.log('✅ Connected to database successfully');

    // Insert sample data
    console.log('📊 Inserting sample data...');
    const sampleDataPath = path.join(__dirname, 'insert-stage-1-5-sample-data.sql');
    
    if (fs.existsSync(sampleDataPath)) {
      const sampleDataSQL = fs.readFileSync(sampleDataPath, 'utf8');
      await client.query(sampleDataSQL);
      console.log('✅ Sample data inserted successfully');
    } else {
      throw new Error('Sample data file not found');
    }

    // Verify data was inserted
    console.log('🔍 Verifying data insertion...');
    const countQueries = [
      'SELECT COUNT(*) as count FROM email_templates',
      'SELECT COUNT(*) as count FROM payment_gateway_configs',
      'SELECT COUNT(*) as count FROM search_filters',
      'SELECT COUNT(*) as count FROM user_preferences',
      'SELECT COUNT(*) as count FROM user_loyalty',
      'SELECT COUNT(*) as count FROM supplier_contracts',
      'SELECT COUNT(*) as count FROM revenue_analytics',
      'SELECT COUNT(*) as count FROM search_analytics',
      'SELECT COUNT(*) as count FROM saved_searches',
      'SELECT COUNT(*) as count FROM user_activity_logs',
      'SELECT COUNT(*) as count FROM payment_methods',
      'SELECT COUNT(*) as count FROM transactions',
      'SELECT COUNT(*) as count FROM booking_status_history'
    ];

    console.log('\n📊 Sample data counts:');
    for (const query of countQueries) {
      try {
        const result = await client.query(query);
        const tableName = query.match(/FROM (\w+)/)?.[1];
        if (tableName) {
          console.log(`  ${tableName}: ${result.rows[0].count} records`);
        }
      } catch (error) {
        console.log(`  Error counting ${query}: ${error.message}`);
      }
    }

    console.log('\n🎉 Sample data insertion completed successfully!');

  } catch (error) {
    console.error('❌ Sample data insertion failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
insertSampleData().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
