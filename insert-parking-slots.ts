import { db } from './server/db';
import { parkingSlots } from './shared/schema';

// Generate parking slots for the next 30 days for all parking lots
function generateParkingSlots() {
  const slots = [];
  const parkingLotIds = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "14", "15", "16", "17", "18"];
  
  // Get current date
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  
  // Generate slots for next 30 days
  for (let day = 0; day < 30; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);
    
    for (const lotId of parkingLotIds) {
      // Get lot details to determine total spaces and pricing
      const lotDetails = getLotDetails(lotId);
      
      // Generate realistic availability (more availability on weekdays, less on weekends)
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const availabilityFactor = isWeekend ? 0.3 : 0.7; // 30% available on weekends, 70% on weekdays
      
      const totalSpaces = lotDetails.totalSpaces;
      const availableSpaces = Math.floor(totalSpaces * availabilityFactor);
      const reservedSpaces = Math.floor(totalSpaces * 0.1); // 10% reserved
      
      const slot = {
        id: `slot_${lotId}_${currentDate.toISOString().split('T')[0]}`,
        lotId: lotId,
        date: currentDate,
        totalSpaces: totalSpaces,
        availableSpaces: availableSpaces,
        reservedSpaces: reservedSpaces,
        pricePerDay: lotDetails.pricePerDay,
        currency: lotDetails.currency,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      slots.push(slot);
    }
  }
  
  return slots;
}

// Helper function to get lot details for pricing and capacity
function getLotDetails(lotId) {
  const lotDetails = {
    "1": { totalSpaces: 2500, pricePerDay: "25.00", currency: "GBP" }, // LHR Terminal 5 Official
    "2": { totalSpaces: 1800, pricePerDay: "22.00", currency: "GBP" }, // LHR Terminal 2&3 Official
    "3": { totalSpaces: 500, pricePerDay: "45.00", currency: "GBP" }, // LHR Meet & Greet Premium
    "4": { totalSpaces: 1200, pricePerDay: "18.00", currency: "GBP" }, // LHR Park & Fly Express
    "5": { totalSpaces: 2000, pricePerDay: "12.00", currency: "GBP" }, // LHR Economy Parking
    "6": { totalSpaces: 3000, pricePerDay: "10.00", currency: "GBP" }, // LHR Long Stay Parking
    "7": { totalSpaces: 200, pricePerDay: "55.00", currency: "GBP" }, // LHR Valet Parking Premium
    "8": { totalSpaces: 800, pricePerDay: "28.00", currency: "GBP" }, // LHR Business Parking
    "9": { totalSpaces: 1500, pricePerDay: "16.00", currency: "GBP" }, // LHR Quick Park Express
    "10": { totalSpaces: 2500, pricePerDay: "11.00", currency: "GBP" }, // LHR Quick Park Budget
    "11": { totalSpaces: 400, pricePerDay: "20.00", currency: "GBP" }, // Gatwick South Terminal
    "12": { totalSpaces: 600, pricePerDay: "18.00", currency: "GBP" }, // Manchester Multi-Storey
    "13": { totalSpaces: 350, pricePerDay: "15.00", currency: "GBP" }, // Birmingham Car Park
    "14": { totalSpaces: 3000, pricePerDay: "30.00", currency: "USD" }, // LAX Official Parking
    "15": { totalSpaces: 5000, pricePerDay: "15.00", currency: "USD" }, // LAX Economy Parking
    "16": { totalSpaces: 200, pricePerDay: "65.00", currency: "USD" }, // LAX Valet Parking Premium
    "17": { totalSpaces: 8000, pricePerDay: "12.00", currency: "USD" }, // LAX Long Term Parking
    "18": { totalSpaces: 1500, pricePerDay: "20.00", currency: "USD" }, // LAX Quick Park Express
  };
  
  return lotDetails[lotId] || { totalSpaces: 1000, pricePerDay: "20.00", currency: "USD" };
}

async function insertParkingSlots() {
  try {
    console.log('Generating parking slots...');
    const slots = generateParkingSlots();
    
    console.log(`Generated ${slots.length} parking slots for the next 30 days`);
    console.log('Inserting parking slots...');
    
    // Insert in batches to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < slots.length; i += batchSize) {
      const batch = slots.slice(i, i + batchSize);
      
      for (const slot of batch) {
        await db.insert(parkingSlots).values(slot);
      }
      
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(slots.length / batchSize)}`);
    }
    
    console.log('✅ All parking slots inserted successfully!');
  } catch (error) {
    console.error('❌ Error inserting parking slots:', error);
  } finally {
    process.exit(0);
  }
}

insertParkingSlots(); 