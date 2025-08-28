import { Pool } from 'pg';

async function insertSampleData() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'airport_parking_supplier',
    user: 'postgres',
    password: 'asd',
  });

  try {
    console.log('Inserting sample data...');

    // Insert sample parking supplier
    try {
      await pool.query(`
        INSERT INTO parking_suppliers (id, name, description, contact_email, contact_phone) 
        VALUES ('supplier_1', 'Premium Airport Parking Services', 'Leading airport parking provider with secure facilities', 'contact@premiumparking.com', '+1-555-0123');
      `);
      console.log('✓ Parking supplier inserted');
    } catch (error) {
      console.log('- Parking supplier already exists');
    }

    // Insert sample supplier user
    try {
      await pool.query(`
        INSERT INTO supplier_users (id, supplier_id, email, first_name, last_name, role) 
        VALUES ('supplier_user_1', 'supplier_1', 'supplier@example.com', 'John', 'Supplier', 'admin');
      `);
      console.log('✓ Supplier user inserted');
    } catch (error) {
      console.log('- Supplier user already exists');
    }

    // Insert sample airports
    try {
      await pool.query(`
        INSERT INTO airports (id, code, name, city, state, country, country_code, timezone, latitude, longitude) VALUES
        ('airport_1', 'JFK', 'John F. Kennedy International Airport', 'New York', 'NY', 'United States', 'US', 'America/New_York', 40.6413, -73.7781),
        ('airport_2', 'LAX', 'Los Angeles International Airport', 'Los Angeles', 'CA', 'United States', 'US', 'America/Los_Angeles', 33.9416, -118.4085),
        ('airport_3', 'LHR', 'London Heathrow Airport', 'London', '', 'United Kingdom', 'GB', 'Europe/London', 51.4700, -0.4543);
      `);
      console.log('✓ Airports inserted');
    } catch (error) {
      console.log('- Airports already exist');
    }

    // Insert sample parking lots
    try {
      await pool.query(`
        INSERT INTO parking_lots (id, supplier_id, airport_id, name, description, address, total_spaces, distance_to_terminal, shuttle_frequency_minutes, is_shuttle_included, is_covered, has_security_patrol, has_cctv) VALUES
        ('lot_1', 'supplier_1', 'airport_1', 'Premium Airport Parking', 'Secure parking with shuttle service', '123 Airport Road, Terminal 1', 200, 0.5, 15, TRUE, TRUE, TRUE, TRUE),
        ('lot_2', 'supplier_1', 'airport_1', 'Economy Parking Lot', 'Budget-friendly parking option', '456 Airport Boulevard, Terminal 2', 500, 2.0, 30, TRUE, FALSE, TRUE, TRUE);
      `);
      console.log('✓ Parking lots inserted');
    } catch (error) {
      console.log('- Parking lots already exist');
    }

    // Insert sample exchange rates
    try {
      await pool.query(`
        INSERT INTO exchange_rates (base_currency, target_currency, rate) VALUES
        ('USD', 'GBP', 0.79),
        ('USD', 'EUR', 0.92),
        ('GBP', 'USD', 1.27),
        ('GBP', 'EUR', 1.17),
        ('EUR', 'USD', 1.09),
        ('EUR', 'GBP', 0.86);
      `);
      console.log('✓ Exchange rates inserted');
    } catch (error) {
      console.log('- Exchange rates already exist');
    }

    // Insert sample locale content
    try {
      await pool.query(`
        INSERT INTO locale_content (content_key, locale, content, category) VALUES
        ('welcome_message', 'en-US', 'Welcome to Airport Parking', 'general'),
        ('search_placeholder', 'en-US', 'Search for parking near your airport', 'search'),
        ('welcome_message', 'en-GB', 'Welcome to Airport Parking', 'general'),
        ('search_placeholder', 'en-GB', 'Search for parking near your airport', 'search');
      `);
      console.log('✓ Locale content inserted');
    } catch (error) {
      console.log('- Locale content already exists');
    }

    console.log('Sample data inserted successfully!');

    // Test the data
    const result = await pool.query('SELECT COUNT(*) as count FROM parking_suppliers');
    console.log(`Found ${result.rows[0].count} parking suppliers in database`);

  } catch (error) {
    console.error('Error inserting sample data:', error);
  } finally {
    await pool.end();
  }
}

insertSampleData(); 