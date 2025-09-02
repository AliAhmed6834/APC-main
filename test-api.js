// Test script to verify the database tables API endpoint
const http = require('http');

async function testAPI() {
  try {
    console.log('🔍 Testing database tables API endpoint...');
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/database/tables',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 Response:');
        try {
          const jsonData = JSON.parse(data);
          console.log(JSON.stringify(jsonData, null, 2));
          
          if (jsonData.success && jsonData.tables) {
            console.log(`\n✅ SUCCESS: Found ${jsonData.totalTables} tables`);
            console.log(`- Core tables: ${jsonData.coreTables}`);
            console.log(`- Admin tables: ${jsonData.adminTables}`);
            console.log(`- Analytics tables: ${jsonData.analyticsTables}`);
            console.log(`- Other tables: ${jsonData.otherTables}`);
          } else {
            console.log('❌ API returned error or no tables data');
          }
        } catch (error) {
          console.log('❌ Failed to parse JSON response:');
          console.log(data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
    });

    req.end();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
