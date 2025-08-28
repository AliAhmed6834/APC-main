import { Client } from 'pg';

async function insertPaymentMethod() {
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

    // Fetch the first admin user ID
    const adminUser = await client.query(`SELECT id FROM users ORDER BY created_at ASC LIMIT 1`);
    if (adminUser.rows.length === 0) {
      throw new Error('No admin user found in users table.');
    }
    const userId = adminUser.rows[0].id;
    console.log('Using admin user ID:', userId);

    const id = '2c203341-8129-4731-a248-e745656b0d31';
    const paymentType = 'credit_card';
    const lastFour = '4242';
    const expiryDate = '12/2030';
    const isDefault = true;
    const isActive = true;
    const tokenHash = 'dummy-token-hash';
    const metadata = JSON.stringify({ brand: 'Visa', country: 'US' });

    const result = await client.query(`
      INSERT INTO payment_methods (
        id, user_id, payment_type, last_four, expiry_date, is_default, is_active, token_hash, metadata, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      ) ON CONFLICT (id) DO NOTHING
      RETURNING *;
    `, [id, userId, paymentType, lastFour, expiryDate, isDefault, isActive, tokenHash, metadata]);

    if (result.rows.length > 0) {
      console.log('✅ Dummy payment method inserted:', result.rows[0]);
    } else {
      console.log('ℹ️ Payment method with this ID already exists.');
    }
  } catch (error) {
    console.error('❌ Error inserting payment method:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

insertPaymentMethod();
