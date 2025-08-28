import { db } from './server/db';
import { parkingPricing } from './shared/schema';

// Pricing data based on the storage.ts pricing logic
const pricingData = [
  // LHR Parking Pricing - Different prices for different lots
  {
    id: "pricing_1",
    lotId: "1", // Terminal 5 Official
    priceType: "daily",
    basePrice: "25.00",
    currency: "GBP",
    localizedPrice: "25.00",
    taxRate: "0.20",
    region: "GB",
    discountedPrice: "22.50", // 10% discount for premium
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_1_usd",
    lotId: "1", // Terminal 5 Official
    priceType: "daily",
    basePrice: "25.00",
    currency: "USD",
    localizedPrice: "31.25",
    taxRate: "0.08",
    region: "US",
    discountedPrice: "28.13", // 10% discount for premium
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_2",
    lotId: "2", // Terminal 2&3 Official
    priceType: "daily",
    basePrice: "22.00",
    currency: "GBP",
    localizedPrice: "22.00",
    taxRate: "0.20",
    region: "GB",
    discountedPrice: "19.80", // 10% discount for premium
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_2_usd",
    lotId: "2", // Terminal 2&3 Official
    priceType: "daily",
    basePrice: "22.00",
    currency: "USD",
    localizedPrice: "27.50",
    taxRate: "0.08",
    region: "US",
    discountedPrice: "24.75", // 10% discount for premium
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_3",
    lotId: "3", // Meet & Greet Premium
    priceType: "daily",
    basePrice: "45.00",
    currency: "GBP",
    localizedPrice: "45.00",
    taxRate: "0.20",
    region: "GB",
    discountedPrice: "40.50", // 10% discount for premium
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_3_usd",
    lotId: "3", // Meet & Greet Premium
    priceType: "daily",
    basePrice: "45.00",
    currency: "USD",
    localizedPrice: "56.25",
    taxRate: "0.08",
    region: "US",
    discountedPrice: "50.63", // 10% discount for premium
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_4",
    lotId: "4", // Park & Fly Express
    priceType: "daily",
    basePrice: "18.00",
    currency: "GBP",
    localizedPrice: "18.00",
    taxRate: "0.20",
    region: "GB",
    discountedPrice: null,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_4_usd",
    lotId: "4", // Park & Fly Express
    priceType: "daily",
    basePrice: "18.00",
    currency: "USD",
    localizedPrice: "22.50",
    taxRate: "0.08",
    region: "US",
    discountedPrice: null,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_5",
    lotId: "5", // Economy Parking
    priceType: "daily",
    basePrice: "12.00",
    currency: "GBP",
    localizedPrice: "12.00",
    taxRate: "0.20",
    region: "GB",
    discountedPrice: null,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_5_usd",
    lotId: "5", // Economy Parking
    priceType: "daily",
    basePrice: "12.00",
    currency: "USD",
    localizedPrice: "15.00",
    taxRate: "0.08",
    region: "US",
    discountedPrice: null,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_6",
    lotId: "6", // Long Stay Parking
    priceType: "daily",
    basePrice: "10.00",
    currency: "GBP",
    localizedPrice: "10.00",
    taxRate: "0.20",
    region: "GB",
    discountedPrice: null,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_6_usd",
    lotId: "6", // Long Stay Parking
    priceType: "daily",
    basePrice: "10.00",
    currency: "USD",
    localizedPrice: "12.50",
    taxRate: "0.08",
    region: "US",
    discountedPrice: null,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_7",
    lotId: "7", // Valet Premium
    priceType: "daily",
    basePrice: "55.00",
    currency: "GBP",
    localizedPrice: "55.00",
    taxRate: "0.20",
    region: "GB",
    discountedPrice: "49.50", // 10% discount for premium
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_7_usd",
    lotId: "7", // Valet Premium
    priceType: "daily",
    basePrice: "55.00",
    currency: "USD",
    localizedPrice: "68.75",
    taxRate: "0.08",
    region: "US",
    discountedPrice: "61.88", // 10% discount for premium
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_8",
    lotId: "8", // Business Parking
    priceType: "daily",
    basePrice: "28.00",
    currency: "GBP",
    localizedPrice: "28.00",
    taxRate: "0.20",
    region: "GB",
    discountedPrice: "25.20", // 10% discount for premium
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_8_usd",
    lotId: "8", // Business Parking
    priceType: "daily",
    basePrice: "28.00",
    currency: "USD",
    localizedPrice: "35.00",
    taxRate: "0.08",
    region: "US",
    discountedPrice: "31.50", // 10% discount for premium
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_9",
    lotId: "9", // Quick Park Express
    priceType: "daily",
    basePrice: "16.00",
    currency: "GBP",
    localizedPrice: "16.00",
    taxRate: "0.20",
    region: "GB",
    discountedPrice: null,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_9_usd",
    lotId: "9", // Quick Park Express
    priceType: "daily",
    basePrice: "16.00",
    currency: "USD",
    localizedPrice: "20.00",
    taxRate: "0.08",
    region: "US",
    discountedPrice: null,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_10",
    lotId: "10", // Quick Park Budget
    priceType: "daily",
    basePrice: "11.00",
    currency: "GBP",
    localizedPrice: "11.00",
    taxRate: "0.20",
    region: "GB",
    discountedPrice: null,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_10_usd",
    lotId: "10", // Quick Park Budget
    priceType: "daily",
    basePrice: "11.00",
    currency: "USD",
    localizedPrice: "13.75",
    taxRate: "0.08",
    region: "US",
    discountedPrice: null,
    isActive: true,
    createdAt: new Date(),
  },
  // LAX Parking Pricing
  {
    id: "pricing_14",
    lotId: "14", // LAX Official Parking Structure
    priceType: "daily",
    basePrice: "30.00",
    currency: "USD",
    localizedPrice: "30.00",
    taxRate: "0.08",
    region: "US",
    discountedPrice: "27.00", // 10% discount for premium
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_14_gbp",
    lotId: "14", // LAX Official Parking Structure
    priceType: "daily",
    basePrice: "30.00",
    currency: "GBP",
    localizedPrice: "24.00",
    taxRate: "0.20",
    region: "GB",
    discountedPrice: "21.60", // 10% discount for premium
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_15",
    lotId: "15", // LAX Economy Parking
    priceType: "daily",
    basePrice: "15.00",
    currency: "USD",
    localizedPrice: "15.00",
    taxRate: "0.08",
    region: "US",
    discountedPrice: null,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_15_gbp",
    lotId: "15", // LAX Economy Parking
    priceType: "daily",
    basePrice: "15.00",
    currency: "GBP",
    localizedPrice: "12.00",
    taxRate: "0.20",
    region: "GB",
    discountedPrice: null,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_16",
    lotId: "16", // LAX Valet Parking Premium
    priceType: "daily",
    basePrice: "65.00",
    currency: "USD",
    localizedPrice: "65.00",
    taxRate: "0.08",
    region: "US",
    discountedPrice: "58.50", // 10% discount for premium
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_16_gbp",
    lotId: "16", // LAX Valet Parking Premium
    priceType: "daily",
    basePrice: "65.00",
    currency: "GBP",
    localizedPrice: "52.00",
    taxRate: "0.20",
    region: "GB",
    discountedPrice: "46.80", // 10% discount for premium
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_17",
    lotId: "17", // LAX Long Term Parking
    priceType: "daily",
    basePrice: "12.00",
    currency: "USD",
    localizedPrice: "12.00",
    taxRate: "0.08",
    region: "US",
    discountedPrice: null,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_17_gbp",
    lotId: "17", // LAX Long Term Parking
    priceType: "daily",
    basePrice: "12.00",
    currency: "GBP",
    localizedPrice: "9.60",
    taxRate: "0.20",
    region: "GB",
    discountedPrice: null,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_18",
    lotId: "18", // LAX Quick Park Express
    priceType: "daily",
    basePrice: "20.00",
    currency: "USD",
    localizedPrice: "20.00",
    taxRate: "0.08",
    region: "US",
    discountedPrice: null,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "pricing_18_gbp",
    lotId: "18", // LAX Quick Park Express
    priceType: "daily",
    basePrice: "20.00",
    currency: "GBP",
    localizedPrice: "16.00",
    taxRate: "0.20",
    region: "GB",
    discountedPrice: null,
    isActive: true,
    createdAt: new Date(),
  },
];

async function insertParkingPricing() {
  try {
    console.log('Inserting parking pricing...');
    
    for (const pricing of pricingData) {
      await db.insert(parkingPricing).values(pricing);
      console.log(`Inserted pricing for lot ${pricing.lotId} - ${pricing.currency} ${pricing.localizedPrice}`);
    }
    
    console.log('✅ All parking pricing inserted successfully!');
  } catch (error) {
    console.error('❌ Error inserting parking pricing:', error);
  } finally {
    process.exit(0);
  }
}

insertParkingPricing(); 