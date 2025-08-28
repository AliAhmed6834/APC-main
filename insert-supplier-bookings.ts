import { db } from './server/db';
import { supplierBookings } from './shared/schema';

const mockSupplierBookings = [
  {
    id: "supplier_booking_1",
    bookingId: "booking_1",
    supplierUserId: "supplier_user_1",
    status: "confirmed",
    notes: "Customer requested covered parking - assigned to premium section",
    assignedTo: null,
    createdAt: new Date("2025-01-10T10:00:00Z"),
    updatedAt: new Date("2025-01-10T10:00:00Z"),
  },
  {
    id: "supplier_booking_2",
    bookingId: "booking_2",
    supplierUserId: "supplier_user_1",
    status: "completed",
    notes: "Meet & greet service completed successfully. Customer very satisfied.",
    assignedTo: null,
    createdAt: new Date("2025-01-12T15:00:00Z"),
    updatedAt: new Date("2025-01-22T17:00:00Z"),
  },
  {
    id: "supplier_booking_3",
    bookingId: "booking_3",
    supplierUserId: "supplier_user_1",
    status: "confirmed",
    notes: "Long-term parking - 8 days. Assigned to economy section with regular shuttle service.",
    assignedTo: null,
    createdAt: new Date("2025-01-15T12:00:00Z"),
    updatedAt: new Date("2025-01-15T12:00:00Z"),
  },
  {
    id: "supplier_booking_4",
    bookingId: "booking_4",
    supplierUserId: "supplier_user_1",
    status: "confirmed",
    notes: "Premium valet service with car wash requested. Assigned to valet team.",
    assignedTo: null,
    createdAt: new Date("2025-01-18T17:00:00Z"),
    updatedAt: new Date("2025-01-18T17:00:00Z"),
  },
  {
    id: "supplier_booking_5",
    bookingId: "booking_5",
    supplierUserId: "supplier_user_1",
    status: "confirmed",
    notes: "LAX official parking - direct terminal access. Customer prefers covered parking.",
    assignedTo: null,
    createdAt: new Date("2025-01-20T11:00:00Z"),
    updatedAt: new Date("2025-01-20T11:00:00Z"),
  },
  {
    id: "supplier_booking_6",
    bookingId: "booking_6",
    supplierUserId: "supplier_user_1",
    status: "confirmed",
    notes: "Tesla Model 3 - EV charging required. Assigned to premium valet section.",
    assignedTo: null,
    createdAt: new Date("2025-01-25T14:00:00Z"),
    updatedAt: new Date("2025-01-25T14:00:00Z"),
  },
  {
    id: "supplier_booking_8",
    bookingId: "booking_8",
    supplierUserId: "supplier_user_12",
    status: "confirmed",
    notes: "Manchester multi-storey - direct terminal access. No shuttle required.",
    assignedTo: null,
    createdAt: new Date("2025-02-01T15:00:00Z"),
    updatedAt: new Date("2025-02-01T15:00:00Z"),
  },
  {
    id: "supplier_booking_9",
    bookingId: "booking_9",
    supplierUserId: "supplier_user_2",
    status: "confirmed",
    notes: "LAX economy parking - 6 days. Assigned to economy section with shuttle service.",
    assignedTo: null,
    createdAt: new Date("2025-02-05T12:00:00Z"),
    updatedAt: new Date("2025-02-05T12:00:00Z"),
  },
  {
    id: "supplier_booking_10",
    bookingId: "booking_10",
    supplierUserId: "supplier_user_7",
    status: "confirmed",
    notes: "Business parking - fast access required. Assigned to business section.",
    assignedTo: "supplier_user_8",
    createdAt: new Date("2025-02-10T16:00:00Z"),
    updatedAt: new Date("2025-02-10T16:00:00Z"),
  },
  // Additional supplier bookings for different scenarios
  {
    id: "supplier_booking_11",
    bookingId: "PK12345678",
    supplierUserId: "supplier_user_1",
    status: "cancelled",
    notes: "Customer cancelled due to flight change. Full refund processed.",
    assignedTo: null,
    createdAt: new Date("2025-01-08T09:00:00Z"),
    updatedAt: new Date("2025-01-09T14:00:00Z"),
  },
  {
    id: "supplier_booking_12",
    bookingId: "PK87654321",
    supplierUserId: "supplier_user_3",
    status: "no_show",
    notes: "Customer did not arrive. Attempted contact but no response.",
    assignedTo: "supplier_user_4",
    createdAt: new Date("2025-01-15T08:00:00Z"),
    updatedAt: new Date("2025-01-16T10:00:00Z"),
  },
  {
    id: "supplier_booking_13",
    bookingId: "PK11223344",
    supplierUserId: "supplier_user_5",
    status: "completed",
    notes: "Long-term parking completed successfully. Vehicle returned in excellent condition.",
    assignedTo: "supplier_user_6",
    createdAt: new Date("2025-01-20T11:00:00Z"),
    updatedAt: new Date("2025-02-01T11:00:00Z"),
  },
  {
    id: "supplier_booking_14",
    bookingId: "PK55667788",
    supplierUserId: "supplier_user_7",
    status: "confirmed",
    notes: "Premium valet service. Customer requested car wash and detailing.",
    assignedTo: "supplier_user_8",
    createdAt: new Date("2025-01-22T13:00:00Z"),
    updatedAt: new Date("2025-01-22T13:00:00Z"),
  },
  {
    id: "supplier_booking_15",
    bookingId: "PK99887766",
    supplierUserId: "supplier_user_1",
    status: "confirmed",
    notes: "LAX parking - customer prefers close to terminal access.",
    assignedTo: "supplier_user_2",
    createdAt: new Date("2025-01-25T16:00:00Z"),
    updatedAt: new Date("2025-01-25T16:00:00Z"),
  },
];

async function insertSupplierBookings() {
  try {
    console.log('Inserting supplier bookings...');
    
    for (const supplierBooking of mockSupplierBookings) {
      await db.insert(supplierBookings).values(supplierBooking);
      console.log(`Inserted supplier booking: ${supplierBooking.bookingId} - Status: ${supplierBooking.status}`);
    }
    
    console.log('✅ All supplier bookings inserted successfully!');
  } catch (error) {
    console.error('❌ Error inserting supplier bookings:', error);
  } finally {
    process.exit(0);
  }
}

insertSupplierBookings(); 