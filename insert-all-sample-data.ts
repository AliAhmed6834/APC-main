import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const scripts = [
  'insert-airports.ts',
  'insert-parking-suppliers.ts',
  'insert-parking-lots.ts',
  'insert-parking-pricing.ts',
  'insert-supplier-users.ts',
  'insert-parking-slots.ts',
  'insert-sample-bookings.ts',
  'insert-sample-reviews.ts',
  'insert-supplier-bookings.ts'
];

async function runScript(scriptName) {
  try {
    console.log(`\n🚀 Running ${scriptName}...`);
    const { stdout, stderr } = await execAsync(`npx tsx ${scriptName}`);
    
    if (stdout) {
      console.log(stdout);
    }
    
    if (stderr) {
      console.error(stderr);
    }
    
    console.log(`✅ ${scriptName} completed successfully!`);
  } catch (error) {
    console.error(`❌ Error running ${scriptName}:`, error.message);
    throw error;
  }
}

async function insertAllSampleData() {
  console.log('🎯 Starting to insert all sample data...\n');
  
  try {
    for (const script of scripts) {
      await runScript(script);
    }
    
    console.log('\n🎉 All sample data has been inserted successfully!');
    console.log('\n📊 Summary of inserted data:');
    console.log('   • 30 airports (US and UK)');
    console.log('   • 8 parking suppliers');
    console.log('   • 18 parking lots');
    console.log('   • 36 pricing records (USD and GBP)');
    console.log('   • 13 supplier users');
    console.log('   • 540 parking slots (30 days × 18 lots)');
    console.log('   • 10 sample bookings');
    console.log('   • 20 sample reviews');
    console.log('   • 15 supplier bookings');
    
  } catch (error) {
    console.error('\n💥 Failed to insert all sample data:', error.message);
    process.exit(1);
  }
}

// Run the master script
insertAllSampleData(); 