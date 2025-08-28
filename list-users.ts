import { db } from './server/db';
import { users } from './shared/schema';

async function listUsers() {
  try {
    console.log('🔍 Listing existing users...\n');
    
    const existingUsers = await db.select().from(users);
    
    console.log(`Found ${existingUsers.length} users:\n`);
    
    existingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Email: ${user.email}, Name: ${user.firstName} ${user.lastName}`);
    });
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
  } finally {
    process.exit(0);
  }
}

listUsers(); 