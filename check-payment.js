import { Client } from 'pg';

async function checkPayment() {
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
    const paymentMethods = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'payment_methods'
      ORDER BY ordinal_position
    `);
    
    if (paymentMethods.rows.length > 0) {
      paymentMethods.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
    } else {
      console.log('  ❌ payment_methods table not found');
    }

    // Check transactions table
    console.log('\n💰 Transactions table:');
    const transactions = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'transactions'
      ORDER BY ordinal_position
    `);
    
    if (transactions.rows.length > 0) {
      transactions.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
    } else {
      console.log('  ❌ transactions table not found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkPayment();
