// Test script to verify database API endpoints
import fetch from 'node-fetch';

const API_BASE_URL = 'https://airport-management-system-nxzu.onrender.com';

async function testDatabaseAPI() {
    console.log('🔍 Testing Database API Endpoints');
    console.log('================================');
    
    try {
        // Test the inspect-data endpoint
        console.log('\n📊 Testing /api/admin/inspect-data endpoint...');
        const inspectResponse = await fetch(`${API_BASE_URL}/api/admin/inspect-data`);
        
        if (inspectResponse.ok) {
            const data = await inspectResponse.json();
            console.log('✅ Inspect endpoint working!');
            console.log(`📋 Found ${data.totalTables} tables`);
            console.log(`🗄️ Database status: ${data.database.status}`);
            
            if (data.tables && data.tables.length > 0) {
                console.log('\n📊 First 5 tables:');
                data.tables.slice(0, 5).forEach((table, index) => {
                    console.log(`${index + 1}. ${table.table_name} - ${table.row_count} records, ${table.column_count} columns, ${table.size}`);
                });
                
                if (data.tables.length > 5) {
                    console.log(`... and ${data.tables.length - 5} more tables`);
                }
            }
        } else {
            console.log(`❌ Inspect endpoint failed: ${inspectResponse.status} ${inspectResponse.statusText}`);
        }
        
        // Test the discover-tables endpoint
        console.log('\n🔍 Testing /api/admin/discover-tables endpoint...');
        const discoverResponse = await fetch(`${API_BASE_URL}/api/admin/discover-tables`);
        
        if (discoverResponse.ok) {
            const data = await discoverResponse.json();
            console.log('✅ Discover endpoint working!');
            console.log(`📋 Found ${data.totalTables} tables`);
            
            if (data.tables && data.tables.length > 0) {
                console.log('\n📊 Table details:');
                data.tables.slice(0, 3).forEach((table, index) => {
                    console.log(`${index + 1}. ${table.tablename} - ${table.column_count} columns, ${table.size}`);
                });
            }
        } else {
            console.log(`❌ Discover endpoint failed: ${discoverResponse.status} ${discoverResponse.statusText}`);
        }
        
        // Test the main inspect endpoint (HTML page)
        console.log('\n🌐 Testing /api/admin/inspect endpoint (HTML page)...');
        const htmlResponse = await fetch(`${API_BASE_URL}/api/admin/inspect`);
        
        if (htmlResponse.ok) {
            console.log('✅ HTML page endpoint working!');
            console.log(`📄 Content type: ${htmlResponse.headers.get('content-type')}`);
        } else {
            console.log(`❌ HTML page endpoint failed: ${htmlResponse.status} ${htmlResponse.statusText}`);
        }
        
    } catch (error) {
        console.error('❌ Error testing API:', error.message);
    }
}

// Run the test
testDatabaseAPI();
