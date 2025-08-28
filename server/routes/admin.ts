import express from 'express';
import { db } from '../db';
import { airports, bookings, users, parkingSuppliers, parkingLots } from '../../shared/schema';
import { eq, desc, asc, sql } from 'drizzle-orm';

const router = express.Router();

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
        adminNotes: airports.adminNotes,
        priorityLevel: airports.priorityLevel,
        maintenanceMode: airports.maintenanceMode,
        createdAt: airports.createdAt,
        updatedAt: airports.updatedAt
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
        parkingLotId: bookings.parkingLotId,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        totalPrice: bookings.totalPrice,
        status: bookings.status,
        adminNotes: bookings.adminNotes,
        flaggedForReview: bookings.flaggedForReview,
        flagReason: bookings.flagReason,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
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
      .leftJoin(parkingLots, eq(bookings.parkingLotId, parkingLots.id))
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
        isAdmin: users.isAdmin,
        adminRole: users.adminRole,
        lastActivity: users.lastActivity,
        accountStatus: users.accountStatus,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users);

    if (status) {
      query = query.where(eq(users.accountStatus, status as string));
    }

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
        email: parkingSuppliers.email,
        phone: parkingSuppliers.phone,
        adminNotes: parkingSuppliers.adminNotes,
        verificationStatus: parkingSuppliers.verificationStatus,
        verificationDate: parkingSuppliers.verificationDate,
        createdAt: parkingSuppliers.createdAt,
        updatedAt: parkingSuppliers.updatedAt
      })
      .from(parkingSuppliers);

    if (status) {
      query = query.where(eq(parkingSuppliers.verificationStatus, status as string));
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
        totalPrice: bookings.totalPrice,
        createdAt: bookings.createdAt,
        userEmail: users.email
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .orderBy(desc(bookings.createdAt))
      .limit(10);

    // Get pending verifications
    const pendingVerifications = await db
      .select({
        id: parkingSuppliers.id,
        name: parkingSuppliers.name,
        email: parkingSuppliers.email,
        verificationStatus: parkingSuppliers.verificationStatus,
        createdAt: parkingSuppliers.createdAt
      })
      .from(parkingSuppliers)
      .where(eq(parkingSuppliers.verificationStatus, 'pending'))
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

// PUT /api/admin/suppliers/:id/verify - Update supplier verification status
router.put('/suppliers/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus, adminNotes } = req.body;

    await db
      .update(parkingSuppliers)
      .set({
        verificationStatus: verificationStatus || 'pending',
        adminNotes: adminNotes || null,
        verificationDate: verificationStatus === 'verified' ? new Date() : null,
        updatedAt: new Date()
      })
      .where(eq(parkingSuppliers.id, id));

    res.json({ message: 'Supplier verification status updated successfully' });
  } catch (error) {
    console.error('Error updating supplier verification:', error);
    res.status(500).json({ 
      error: 'Failed to update supplier verification',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/admin/airports/:id - Update airport admin data
router.put('/airports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes, priorityLevel, maintenanceMode } = req.body;

    await db
      .update(airports)
      .set({
        adminNotes: adminNotes || null,
        priorityLevel: priorityLevel || 'normal',
        maintenanceMode: maintenanceMode || false,
        updatedAt: new Date()
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

export default router;
