import { db } from './server/db';
import { supplierUsers } from './shared/schema';

async function listSupplierUsers() {
  try {
    console.log('🔍 Listing existing supplier users...\n');
    
    const existingUsers = await db.select().from(supplierUsers);
    
    console.log(`Found ${existingUsers.length} supplier users:\n`);
    
    existingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Email: ${user.email}, Name: ${user.firstName} ${user.lastName}, Supplier: ${user.supplierId}`);
    });
    
  } catch (error) {
    console.error('❌ Error listing supplier users:', error);
  } finally {
    process.exit(0);
  }
}

listSupplierUsers(); 