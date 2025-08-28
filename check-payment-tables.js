import { Client } from 'pg';

async function checkPaymentTables() {
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

    // Check payment_methods table
    console.log('\n💳 Payment Methods table:');
    try {
      const paymentMethodsFields = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'payment_methods'
        ORDER BY ordinal_position
      `);
      
      if (paymentMethodsFields.rows.length > 0) {
        paymentMethodsFields.rows.forEach(row => {
          console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });
      } else {
        console.log('  ❌ payment_methods table not found');
      }
    } catch (error) {
      console.log('  ❌ Error accessing payment_methods table:', error.message);
    }

    // Check transactions table
    console.log('\n💰 Transactions table:');
    try {
      const transactionsFields = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'transactions'
        ORDER BY ordinal_position
      `);
      
      if (transactionsFields.rows.length > 0) {
        transactionsFields.rows.forEach(row => {
          console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });
      } else {
        console.log('  ❌ transactions table not found');
      }
    } catch (error) {
      console.log('  ❌ Error accessing transactions table:', error.message);
    }

    // Check payment_gateway_configs table
    console.log('\n⚙️ Payment Gateway Configs table:');
    try {
      const gatewayConfigsFields = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'payment_gateway_configs'
        ORDER BY ordinal_position
      `);
      
      if (gatewayConfigsFields.rows.length > 0) {
        gatewayConfigsFields.rows.forEach(row => {
          console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });
      } else {
        console.log('  ❌ payment_gateway_configs table not found');
      }
    } catch (error) {
      console.log('  ❌ Error accessing payment_gateway_configs table:', error.message);
    }

    // Check if there's any payment data in the bookings table
    console.log('\n📊 Sample payment data from recent bookings:');
    try {
      const recentPayments = await client.query(`
        SELECT 
          booking_reference,
          price_per_day,
          total_amount,
          payment_status,
          payment_method_id,
          transaction_id,
          created_at
        FROM bookings 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      
      if (recentPayments.rows.length > 0) {
        recentPayments.rows.forEach((row, index) => {
          console.log(`  Booking ${index + 1}:`);
          console.log(`    Reference: ${row.booking_reference}`);
          console.log(`    Price/Day: $${row.price_per_day}`);
          console.log(`    Total Amount: $${row.total_amount}`);
          console.log(`    Payment Status: ${row.payment_status || 'Not set'}`);
          console.log(`    Payment Method: ${row.payment_method_id || 'Not set'}`);
          console.log(`    Transaction ID: ${row.transaction_id || 'Not set'}`);
          console.log(`    Created: ${row.created_at}`);
          console.log('');
        });
      } else {
        console.log('  ❌ No recent bookings found');
      }
    } catch (error) {
      console.log('  ❌ Error accessing bookings data:', error.message);
    }

  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

checkPaymentTables();
