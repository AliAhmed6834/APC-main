import type { Express } from "express";
import { z } from "zod";
import { SupplierAuthService } from "./supplierAuth";
import { 
  isSupplierAuthenticated, 
  requireSupplierRole, 
  requireSupplierOwnership,
  type SupplierRequest 
} from "./middleware/supplierAuth";
import { storage } from "./storage";
import { 
  parkingSuppliers,
  parkingLots,
  parkingPricing,
  pricingTemplates,
  pricingRules,
  supplierNotifications,
  supplierAnalytics,
  supplierDocuments,
  supplierPayments,
  bookings,
  reviews,
  airports
} from "@shared/schema";
import { eq, and, desc, asc, sql, gte, lte, like } from "drizzle-orm";

// Validation schemas
const supplierLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const supplierRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  supplierId: z.string().optional(),
  role: z.enum(['owner', 'manager', 'staff']).default('manager'),
});

const parkingLotSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  address: z.string().min(1),
  airportId: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  distanceToTerminal: z.number().optional(),
  shuttleFrequencyMinutes: z.number().optional(),
  isShuttleIncluded: z.boolean().default(true),
  isCovered: z.boolean().default(false),
  hasEvCharging: z.boolean().default(false),
  hasCarWash: z.boolean().default(false),
  hasSecurityPatrol: z.boolean().default(false),
  hasCctv: z.boolean().default(false),
  totalSpaces: z.number().optional(),
  imageUrl: z.string().url().optional(),
});

const pricingSchema = z.object({
  priceType: z.enum(['daily', 'weekly', 'monthly']),
  basePrice: z.number().positive(),
  currency: z.string().length(3),
  localizedPrice: z.number().positive(),
  taxRate: z.number().min(0).max(1).default(0),
  region: z.string().length(2),
  discountedPrice: z.number().positive().optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
});

const pricingRuleSchema = z.object({
  ruleType: z.enum(['seasonal', 'demand', 'duration', 'day_of_week']),
  ruleName: z.string().min(1),
  ruleConfig: z.record(z.any()),
  multiplier: z.number().positive().default(1.0),
  fixedAdjustment: z.number().default(0),
  priority: z.number().default(0),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
});

export function registerSupplierRoutes(app: Express) {
  // Supplier Authentication Routes
  app.post('/api/supplier/auth/register', async (req, res) => {
    try {
      console.log('Registration request body:', req.body);
      const data = supplierRegisterSchema.parse(req.body);
      console.log('Parsed registration data:', data);
      
      const result = await SupplierAuthService.registerSupplierUser(data);
      console.log('Registration result:', result);
      
      if (result.success) {
        res.status(201).json({
          message: 'Supplier user registered successfully',
          user: result.user
        });
      } else {
        res.status(400).json({
          message: result.error
        });
      }
    } catch (error: any) {
      console.error('Supplier registration error:', error);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      res.status(400).json({ 
        message: 'Invalid registration data',
        error: error?.message || 'Unknown error'
      });
    }
  });

  app.post('/api/supplier/auth/login', async (req, res) => {
    try {
      const { email, password } = supplierLoginSchema.parse(req.body);
      const result = await SupplierAuthService.login(email, password);
      
      if (result.success && result.sessionToken) {
        // Set session cookie
        res.cookie('supplier_session', result.sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          sameSite: 'strict'
        });
        
        res.json({
          message: 'Login successful',
          user: result.user,
          sessionToken: result.sessionToken
        });
      } else {
        res.status(401).json({
          message: result.error || 'Login failed'
        });
      }
    } catch (error) {
      console.error('Supplier login error:', error);
      res.status(400).json({ message: 'Invalid login data' });
    }
  });

  app.post('/api/supplier/auth/logout', isSupplierAuthenticated, async (req: SupplierRequest, res) => {
    try {
      const sessionToken = req.cookies?.supplier_session || req.headers.authorization?.substring(7);
      if (sessionToken) {
        await SupplierAuthService.logout(sessionToken);
        res.clearCookie('supplier_session');
      }
      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Supplier logout error:', error);
      res.status(500).json({ message: 'Logout failed' });
    }
  });

  app.get('/api/supplier/auth/me', isSupplierAuthenticated, async (req: SupplierRequest, res) => {
    try {
      const user = await db
        .select()
        .from(parkingSuppliers)
        .where(eq(parkingSuppliers.id, req.supplier!.supplierId))
        .limit(1);

      res.json({
        user: req.supplier,
        supplier: user[0]
      });
    } catch (error) {
      console.error('Error fetching supplier profile:', error);
      res.status(500).json({ message: 'Failed to fetch profile' });
    }
  });

  // Parking Lot Management Routes
  app.get('/api/supplier/parking-lots', isSupplierAuthenticated, async (req: SupplierRequest, res) => {
    try {
      const lots = await storage.getSupplierParkingLots(req.supplier!.supplierId);
      res.json(lots);
    } catch (error) {
      console.error('Error fetching parking lots:', error);
      res.status(500).json({ message: 'Failed to fetch parking lots' });
    }
  });

  app.post('/api/supplier/parking-lots', isSupplierAuthenticated, async (req: SupplierRequest, res) => {
    try {
      const data = parkingLotSchema.parse(req.body);
      const lot = await storage.createSupplierParkingLot({
        ...data,
        supplierId: req.supplier!.supplierId,
      });

      res.status(201).json(lot);
    } catch (error) {
      console.error('Error creating parking lot:', error);
      res.status(400).json({ message: 'Failed to create parking lot' });
    }
  });

  app.get('/api/supplier/parking-lots/:id', isSupplierAuthenticated, async (req: SupplierRequest, res) => {
    try {
      const { id } = req.params;
      const lot = await storage.getSupplierParkingLot(id);

      if (!lot || lot.supplierId !== req.supplier!.supplierId) {
        return res.status(404).json({ message: 'Parking lot not found' });
      }

      res.json(lot);
    } catch (error) {
      console.error('Error fetching parking lot:', error);
      res.status(500).json({ message: 'Failed to fetch parking lot' });
    }
  });

  app.put('/api/supplier/parking-lots/:id', isSupplierAuthenticated, async (req: SupplierRequest, res) => {
    try {
      const { id } = req.params;
      const data = parkingLotSchema.parse(req.body);

      const [lot] = await db
        .update(parkingLots)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(parkingLots.id, id),
            eq(parkingLots.supplierId, req.supplier!.supplierId)
          )
        )
        .returning();

      if (!lot) {
        return res.status(404).json({ message: 'Parking lot not found' });
      }

      res.json(lot);
    } catch (error) {
      console.error('Error updating parking lot:', error);
      res.status(400).json({ message: 'Failed to update parking lot' });
    }
  });

  // Pricing Management Routes
  app.get('/api/supplier/parking-lots/:lotId/pricing', isSupplierAuthenticated, async (req: SupplierRequest, res) => {
    try {
      const { lotId } = req.params;
      
      // Verify ownership
      const [lot] = await db
        .select()
        .from(parkingLots)
        .where(
          and(
            eq(parkingLots.id, lotId),
            eq(parkingLots.supplierId, req.supplier!.supplierId)
          )
        );

      if (!lot) {
        return res.status(404).json({ message: 'Parking lot not found' });
      }

      const pricing = await db
        .select()
        .from(parkingPricing)
        .where(eq(parkingPricing.lotId, lotId))
        .orderBy(desc(parkingPricing.createdAt));

      res.json(pricing);
    } catch (error) {
      console.error('Error fetching pricing:', error);
      res.status(500).json({ message: 'Failed to fetch pricing' });
    }
  });

  app.post('/api/supplier/parking-lots/:lotId/pricing', isSupplierAuthenticated, async (req: SupplierRequest, res) => {
    try {
      const { lotId } = req.params;
      const data = pricingSchema.parse(req.body);

      // Verify ownership
      const [lot] = await db
        .select()
        .from(parkingLots)
        .where(
          and(
            eq(parkingLots.id, lotId),
            eq(parkingLots.supplierId, req.supplier!.supplierId)
          )
        );

      if (!lot) {
        return res.status(404).json({ message: 'Parking lot not found' });
      }

      const [pricing] = await db
        .insert(parkingPricing)
        .values({
          ...data,
          lotId,
        })
        .returning();

      res.status(201).json(pricing);
    } catch (error) {
      console.error('Error creating pricing:', error);
      res.status(400).json({ message: 'Failed to create pricing' });
    }
  });

  // Pricing Rules Routes
  app.get('/api/supplier/parking-lots/:lotId/pricing-rules', isSupplierAuthenticated, async (req: SupplierRequest, res) => {
    try {
      const { lotId } = req.params;
      
      // Verify ownership
      const [lot] = await db
        .select()
        .from(parkingLots)
        .where(
          and(
            eq(parkingLots.id, lotId),
            eq(parkingLots.supplierId, req.supplier!.supplierId)
          )
        );

      if (!lot) {
        return res.status(404).json({ message: 'Parking lot not found' });
      }

      const rules = await db
        .select()
        .from(pricingRules)
        .where(eq(pricingRules.lotId, lotId))
        .orderBy(asc(pricingRules.priority), desc(pricingRules.createdAt));

      res.json(rules);
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
      res.status(500).json({ message: 'Failed to fetch pricing rules' });
    }
  });

  app.post('/api/supplier/parking-lots/:lotId/pricing-rules', isSupplierAuthenticated, async (req: SupplierRequest, res) => {
    try {
      const { lotId } = req.params;
      const data = pricingRuleSchema.parse(req.body);

      // Verify ownership
      const [lot] = await db
        .select()
        .from(parkingLots)
        .where(
          and(
            eq(parkingLots.id, lotId),
            eq(parkingLots.supplierId, req.supplier!.supplierId)
          )
        );

      if (!lot) {
        return res.status(404).json({ message: 'Parking lot not found' });
      }

      const [rule] = await db
        .insert(pricingRules)
        .values({
          ...data,
          lotId,
        })
        .returning();

      res.status(201).json(rule);
    } catch (error) {
      console.error('Error creating pricing rule:', error);
      res.status(400).json({ message: 'Failed to create pricing rule' });
    }
  });

  // Booking Management Routes
  app.get('/api/supplier/bookings', isSupplierAuthenticated, async (req: SupplierRequest, res) => {
    try {
      const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let whereConditions = [
        sql`${bookings.id} IN (
          SELECT b.id FROM ${bookings} b
          INNER JOIN ${parkingLots} pl ON b.lot_id = pl.id
          WHERE pl.supplier_id = ${req.supplier!.supplierId}
        )`
      ];

      if (status) {
        whereConditions.push(eq(bookings.status, status as string));
      }

      if (startDate) {
        whereConditions.push(gte(bookings.startDate, new Date(startDate as string)));
      }

      if (endDate) {
        whereConditions.push(lte(bookings.endDate, new Date(endDate as string)));
      }

      const bookingsData = await db
        .select({
          booking: bookings,
          lot: parkingLots,
          user: sql`json_build_object('id', u.id, 'firstName', u.first_name, 'lastName', u.last_name, 'email', u.email)`.as('user')
        })
        .from(bookings)
        .innerJoin(parkingLots, eq(bookings.lotId, parkingLots.id))
        .innerJoin(sql`users u`, eq(bookings.userId, sql`u.id`))
        .where(and(...whereConditions))
        .orderBy(desc(bookings.createdAt))
        .limit(Number(limit))
        .offset(offset);

      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(bookings)
        .innerJoin(parkingLots, eq(bookings.lotId, parkingLots.id))
        .where(and(...whereConditions))
        .then(result => result[0]?.count || 0);

      res.json({
        bookings: bookingsData,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ message: 'Failed to fetch bookings' });
    }
  });

  // Analytics Routes
  app.get('/api/supplier/analytics', isSupplierAuthenticated, async (req: SupplierRequest, res) => {
    try {
      const { startDate, endDate, metric } = req.query;
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      let whereConditions = [
        eq(supplierAnalytics.supplierId, req.supplier!.supplierId),
        gte(supplierAnalytics.date, start),
        lte(supplierAnalytics.date, end)
      ];

      if (metric) {
        whereConditions.push(eq(supplierAnalytics.metric, metric as string));
      }

      const analytics = await db
        .select()
        .from(supplierAnalytics)
        .where(and(...whereConditions))
        .orderBy(asc(supplierAnalytics.date));

      // Group by date and metric
      const groupedData = analytics.reduce((acc, item) => {
        const date = item.date.toISOString().split('T')[0];
        if (!acc[date]) acc[date] = {};
        acc[date][item.metric] = parseFloat(item.value.toString());
        return acc;
      }, {} as Record<string, Record<string, number>>);

      res.json({
        analytics: groupedData,
        summary: {
          totalBookings: analytics.filter(a => a.metric === 'bookings').reduce((sum, a) => sum + parseFloat(a.value.toString()), 0),
          totalRevenue: analytics.filter(a => a.metric === 'revenue').reduce((sum, a) => sum + parseFloat(a.value.toString()), 0),
          averageRating: analytics.filter(a => a.metric === 'rating').reduce((sum, a) => sum + parseFloat(a.value.toString()), 0) / analytics.filter(a => a.metric === 'rating').length || 0,
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  // Notifications Routes
  app.get('/api/supplier/notifications', isSupplierAuthenticated, async (req: SupplierRequest, res) => {
    try {
      const { unreadOnly = false } = req.query;
      
      let whereConditions = [eq(supplierNotifications.supplierId, req.supplier!.supplierId)];
      
      if (unreadOnly === 'true') {
        whereConditions.push(eq(supplierNotifications.isRead, false));
      }

      const notifications = await db
        .select()
        .from(supplierNotifications)
        .where(and(...whereConditions))
        .orderBy(desc(supplierNotifications.createdAt))
        .limit(50);

      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  });

  app.patch('/api/supplier/notifications/:id/read', isSupplierAuthenticated, async (req: SupplierRequest, res) => {
    try {
      const { id } = req.params;
      
      const [notification] = await db
        .update(supplierNotifications)
        .set({ isRead: true })
        .where(
          and(
            eq(supplierNotifications.id, id),
            eq(supplierNotifications.supplierId, req.supplier!.supplierId)
          )
        )
        .returning();

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      res.json(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Failed to update notification' });
    }
  });

  // Documents Routes
  app.get('/api/supplier/documents', isSupplierAuthenticated, async (req: SupplierRequest, res) => {
    try {
      const documents = await db
        .select()
        .from(supplierDocuments)
        .where(eq(supplierDocuments.supplierId, req.supplier!.supplierId))
        .orderBy(desc(supplierDocuments.createdAt));

      res.json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ message: 'Failed to fetch documents' });
    }
  });

  app.post('/api/supplier/documents', isSupplierAuthenticated, async (req, res) => {
    try {
      const { documentType, fileName, fileUrl, fileSize, mimeType, expiresAt } = req.body;
      
      const [document] = await db
        .insert(supplierDocuments)
        .values({
          supplierId: (req as SupplierRequest).supplier!.supplierId,
          documentType,
          fileName,
          fileUrl,
          fileSize,
          mimeType,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        })
        .returning();

      res.status(201).json(document);
    } catch (error) {
      console.error('Error creating document:', error);
      res.status(400).json({ message: 'Failed to create document' });
    }
  });

  // Payments Routes
  app.get('/api/supplier/payments', isSupplierAuthenticated, async (req: SupplierRequest, res) => {
    try {
      const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let whereConditions = [eq(supplierPayments.supplierId, req.supplier!.supplierId)];

      if (status) {
        whereConditions.push(eq(supplierPayments.status, status as string));
      }

      if (startDate) {
        whereConditions.push(gte(supplierPayments.createdAt, new Date(startDate as string)));
      }

      if (endDate) {
        whereConditions.push(lte(supplierPayments.createdAt, new Date(endDate as string)));
      }

      const payments = await db
        .select({
          payment: supplierPayments,
          booking: bookings,
        })
        .from(supplierPayments)
        .innerJoin(bookings, eq(supplierPayments.bookingId, bookings.id))
        .where(and(...whereConditions))
        .orderBy(desc(supplierPayments.createdAt))
        .limit(Number(limit))
        .offset(offset);

      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(supplierPayments)
        .where(and(...whereConditions))
        .then(result => result[0]?.count || 0);

      res.json({
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ message: 'Failed to fetch payments' });
    }
  });

  // Airports Routes (for dropdowns)
  app.get('/api/supplier/airports', isSupplierAuthenticated, async (req, res) => {
    try {
      const airportsData = await storage.getAirports();
      res.json(airportsData);
    } catch (error) {
      console.error('Error fetching airports:', error);
      res.status(500).json({ message: 'Failed to fetch airports' });
    }
  });
} 