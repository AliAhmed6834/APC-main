import { db } from './server/db';
import { airports, parkingSuppliers, parkingLots, parkingPricing, supplierUsers, parkingSlots, bookings, reviews, supplierBookings } from './shared/schema';

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...\n');
    
    // Check airports
    const airportCount = await db.select().from(airports);
    console.log(`📊 Airports: ${airportCount.length} records`);
    
    // Check parking suppliers
    const supplierCount = await db.select().from(parkingSuppliers);
    console.log(`📊 Parking Suppliers: ${supplierCount.length} records`);
    
    // Check parking lots
    const lotCount = await db.select().from(parkingLots);
    console.log(`📊 Parking Lots: ${lotCount.length} records`);
    
    // Check parking pricing
    const pricingCount = await db.select().from(parkingPricing);
    console.log(`📊 Parking Pricing: ${pricingCount.length} records`);
    
    // Check supplier users
    const userCount = await db.select().from(supplierUsers);
    console.log(`📊 Supplier Users: ${userCount.length} records`);
    
    // Check parking slots
    const slotCount = await db.select().from(parkingSlots);
    console.log(`📊 Parking Slots: ${slotCount.length} records`);
    
    // Check bookings
    const bookingCount = await db.select().from(bookings);
    console.log(`📊 Bookings: ${bookingCount.length} records`);
    
    // Check reviews
    const reviewCount = await db.select().from(reviews);
    console.log(`📊 Reviews: ${reviewCount.length} records`);
    
    // Check supplier bookings
    const supplierBookingCount = await db.select().from(supplierBookings);
    console.log(`📊 Supplier Bookings: ${supplierBookingCount.length} records`);
    
    console.log('\n✅ Database check completed!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    process.exit(0);
  }
}

checkDatabase(); 