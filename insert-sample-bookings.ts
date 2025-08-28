import { db } from './server/db';
import { bookings } from './shared/schema';

const mockBookings = [
  {
    id: "booking_1",
    userId: null,
    lotId: "1", // LHR Terminal 5 Official
    bookingReference: "PK12345678",
    startDate: new Date("2025-01-15T10:00:00Z"),
    endDate: new Date("2025-01-18T14:00:00Z"),
    totalDays: 4,
    pricePerDay: "25.00",
    totalAmount: "100.00",
    status: "confirmed",
    vehicleInfo: {
      make: "BMW",
      model: "X3",
      color: "White",
      licensePlate: "AB12 CDE"
    },
    specialRequests: "Covered parking preferred",
    isCancellable: true,
    createdAt: new Date("2025-01-10T09:30:00Z"),
    updatedAt: new Date("2025-01-10T09:30:00Z"),
  },
  {
    id: "booking_2",
    userId: null,
    lotId: "3", // LHR Meet & Greet Premium
    bookingReference: "PK87654321",
    startDate: new Date("2025-01-20T08:00:00Z"),
    endDate: new Date("2025-01-22T16:00:00Z"),
    totalDays: 3,
    pricePerDay: "45.00",
    totalAmount: "135.00",
    status: "completed",
    vehicleInfo: {
      make: "Mercedes",
      model: "C-Class",
      color: "Black",
      licensePlate: "XY99 ZAB"
    },
    specialRequests: "Meet & greet service required",
    isCancellable: true,
    createdAt: new Date("2025-01-12T14:20:00Z"),
    updatedAt: new Date("2025-01-22T16:30:00Z"),
  },
  {
    id: "booking_3",
    userId: null,
    lotId: "5", // LHR Economy Parking
    bookingReference: "PK11223344",
    startDate: new Date("2025-01-25T12:00:00Z"),
    endDate: new Date("2025-02-01T10:00:00Z"),
    totalDays: 8,
    pricePerDay: "12.00",
    totalAmount: "96.00",
    status: "confirmed",
    vehicleInfo: {
      make: "Ford",
      model: "Focus",
      color: "Blue",
      licensePlate: "CD34 EFG"
    },
    specialRequests: "Long-term parking",
    isCancellable: true,
    createdAt: new Date("2025-01-15T11:45:00Z"),
    updatedAt: new Date("2025-01-15T11:45:00Z"),
  },
  {
    id: "booking_4",
    userId: null,
    lotId: "7", // LHR Valet Parking Premium
    bookingReference: "PK55667788",
    startDate: new Date("2025-01-28T06:00:00Z"),
    endDate: new Date("2025-01-30T20:00:00Z"),
    totalDays: 3,
    pricePerDay: "55.00",
    totalAmount: "165.00",
    status: "confirmed",
    vehicleInfo: {
      make: "Audi",
      model: "A6",
      color: "Silver",
      licensePlate: "GH56 IJK"
    },
    specialRequests: "Valet service with car wash",
    isCancellable: true,
    createdAt: new Date("2025-01-18T16:15:00Z"),
    updatedAt: new Date("2025-01-18T16:15:00Z"),
  },
  {
    id: "booking_5",
    userId: null,
    lotId: "14", // LAX Official Parking Structure
    bookingReference: "PK99887766",
    startDate: new Date("2025-01-30T09:00:00Z"),
    endDate: new Date("2025-02-02T18:00:00Z"),
    totalDays: 4,
    pricePerDay: "30.00",
    totalAmount: "120.00",
    status: "confirmed",
    vehicleInfo: {
      make: "Toyota",
      model: "Camry",
      color: "Red",
      licensePlate: "LM78 NOP"
    },
    specialRequests: "Close to terminal access",
    isCancellable: true,
    createdAt: new Date("2025-01-20T10:30:00Z"),
    updatedAt: new Date("2025-01-20T10:30:00Z"),
  },
  {
    id: "booking_6",
    userId: null,
    lotId: "16", // LAX Valet Parking Premium
    bookingReference: "PK44332211",
    startDate: new Date("2025-02-05T07:00:00Z"),
    endDate: new Date("2025-02-07T15:00:00Z"),
    totalDays: 3,
    pricePerDay: "65.00",
    totalAmount: "195.00",
    status: "confirmed",
    vehicleInfo: {
      make: "Tesla",
      model: "Model 3",
      color: "White",
      licensePlate: "QR90 STU"
    },
    specialRequests: "EV charging required",
    isCancellable: true,
    createdAt: new Date("2025-01-25T13:45:00Z"),
    updatedAt: new Date("2025-01-25T13:45:00Z"),
  },

  {
    id: "booking_9",
    userId: null,
    lotId: "15", // LAX Economy Parking
    bookingReference: "PK22334455",
    startDate: new Date("2025-02-20T10:00:00Z"),
    endDate: new Date("2025-02-25T14:00:00Z"),
    totalDays: 6,
    pricePerDay: "15.00",
    totalAmount: "90.00",
    status: "confirmed",
    vehicleInfo: {
      make: "Nissan",
      model: "Altima",
      color: "Blue",
      licensePlate: "NS56 DEF"
    },
    specialRequests: "Economy option preferred",
    isCancellable: true,
    createdAt: new Date("2025-02-05T11:30:00Z"),
    updatedAt: new Date("2025-02-05T11:30:00Z"),
  },
  {
    id: "booking_10",
    userId: null,
    lotId: "8", // LHR Business Parking
    bookingReference: "PK77889900",
    startDate: new Date("2025-02-25T07:00:00Z"),
    endDate: new Date("2025-02-27T18:00:00Z"),
    totalDays: 3,
    pricePerDay: "28.00",
    totalAmount: "84.00",
    status: "confirmed",
    vehicleInfo: {
      make: "Lexus",
      model: "ES",
      color: "Silver",
      licensePlate: "LX78 GHI"
    },
    specialRequests: "Business parking with fast access",
    isCancellable: true,
    createdAt: new Date("2025-02-10T15:45:00Z"),
    updatedAt: new Date("2025-02-10T15:45:00Z"),
  },
];

async function insertSampleBookings() {
  try {
    console.log('Inserting sample bookings...');
    
    for (const booking of mockBookings) {
      await db.insert(bookings).values(booking);
      console.log(`Inserted booking: ${booking.bookingReference} - ${booking.totalDays} days at lot ${booking.lotId}`);
    }
    
    console.log('✅ All sample bookings inserted successfully!');
  } catch (error) {
    console.error('❌ Error inserting sample bookings:', error);
  } finally {
    process.exit(0);
  }
}

insertSampleBookings(); 