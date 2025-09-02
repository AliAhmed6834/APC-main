import express from 'express';
import { db } from '../db';
import { airports, bookings, users, parkingSuppliers, parkingLots } from '../../shared/schema';
import { eq, desc, asc, sql } from 'drizzle-orm';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Serve the database inspection page
router.get('/database', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Database Inspection - Backend Access</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                margin: 0;
                padding: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                border-radius: 15px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                padding: 40px;
                text-align: center;
                max-width: 600px;
            }
            h1 {
                color: #2c3e50;
                margin-bottom: 20px;
            }
            .info {
                background: #e3f2fd;
                border: 1px solid #2196f3;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            .button {
                display: inline-block;
                background: #3498db;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 8px;
                margin: 10px;
                transition: background 0.3s ease;
            }
            .button:hover {
                background: #2980b9;
            }
            .api-info {
                background: #f8f9fa;
                border: 1px solid #e1e8ed;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                text-align: left;
            }
            .api-info h3 {
                margin-top: 0;
                color: #2c3e50;
            }
            .endpoint {
                background: #2c3e50;
                color: #ecf0f1;
                padding: 8px 12px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                margin: 5px 0;
                font-size: 0.9rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🗄️ Database Inspection - Backend Access</h1>
            
            <div class="info">
                <h3>✅ Backend Server Running</h3>
                <p>Your Express server is running on <strong>http://localhost:5000</strong></p>
                <p>Database inspection API endpoints are available and working!</p>
            </div>

            <div class="api-info">
                <h3>🔧 Available API Endpoints:</h3>
                <div class="endpoint">GET /api/admin/database/tables</div>
                <div class="endpoint">POST /api/admin/database/table-data</div>
                <div class="endpoint">GET /api/admin/users</div>
                <div class="endpoint">GET /api/admin/suppliers</div>
                <div class="endpoint">GET /api/admin/bookings</div>
            </div>

            <div class="info">
                <h3>🚀 Access Options:</h3>
                <p>Choose how you want to access the database inspection:</p>
            </div>

            <a href="http://localhost:5173/admin/database" class="button">
                🎨 Frontend UI (React)
            </a>
            
            <a href="/api/admin/database/tables" class="button">
                📊 API Endpoint (JSON)
            </a>

            <div class="api-info">
                <h3>📋 Quick Test:</h3>
                <p>Test the API directly:</p>
                <div class="endpoint">curl -X GET "http://localhost:5000/api/admin/database/tables"</div>
                <div class="endpoint">curl -X POST "http://localhost:5000/api/admin/database/table-data" -H "Content-Type: application/json" -d '{"tableName":"users","limit":5}'</div>
            </div>
        </div>
    </body>
    </html>
  `);
});

// CORS middleware for admin routes
router.use((req, res, next) => {
  // Allow requests from localhost:5000 (development) and the production frontend
  const allowedOrigins = [
    'http://localhost:5000',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://airport-management-system-nxzu.onrender.com',
    'https://airportparking.com'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin as string)) {
    res.setHeader('Access-Control-Allow-Origin', origin as string);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Serve the database inspection page
router.get('/inspect', (req, res) => {
  try {
    const htmlPath = path.join(__dirname, '../../database-inspection.html');
    if (fs.existsSync(htmlPath)) {
      res.sendFile(htmlPath);
    } else {
      res.status(404).send('Database inspection page not found');
    }
  } catch (error) {
    res.status(500).send('Error serving database inspection page');
  }
});

// Alternative: Serve HTML content directly
router.get('/inspect-html', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Database Inspection - Redirect</title>
    </head>
    <body>
        <h1>Database Inspection</h1>
        <p>Redirecting to the full inspection page...</p>
        <script>
            window.location.href = '/api/admin/inspect';
        </script>
    </body>
    </html>
  `);
});

// Middleware to check if user is admin (basic implementation)
const isAdmin = (req: any, res: any, next: any) => {
  // TODO: Implement proper admin authentication
  // For now, allow all requests (remove this in production)
  next();
  
  // Uncomment when you implement admin auth:
  // if (req.user && req.user.isAdmin) {
  //   next();
  // } else {
  //   res.status(403).json({ error: 'Admin access required' });
  // }
};

// Apply admin middleware to all routes
router.use(isAdmin);

// GET /api/admin/database/tables - Get all database tables with details
router.get('/database/tables', async (req, res) => {
  try {
    // Get all tables in the public schema
    const tablesQuery = `
      SELECT 
        schemaname,
        tablename,
        tableowner,
        hasindexes,
        hasrules,
        hastriggers,
        rowsecurity
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    const tablesResult = await db.execute(sql.raw(tablesQuery));
    const tables = tablesResult.rows;
    
    // Get record counts and sizes for each table
    const tablesWithDetails = [];
    
    for (const table of tables) {
      try {
        // Get record count
        const countResult = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${table.tablename}`));
        const recordCount = parseInt(countResult.rows[0].count);

        // Get table size
        const sizeResult = await db.execute(sql.raw(`
          SELECT pg_size_pretty(pg_total_relation_size('${table.tablename}')) as size
        `));
        const tableSize = sizeResult.rows[0].size;

        // Categorize table type
        let type = 'other';
        if (['users', 'sessions', 'airports', 'parking_suppliers', 'parking_lots', 'parking_pricing', 'bookings', 'reviews', 'parking_slots', 'supplier_users', 'supplier_sessions', 'supplier_bookings', 'exchange_rates', 'locale_content', 'payment_methods', 'transactions', 'payment_gateway_configs', 'email_templates', 'email_logs', 'sms_logs', 'user_activity_logs', 'search_analytics', 'revenue_analytics', 'supplier_performance', 'user_preferences', 'user_loyalty', 'supplier_contracts', 'supplier_metrics', 'booking_status_history', 'saved_searches', 'search_filters'].includes(table.tablename)) {
          type = 'core';
        } else if (table.tablename.startsWith('admin_')) {
          type = 'admin';
        } else if (table.tablename.includes('analytics')) {
          type = 'analytics';
        }

        tablesWithDetails.push({
          name: table.tablename,
          status: 'exists',
          records: recordCount,
          type: type,
          size: tableSize,
          hasIndexes: table.hasindexes,
          hasTriggers: table.hastriggers,
          hasRules: table.hasrules,
          rowSecurity: table.rowsecurity
        });
      } catch (error) {
        // If we can't get details for a table, still include it
        tablesWithDetails.push({
          name: table.tablename,
          status: 'exists',
          records: 0,
          type: 'other',
          size: 'Unknown',
          hasIndexes: table.hasindexes,
          hasTriggers: table.hastriggers,
          hasRules: table.hasrules,
          rowSecurity: table.rowsecurity,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.json({
      success: true,
      tables: tablesWithDetails,
      totalTables: tablesWithDetails.length,
      coreTables: tablesWithDetails.filter(t => t.type === 'core').length,
      adminTables: tablesWithDetails.filter(t => t.type === 'admin').length,
      analyticsTables: tablesWithDetails.filter(t => t.type === 'analytics').length,
      otherTables: tablesWithDetails.filter(t => t.type === 'other').length
    });

  } catch (error) {
    console.error('Error fetching database tables:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch database tables',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/admin/database/table-data - Get data from a specific table
router.post('/database/table-data', async (req, res) => {
  try {
    const { tableName, limit = 100, offset = 0 } = req.body;
    
    if (!tableName) {
      return res.status(400).json({
        success: false,
        error: 'Table name is required'
      });
    }

    // Validate table name to prevent SQL injection
    const allowedTables = [
      'users', 'bookings', 'airports', 'parking_suppliers', 'parking_lots', 
      'parking_pricing', 'parking_slots', 'reviews', 'supplier_users', 
      'supplier_sessions', 'supplier_bookings', 'exchange_rates', 
      'locale_content', 'payment_methods', 'transactions', 
      'payment_gateway_configs', 'email_templates', 'email_logs', 
      'sms_logs', 'user_activity_logs', 'search_analytics', 
      'revenue_analytics', 'supplier_performance', 'user_preferences', 
      'user_loyalty', 'supplier_contracts', 'supplier_metrics', 
      'booking_status_history', 'saved_searches', 'search_filters'
    ];

    if (!allowedTables.includes(tableName)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid table name'
      });
    }

    // Get table data with pagination
    const dataQuery = `
      SELECT * FROM ${tableName} 
      ORDER BY created_at DESC 
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;

    const dataResult = await db.execute(sql.raw(dataQuery));
    const tableData = dataResult.rows;

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
    const countResult = await db.execute(sql.raw(countQuery));
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      tableName,
      data: tableData,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: totalCount,
        hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching table data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch table data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/admin/airports - Get all airports with admin data
router.get('/airports', async (req, res) => {
  try {
    const airportsList = await db
      .select({
        id: airports.id,
        code: airports.code,
        name: airports.name,
        city: airports.city,
        country: airports.country,
        createdAt: airports.createdAt
      })
      .from(airports)
      .orderBy(asc(airports.code));

    res.json(airportsList);
  } catch (error) {
    console.error('Error fetching airports:', error);
    res.status(500).json({
      error: 'Failed to fetch airports',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/admin/bookings - Get all bookings with admin data
router.get('/bookings', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, airport, supplier } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        status: bookings.status,
        createdAt: bookings.createdAt,
        // Include related data
        userEmail: users.email,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        parkingLotName: parkingLots.name,
        airportCode: airports.code,
        supplierName: parkingSuppliers.name
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
              .leftJoin(parkingLots, eq(bookings.id, parkingLots.id))
      .leftJoin(airports, eq(parkingLots.airportId, airports.id))
      .leftJoin(parkingSuppliers, eq(parkingLots.supplierId, parkingSuppliers.id));

    // Apply filters
    if (status) {
      query = query.where(eq(bookings.status, status as string));
    }
    if (airport) {
      query = query.where(eq(airports.code, airport as string));
    }
    if (supplier) {
      query = query.where(eq(parkingSuppliers.name, supplier as string));
    }

    // Get total count for pagination
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(bookings);
    
    const totalCount = await countQuery;
    const total = totalCount[0]?.count || 0;

    // Apply pagination and ordering
    const bookingsList = await query
      .orderBy(desc(bookings.createdAt))
      .limit(Number(limit))
      .offset(offset);

    res.json({
      bookings: bookingsList,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch bookings',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/admin/users - Get all users with admin data
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        preferredLocale: users.preferredLocale,
        preferredCurrency: users.preferredCurrency,
        detectedCountry: users.detectedCountry,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users);

    // Note: status filtering removed since accountStatus doesn't exist in schema

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    
    const total = totalCount[0]?.count || 0;

    const usersList = await query
      .orderBy(desc(users.createdAt))
      .limit(Number(limit))
      .offset(offset);

    res.json({
      users: usersList,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/admin/suppliers - Get all parking suppliers with admin data
router.get('/suppliers', async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db
      .select({
        id: parkingSuppliers.id,
        name: parkingSuppliers.name,
        description: parkingSuppliers.description,
        logoUrl: parkingSuppliers.logoUrl,
        contactEmail: parkingSuppliers.contactEmail,
        contactPhone: parkingSuppliers.contactPhone,
        isActive: parkingSuppliers.isActive,
        createdAt: parkingSuppliers.createdAt,
        updatedAt: parkingSuppliers.updatedAt
      })
      .from(parkingSuppliers);

    if (status) {
      query = query.where(eq(parkingSuppliers.isActive, status === 'active'));
    }

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(parkingSuppliers);
    
    const total = totalCount[0]?.count || 0;

    const suppliersList = await query
      .orderBy(desc(parkingSuppliers.createdAt))
      .limit(Number(limit))
      .offset(offset);

    res.json({
      suppliers: suppliersList,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch suppliers',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/admin/dashboard - Get dashboard overview data
router.get('/dashboard', async (req, res) => {
  try {
    // Get counts
    const [usersCount, bookingsCount, suppliersCount, airportsCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(bookings),
      db.select({ count: sql<number>`count(*)` }).from(parkingSuppliers),
      db.select({ count: sql<number>`count(*)` }).from(airports)
    ]);

    // Get recent bookings
    const recentBookings = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        totalAmount: bookings.totalAmount,
        createdAt: bookings.createdAt,
        userEmail: users.email
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .orderBy(desc(bookings.createdAt))
      .limit(10);

    // Get inactive suppliers (as a proxy for pending verifications)
    const pendingVerifications = await db
      .select({
        id: parkingSuppliers.id,
        name: parkingSuppliers.name,
        contactEmail: parkingSuppliers.contactEmail,
        isActive: parkingSuppliers.isActive,
        createdAt: parkingSuppliers.createdAt
      })
      .from(parkingSuppliers)
      .where(eq(parkingSuppliers.isActive, false))
      .orderBy(asc(parkingSuppliers.createdAt))
      .limit(10);

    res.json({
      overview: {
        totalUsers: usersCount[0]?.count || 0,
        totalBookings: bookingsCount[0]?.count || 0,
        totalSuppliers: suppliersCount[0]?.count || 0,
        totalAirports: airportsCount[0]?.count || 0
      },
      recentBookings,
      pendingVerifications
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/admin/bookings/:id/flag - Flag a booking for review
router.put('/bookings/:id/flag', async (req, res) => {
  try {
    const { id } = req.params;
    const { flaggedForReview, flagReason } = req.body;

    await db
      .update(bookings)
      .set({
        flaggedForReview: flaggedForReview || false,
        flagReason: flagReason || null,
        updatedAt: new Date()
      })
      .where(eq(bookings.id, id));

    res.json({ message: 'Booking flag updated successfully' });
  } catch (error) {
    console.error('Error updating booking flag:', error);
    res.status(500).json({ 
      error: 'Failed to update booking flag',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/admin/suppliers/:id/verify - Update supplier status
router.put('/suppliers/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, description } = req.body;

    await db
      .update(parkingSuppliers)
      .set({
        isActive: isActive !== undefined ? isActive : true,
        description: description || null,
        updatedAt: new Date()
      })
      .where(eq(parkingSuppliers.id, id));

    res.json({ message: 'Supplier status updated successfully' });
  } catch (error) {
    console.error('Error updating supplier status:', error);
    res.status(500).json({ 
      error: 'Failed to update supplier status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/admin/airports/:id - Update airport data
router.put('/airports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, state, country, timezone } = req.body;

    await db
      .update(airports)
      .set({
        name: name || null,
        city: city || null,
        state: state || null,
        country: country || null,
        timezone: timezone || null
      })
      .where(eq(airports.id, id));

    res.json({ message: 'Airport updated successfully' });
  } catch (error) {
    console.error('Error updating airport:', error);
    res.status(500).json({ 
      error: 'Failed to update airport',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/admin/analytics - Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    // Get basic analytics data
    const totalUsers = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    const totalBookings = await db.execute(sql`SELECT COUNT(*) as count FROM bookings`);
    const totalSuppliers = await db.execute(sql`SELECT COUNT(*) as count FROM parking_suppliers`);
    const totalAirports = await db.execute(sql`SELECT COUNT(*) as count FROM airports`);

    const analytics = {
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalBookings: parseInt(totalBookings.rows[0].count),
      totalSuppliers: parseInt(totalSuppliers.rows[0].count),
      totalAirports: parseInt(totalAirports.rows[0].count),
      revenue: {
        total: 0,
        monthly: 0,
        growth: 0
      },
      bookings: {
        total: parseInt(totalBookings.rows[0].count),
        pending: 0,
        completed: 0,
        cancelled: 0
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/admin/customers - Get customers data (alias for users)
router.get('/customers', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        preferredLocale: users.preferredLocale,
        preferredCurrency: users.preferredCurrency,
        detectedCountry: users.detectedCountry,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string))
      .orderBy(desc(users.createdAt));

    const customers = await query;

    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch customers',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/admin/payments - Get payments data
router.get('/payments', async (req, res) => {
  try {
    // Get payment data from transactions table
    const payments = await db.execute(sql`
      SELECT 
        t.id,
        t.amount,
        t.currency,
        t.status,
        t.payment_method,
        t.created_at,
        b.id as booking_id,
        u.email as user_email
      FROM transactions t
      LEFT JOIN bookings b ON t.booking_id = b.id
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 50
    `);

    res.json(payments.rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payments',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
