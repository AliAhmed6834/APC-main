import { db } from './server/db';
import { parkingSuppliers } from './shared/schema';

const mockSuppliers = [
  {
    id: "supplier1",
    name: "Heathrow Official Parking",
    description: "Official Heathrow Airport parking services",
    logoUrl: "/images/suppliers/heathrow-official.png",
    contactEmail: "info@heathrowparking.com",
    contactPhone: "+44-20-8745-1234",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "supplier2", 
    name: "Park & Fly UK",
    description: "Premium airport parking with meet & greet services",
    logoUrl: "/images/suppliers/park-fly-uk.png",
    contactEmail: "bookings@parkflyuk.com",
    contactPhone: "+44-20-7946-5678",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "supplier3",
    name: "Airport Parking Solutions",
    description: "Affordable parking options near major airports",
    logoUrl: "/images/suppliers/airport-parking-solutions.png",
    contactEmail: "support@airportparkingsolutions.co.uk",
    contactPhone: "+44-20-7123-4567",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "supplier4",
    name: "Premium Parking Services",
    description: "Luxury parking with valet and concierge services",
    logoUrl: "/images/suppliers/premium-parking-services.png",
    contactEmail: "enquiries@premiumparkingservices.com",
    contactPhone: "+44-20-8234-7890",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "supplier5",
    name: "Quick Park Heathrow",
    description: "Fast and convenient parking with 24/7 shuttle service",
    logoUrl: "/images/suppliers/quick-park-heathrow.png",
    contactEmail: "hello@quickparkheathrow.co.uk",
    contactPhone: "+44-20-7456-1234",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "supplier6",
    name: "Gatwick Parking Services",
    description: "Official Gatwick Airport parking provider",
    logoUrl: "/images/suppliers/gatwick-parking.png",
    contactEmail: "info@gatwickparking.co.uk",
    contactPhone: "+44-20-7123-7890",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "supplier7",
    name: "Manchester Airport Parking",
    description: "Official Manchester Airport parking services",
    logoUrl: "/images/suppliers/manchester-parking.png",
    contactEmail: "bookings@manchesterairportparking.com",
    contactPhone: "+44-20-7456-7890",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "supplier8",
    name: "Birmingham Airport Parking",
    description: "Official Birmingham Airport parking provider",
    logoUrl: "/images/suppliers/birmingham-parking.png",
    contactEmail: "info@birminghamairportparking.co.uk",
    contactPhone: "+44-20-8234-5678",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function insertParkingSuppliers() {
  try {
    console.log('Inserting parking suppliers...');
    
    for (const supplier of mockSuppliers) {
      await db.insert(parkingSuppliers).values(supplier);
      console.log(`Inserted supplier: ${supplier.name}`);
    }
    
    console.log('✅ All parking suppliers inserted successfully!');
  } catch (error) {
    console.error('❌ Error inserting parking suppliers:', error);
  } finally {
    process.exit(0);
  }
}

insertParkingSuppliers(); 