import { db } from './server/db';
import { supplierUsers } from './shared/schema';

const mockSupplierUsers = [
  {
    id: "supplier_user_1",
    supplierId: "supplier1",
    email: "admin@heathrowparking.com",
    firstName: "John",
    lastName: "Smith",
    role: "admin",
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "supplier_user_2",
    supplierId: "supplier1",
    email: "manager@heathrowparking.com",
    firstName: "Sarah",
    lastName: "Johnson",
    role: "manager",
    isActive: true,
    lastLoginAt: new Date(Date.now() - 86400000), // 1 day ago
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "supplier_user_3",
    supplierId: "supplier2",
    email: "admin@parkflyuk.com",
    firstName: "Michael",
    lastName: "Brown",
    role: "admin",
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "supplier_user_4",
    supplierId: "supplier2",
    email: "operator@parkflyuk.com",
    firstName: "Emma",
    lastName: "Wilson",
    role: "operator",
    isActive: true,
    lastLoginAt: new Date(Date.now() - 172800000), // 2 days ago
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "supplier_user_5",
    supplierId: "supplier3",
    email: "admin@airportparkingsolutions.co.uk",
    firstName: "David",
    lastName: "Taylor",
    role: "admin",
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "supplier_user_6",
    supplierId: "supplier3",
    email: "manager@airportparkingsolutions.co.uk",
    firstName: "Lisa",
    lastName: "Anderson",
    role: "manager",
    isActive: true,
    lastLoginAt: new Date(Date.now() - 3600000), // 1 hour ago
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "supplier_user_7",
    supplierId: "supplier4",
    email: "admin@premiumparkingservices.com",
    firstName: "Robert",
    lastName: "Garcia",
    role: "admin",
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "supplier_user_8",
    supplierId: "supplier4",
    email: "concierge@premiumparkingservices.com",
    firstName: "Jennifer",
    lastName: "Martinez",
    role: "operator",
    isActive: true,
    lastLoginAt: new Date(Date.now() - 7200000), // 2 hours ago
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "supplier_user_9",
    supplierId: "supplier5",
    email: "admin@quickparkheathrow.co.uk",
    firstName: "Christopher",
    lastName: "Lee",
    role: "admin",
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "supplier_user_10",
    supplierId: "supplier5",
    email: "shuttle@quickparkheathrow.co.uk",
    firstName: "Amanda",
    lastName: "White",
    role: "operator",
    isActive: true,
    lastLoginAt: new Date(Date.now() - 1800000), // 30 minutes ago
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "supplier_user_11",
    supplierId: "supplier6",
    email: "admin@gatwickparking.co.uk",
    firstName: "James",
    lastName: "Thompson",
    role: "admin",
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "supplier_user_12",
    supplierId: "supplier7",
    email: "admin@manchesterairportparking.com",
    firstName: "Patricia",
    lastName: "Harris",
    role: "admin",
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "supplier_user_13",
    supplierId: "supplier8",
    email: "admin@birminghamairportparking.co.uk",
    firstName: "Richard",
    lastName: "Clark",
    role: "admin",
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function insertSupplierUsers() {
  try {
    console.log('Inserting supplier users...');
    
    for (const user of mockSupplierUsers) {
      await db.insert(supplierUsers).values(user);
      console.log(`Inserted supplier user: ${user.firstName} ${user.lastName} (${user.email})`);
    }
    
    console.log('✅ All supplier users inserted successfully!');
  } catch (error) {
    console.error('❌ Error inserting supplier users:', error);
  } finally {
    process.exit(0);
  }
}

insertSupplierUsers(); 