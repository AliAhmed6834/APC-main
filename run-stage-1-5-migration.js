#!/usr/bin/env node

/**
 * Stage 1.5 Database Migration Runner
 * 
 * This script applies the Stage 1.5 database schema enhancements including:
 * - Payment & Transaction tables
 * - Communication & Notification tables
 * - Analytics & Reporting tables
 * - Enhanced User & Supplier tables
 * - Advanced Feature tables
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

async function runMigration() {
  const client = new Client(config);
  
  try {
    console.log('🚀 Starting Stage 1.5 Database Migration...');
    console.log(`📊 Connecting to database: ${config.database} on ${config.host}:${config.port}`);
    
    await client.connect();
    console.log('✅ Connected to database successfully');

    // Read and execute migration file
    const migrationPath = path.join(__dirname, 'drizzle', '0001_stage_1_5_schema_enhancements.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    console.log('📝 Reading migration file...');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🔧 Executing migration...');
    await client.query(migrationSQL);
    console.log('✅ Migration executed successfully');

    // Insert sample data
    console.log('📊 Inserting sample data...');
    const sampleDataPath = path.join(__dirname, 'insert-stage-1-5-sample-data.sql');
    
    if (fs.existsSync(sampleDataPath)) {
      const sampleDataSQL = fs.readFileSync(sampleDataPath, 'utf8');
      await client.query(sampleDataSQL);
      console.log('✅ Sample data inserted successfully');
    } else {
      console.log('⚠️  Sample data file not found, skipping...');
    }

    // Verify tables were created
    console.log('🔍 Verifying table creation...');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'payment_methods', 'transactions', 'payment_gateway_configs',
        'email_templates', 'email_logs', 'sms_logs',
        'user_activity_logs', 'search_analytics', 'revenue_analytics',
        'supplier_performance', 'user_preferences', 'user_loyalty',
        'supplier_contracts', 'supplier_metrics', 'booking_status_history',
        'saved_searches', 'search_filters'
      )
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    const createdTables = tablesResult.rows.map(row => row.table_name);
    
    console.log('📋 Created tables:');
    createdTables.forEach(table => console.log(`  ✅ ${table}`));
    
    if (createdTables.length === 17) {
      console.log('\n🎉 Stage 1.5 Database Migration completed successfully!');
      console.log(`📊 Total tables created: ${createdTables.length}`);
    } else {
      console.log('\n⚠️  Some tables may not have been created. Please check the migration.');
    }

    // Show table counts
    console.log('\n📊 Sample data counts:');
    const countQueries = [
      'SELECT COUNT(*) as count FROM email_templates',
      'SELECT COUNT(*) as count FROM payment_gateway_configs',
      'SELECT COUNT(*) as count FROM search_filters',
      'SELECT COUNT(*) as count FROM user_preferences',
      'SELECT COUNT(*) as count FROM user_loyalty',
      'SELECT COUNT(*) as count FROM supplier_contracts',
      'SELECT COUNT(*) as count FROM revenue_analytics'
    ];

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

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run migration
runMigration().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
