import { db } from './server/db';
import { parkingLots } from './shared/schema';

async function listParkingLots() {
  try {
    console.log('🔍 Listing existing parking lots...\n');
    
    const existingLots = await db.select().from(parkingLots);
    
    console.log(`Found ${existingLots.length} parking lots:\n`);
    
    existingLots.forEach((lot, index) => {
      console.log(`${index + 1}. ID: ${lot.id}, Name: ${lot.name}, Airport: ${lot.airportId}`);
    });
    
  } catch (error) {
    console.error('❌ Error listing parking lots:', error);
  } finally {
    process.exit(0);
  }
}

listParkingLots(); 