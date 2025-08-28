import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function testBookingCreation() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:asd@localhost:5432/airport_parking_supplier'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Test 1: Check if the parking_lot_details column exists
    const columnCheck = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      AND column_name = 'parking_lot_details'
    `);

    if (columnCheck.rows.length > 0) {
      console.log('✅ parking_lot_details column exists:', columnCheck.rows[0]);
    } else {
      console.log('❌ parking_lot_details column not found');
    }

    // Test 2: Check if we can insert a test booking
    const testBookingData = {
      userId: 'test-user-123',
      lotId: 'test-lot-123',
      startDate: '2025-08-15T00:00:00.000Z',
      endDate: '2025-08-16T00:00:00.000Z',
      totalDays: 1,
      pricePerDay: '35.00',
      totalAmount: '37.80',
      vehicleInfo: { make: 'Test', model: 'Car', color: 'Red' },
      specialRequests: 'Test booking',
      status: 'confirmed',
      isCancellable: true,
      parkingLotDetails: {
        name: 'Test Parking Lot',
        address: 'Test Address',
        airportId: 'TEST',
        airportName: 'Test Airport'
      }
    };

    console.log('🔍 Testing booking insertion with data:', testBookingData);

    const insertResult = await client.query(`
      INSERT INTO bookings (
        user_id, lot_id, start_date, end_date, total_days, 
        price_per_day, total_amount, vehicle_info, special_requests, 
        status, is_cancellable, parking_lot_details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      testBookingData.userId,
      testBookingData.lotId,
      testBookingData.startDate,
      testBookingData.endDate,
      testBookingData.totalDays,
      testBookingData.pricePerDay,
      testBookingData.totalAmount,
      JSON.stringify(testBookingData.vehicleInfo),
      testBookingData.specialRequests,
      testBookingData.status,
      testBookingData.isCancellable,
      JSON.stringify(testBookingData.parkingLotDetails)
    ]);

    console.log('✅ Test booking created successfully:', insertResult.rows[0]);

    // Clean up: Delete the test booking
    await client.query('DELETE FROM bookings WHERE user_id = $1', [testBookingData.userId]);
    console.log('✅ Test booking cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

testBookingCreation();
