import { db } from './server/db';
import { airports } from './shared/schema';

async function listAirports() {
  try {
    console.log('🔍 Listing existing airports...\n');
    
    const existingAirports = await db.select().from(airports);
    
    console.log(`Found ${existingAirports.length} airports:\n`);
    
    existingAirports.forEach((airport, index) => {
      console.log(`${index + 1}. ID: ${airport.id}, Code: ${airport.code}, Name: ${airport.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error listing airports:', error);
  } finally {
    process.exit(0);
  }
}

listAirports(); 