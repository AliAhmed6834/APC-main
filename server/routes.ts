import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from 'cookie-parser';
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { geoDetectionMiddleware, localeOverrideMiddleware } from "./middleware/geoDetection";
import { CurrencyService } from "./services/currencyService";
import { 
  searchSchema, 
  insertBookingSchema, 
  insertReviewSchema,
  supplierLoginSchema,
  supplierSlotManagementSchema,
  bulkCreateSlotsSchema,
  insertSupplierUserSchema,
  insertParkingSlotSchema,
  insertSupplierBookingSchema,
  insertParkingLotSchema,
  insertParkingPricingSchema
} from "@shared/schema";
import { zfd } from "zod-form-data";
import { 
  isSupplierAuthenticated, 
  requireSupplierRole, 
  generateSupplierToken, 
  hashPassword, 
  verifyPassword,
  type SupplierAuthRequest 
} from "./middleware/supplierAuth";

// Helper function to check if a date is a holiday (basic implementation)
function isHoliday(date: Date): boolean {
  const month = date.getMonth();
  const day = date.getDate();
  
  // Basic holiday check (US holidays)
  const holidays = [
    { month: 0, day: 1 },   // New Year's Day
    { month: 6, day: 4 },   // Independence Day
    { month: 11, day: 25 }, // Christmas
  ];
  
  return holidays.some(holiday => holiday.month === month && holiday.day === day);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Basic middleware
  app.use(cookieParser());
  
  // Locale override middleware (must come before geo-detection)
  app.use(localeOverrideMiddleware);
  
  // Geo-detection and locale middleware
  app.use(geoDetectionMiddleware);
  
  // Auth middleware
  await setupAuth(app);
  
  // Initialize currency exchange rates
  await CurrencyService.initializeRates();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Customer Registration Route
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, firstName, lastName } = req.body;
      
      // Validate required fields
      if (!email || !firstName || !lastName) {
        return res.status(400).json({ 
          message: "Email, first name, and last name are required" 
        });
      }

      // Check if user already exists by email
      const existingUsers = await storage.getUsers();
      const existingUser = existingUsers.find(user => user.email === email);
      if (existingUser) {
        return res.status(409).json({ 
          message: "User with this email already exists" 
        });
      }

      // Create new customer user
      const newUser = await storage.upsertUser({
        email,
        firstName,
        lastName,
        preferredLocale: 'en-US',
        preferredCurrency: 'USD',
        detectedCountry: 'US'
      });

      res.status(201).json({
        message: "Customer registered successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        }
      });
    } catch (error) {
      console.error("Error registering customer:", error);
      res.status(500).json({ message: "Failed to register customer" });
    }
  });

  // Supplier Registration Route
  app.post('/api/auth/supplier/register', async (req, res) => {
    try {
      const { 
        email, 
        firstName, 
        lastName, 
        companyName, 
        address, 
        city, 
        postcode, 
        country
      } = req.body;
      
      // Validate required fields
      if (!email || !firstName || !lastName || !companyName) {
        return res.status(400).json({ 
          message: "Email, first name, last name, and company name are required" 
        });
      }

      // Check if user already exists by email
      const existingUsers = await storage.getUsers();
      const existingUser = existingUsers.find(user => user.email === email);
      if (existingUser) {
        return res.status(409).json({ 
          message: "User with this email already exists" 
        });
      }

      // Create new supplier user
      const newUser = await storage.upsertUser({
        email,
        firstName,
        lastName,
        preferredLocale: 'en-US',
        preferredCurrency: 'USD',
        detectedCountry: 'US'
      });

      // Create supplier profile
      const supplierProfile = await storage.createParkingSupplier({
        name: companyName,
        description: `Parking supplier: ${companyName}`,
        contactEmail: email,
        isActive: true
      });

      res.status(201).json({
        message: "Supplier registered successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        },
        supplierProfile: {
          id: supplierProfile.id,
          name: supplierProfile.name,
          isActive: supplierProfile.isActive
        }
      });
    } catch (error) {
      console.error("Error registering supplier:", error);
      res.status(500).json({ message: "Failed to register supplier" });
    }
  });

  // Admin Creation Route (protected - only existing admins can create new admin accounts)
  app.post('/api/auth/admin/create', isAuthenticated, async (req: any, res) => {
    try {
      // Check if current user is admin (for now, allow any authenticated user in development)
      // In production, you'd want to check against a proper admin table
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser) {
        return res.status(403).json({ 
          message: "Authentication required" 
        });
      }

      const { email, firstName, lastName } = req.body;
      
      // Validate required fields
      if (!email || !firstName || !lastName) {
        return res.status(400).json({ 
          message: "Email, first name, and last name are required" 
        });
      }

      // Check if user already exists by email
      const existingUsers = await storage.getUsers();
      const existingUser = existingUsers.find(user => user.email === email);
      if (existingUser) {
        return res.status(409).json({ 
          message: "User with this email already exists" 
        });
      }

      // Create new admin user
      const newUser = await storage.upsertUser({
        email,
        firstName,
        lastName,
        preferredLocale: 'en-US',
        preferredCurrency: 'USD',
        detectedCountry: 'US'
      });

      res.status(201).json({
        message: "Admin user created successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        }
      });
    } catch (error) {
      console.error("Error creating admin user:", error);
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });

  // Customer Login Route
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ 
          message: "Email and password are required" 
        });
      }

      // Find user by email
      const allUsers = await storage.getUsers();
      const user = allUsers.find(u => u.email === email.toLowerCase());
      
      if (!user) {
        return res.status(401).json({ 
          message: "Invalid email or password" 
        });
      }

      // For now, we'll accept any password since we don't have password storage implemented
      // In production, you'd want to hash and verify passwords
      
      // Create a simple session token (in production, use JWT)
      const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store session in memory (in production, use Redis or database)
      // For now, we'll just return success
      
      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        token: sessionToken
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Failed to authenticate user" });
    }
  });

  // Customer Bookings Route (Session-based)
  app.get('/api/customer/bookings', async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ 
          message: "User ID is required" 
        });
      }

      // Get user bookings from database using the storage service
      const userBookings = await storage.getUserBookings(userId as string);

      if (userBookings.length > 0) {
        // Return real bookings from database
        res.json(userBookings);
      } else {
        // Return sample mock data for demonstration (only for new users)
        const mockBookings = [
          {
            id: 'mock_booking_1',
            userId: userId,
            lotId: 'lot_1',
            startDate: '2025-08-15T00:00:00.000Z',
            endDate: '2025-08-16T00:00:00.000Z',
            totalDays: 1,
            pricePerDay: '35.00',
            totalAmount: '37.80',
            status: 'confirmed',
            bookingReference: 'BK123456',
            createdAt: '2025-08-10T10:00:00.000Z',
            updatedAt: '2025-08-10T10:00:00.000Z',
            vehicleInfo: {
              make: 'Toyota',
              model: 'Camry',
              color: 'Silver',
              licensePlate: 'ABC123'
            },
            specialRequests: 'Near terminal entrance',
            parkingLotDetails: {
              name: 'LHR Business Parking',
              address: 'Business Car Park, Heathrow Airport, London, UK',
              airportId: 'LHR',
              airportName: 'London Heathrow Airport',
              distanceToTerminal: '0.30 miles',
              description: 'Business-focused parking with premium amenities and fast access',
              rating: '4.7',
              isCovered: true,
              hasEvCharging: true,
              hasSecurityPatrol: true,
              hasCctv: true,
              isShuttleIncluded: true,
              shuttleFrequencyMinutes: 5
            }
          },
          {
            id: 'mock_booking_2',
            userId: userId,
            lotId: 'lot_2',
            startDate: '2025-08-20T00:00:00.000Z',
            endDate: '2025-08-22T00:00:00.000Z',
            totalDays: 2,
            pricePerDay: '28.50',
            totalAmount: '61.70',
            status: 'confirmed',
            bookingReference: 'BK789012',
            createdAt: '2025-08-12T14:30:00.000Z',
            updatedAt: '2025-08-12T14:30:00.000Z',
            vehicleInfo: {
              make: 'Honda',
              model: 'CR-V',
              color: 'Blue',
              licensePlate: 'XYZ789'
            },
            specialRequests: 'Covered parking preferred',
            parkingLotDetails: {
              name: 'JFK Premium Parking',
              address: 'Premium Parking Garage, JFK International Airport, New York, USA',
              airportId: 'JFK',
              airportName: 'John F. Kennedy International Airport',
              distanceToTerminal: '0.15 miles',
              description: 'Premium covered parking with 24/7 security and shuttle service',
              rating: '4.5',
              isCovered: true,
              hasEvCharging: true,
              hasSecurityPatrol: true,
              hasCctv: true,
              isShuttleIncluded: true,
              shuttleFrequencyMinutes: 3
            }
          }
        ];
        
        res.json(mockBookings);
      }
    } catch (error) {
      console.error("Error fetching customer bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Customer Booking Creation Route (Session-based)
  app.post('/api/customer/bookings', async (req, res) => {
    try {
      console.log('🔍 Booking creation request body:', req.body);
      
      const { 
        userId, 
        lotId, 
        startDate, 
        endDate, 
        vehicleInfo, 
        specialRequests, 
        parkingLotDetails,
        pricePerDay,
        totalAmount
      } = req.body;
      
      if (!userId || !lotId || !startDate || !endDate) {
        return res.status(400).json({ 
          message: "User ID, lot ID, start date, and end date are required" 
        });
      }

      // Calculate booking details if not provided
      const start = new Date(startDate);
      const end = new Date(endDate);
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      // Use provided pricing or fallback to default
      const finalPricePerDay = pricePerDay ? parseFloat(pricePerDay) : 18.99;
      const finalTotalAmount = totalAmount ? parseFloat(totalAmount) : (totalDays * finalPricePerDay);

      // Create booking data for database storage
      const bookingReference = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const bookingData = {
        userId: userId,
        lotId: lotId,
        startDate: new Date(startDate), // Convert string to Date object
        endDate: new Date(endDate), // Convert string to Date object
        totalDays: totalDays,
        pricePerDay: finalPricePerDay.toString(),
        totalAmount: finalTotalAmount.toString(),
        vehicleInfo: vehicleInfo || {},
        specialRequests: specialRequests || "",
        status: "confirmed",
        isCancellable: true,
        // Include complete parking lot details for customer dashboard
        parkingLotDetails: parkingLotDetails || {
          name: 'Unknown Lot',
          address: 'Unknown Address',
          airportId: 'Unknown Airport',
          airportName: 'Unknown Airport',
          distanceToTerminal: 'Unknown',
          description: 'No description available',
          rating: '0.0',
          isCovered: false,
          hasEvCharging: false,
          hasSecurityPatrol: false,
          hasCctv: false,
          isShuttleIncluded: false,
          shuttleFrequencyMinutes: 0
        },
        bookingReference // <-- add this field
      };

      console.log('🔍 Booking data to be stored:', bookingData);

      // Store booking in database using the storage service
      const newBooking = await storage.createBooking(bookingData);
      
      console.log('✅ New booking created in database with complete details:', newBooking);
      
      // Create a transaction record for this payment
      const transactionData = {
        bookingId: newBooking.id,
        paymentMethodId: '2c203341-8129-4731-a248-e745656b0d31',
        amount: newBooking.totalAmount,
        currency: 'USD',
        status: 'completed',
        transactionId: `txn_${Date.now()}`,
        gatewayName: 'manual',
        gatewayResponse: null,
        processedAt: new Date(),
      };
      await storage.createTransaction(transactionData);
      console.log('✅ Transaction record created for booking:', newBooking.id);
      
      res.status(201).json(newBooking);
    } catch (error: any) {
      console.error("❌ Error creating customer booking:", error);
      console.error("❌ Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      res.status(500).json({ 
        message: "Failed to create booking",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });

  // Airport routes
  app.get('/api/airports', async (req, res) => {
    try {
      const airports = await storage.getAirports();
      res.json(airports);
    } catch (error) {
      console.error("Error fetching airports:", error);
      res.status(500).json({ message: "Failed to fetch airports" });
    }
  });

  // Airport search/autocomplete route (must come before /:code route)
  app.get('/api/airports/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.json([]);
      }
      
      const airports = await storage.getAirports();
      const searchTerm = q.toLowerCase();
      
      const filteredAirports = airports.filter(airport => 
        airport.code.toLowerCase().includes(searchTerm) ||
        airport.name.toLowerCase().includes(searchTerm) ||
        airport.city.toLowerCase().includes(searchTerm)
      ).slice(0, 10); // Limit to 10 results
      
      res.json(filteredAirports);
    } catch (error) {
      console.error("Error searching airports:", error);
      res.status(500).json({ message: "Failed to search airports" });
    }
  });

  app.get('/api/airports/:code', async (req, res) => {
    try {
      const { code } = req.params;
      const airport = await storage.getAirportByCode(code);
      if (!airport) {
        return res.status(404).json({ message: "Airport not found" });
      }
      res.json(airport);
    } catch (error) {
      console.error("Error fetching airport:", error);
      res.status(500).json({ message: "Failed to fetch airport" });
    }
  });

  // Parking search route with geo-awareness
  app.get('/api/parking/search', async (req: any, res) => {
    try {
      console.log('🔍 Parking Search - Query params:', req.query);
      
      // Validate required parameters manually
      const { airportCode, startDate, endDate } = req.query;
      
      if (!airportCode || typeof airportCode !== 'string' || airportCode.length < 3) {
        return res.status(400).json({ 
          message: "Airport code is required and must be at least 3 characters",
          received: { airportCode, startDate, endDate }
        });
      }
      
      if (!startDate || typeof startDate !== 'string' || startDate.length < 1) {
        return res.status(400).json({ 
          message: "Start date is required",
          received: { airportCode, startDate, endDate }
        });
      }
      
      if (!endDate || typeof endDate !== 'string' || endDate.length < 1) {
        return res.status(400).json({ 
          message: "End date is required",
          received: { airportCode, startDate, endDate }
        });
      }

      // Create search params object
      const searchParams = {
        airportCode: airportCode.toUpperCase(),
        startDate: startDate,
        endDate: endDate,
        maxDistance: undefined,
        sortBy: 'distance' as const
      };

      console.log('🔍 Parking Search - Validated params:', searchParams);
      
      const parkingLots = await storage.searchParkingLots(searchParams);
      
      // Apply locale-specific transformations
      const localizedLots = await Promise.all(
        parkingLots.map(async (lot) => {
          // Convert distance units based on region
          const distanceInMiles = parseFloat(lot.distanceToTerminal || '0');
          const distance = req.region === 'GB' 
            ? (distanceInMiles * 1.60934).toFixed(1) // Convert to km
            : distanceInMiles.toFixed(1);
          const distanceUnit = req.region === 'GB' ? 'km' : 'miles';
          
          // Get localized pricing if available
          const pricing = await storage.getParkingPricing(lot.id, req.currency, req.region);
          
          return {
            ...lot,
            distanceFormatted: `${distance} ${distanceUnit}`,
            currency: req.currency,
            region: req.region,
            locale: req.locale,
            pricing: pricing || null
          };
        })
      );
      
      console.log('🔍 Parking Search - Found lots:', localizedLots.length);
      res.json(localizedLots);
    } catch (error) {
      console.error("Error searching parking:", error);
      res.status(400).json({ 
        message: "Invalid search parameters",
        error: error instanceof Error ? error.message : 'Unknown error',
        received: req.query
      });
    }
  });

  // Geo-detection endpoint
  app.get('/api/geo/detect', async (req: any, res) => {
    res.json({
      country: req.detectedCountry || 'US',
      region: req.region,
      timezone: req.timezone || 'America/New_York',
      currency: req.currency,
      detectedLocale: req.locale,
      clientIP: req.clientIP
    });
  });

  // Currency conversion endpoint
  app.get('/api/currency/convert', async (req, res) => {
    try {
      const { from, to, amount } = req.query;
      const convertedAmount = await CurrencyService.convertCurrency(
        parseFloat(amount as string),
        from as string,
        to as string
      );
      res.json({ convertedAmount, from, to, originalAmount: amount });
    } catch (error) {
      console.error("Error converting currency:", error);
      res.status(400).json({ message: "Currency conversion failed" });
    }
  });

  // Parking lot details
  app.get('/api/parking/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const lot = await storage.getParkingLot(id);
      if (!lot) {
        return res.status(404).json({ message: "Parking lot not found" });
      }
      res.json(lot);
    } catch (error) {
      console.error("Error fetching parking lot:", error);
      res.status(500).json({ message: "Failed to fetch parking lot" });
    }
  });

  // Booking routes
  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId,
      });
      
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(400).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if user owns this booking
      const userId = req.user.claims.sub;
      if (booking.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.patch('/api/bookings/:id/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if user owns this booking
      const userId = req.user.claims.sub;
      if (booking.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (!booking.isCancellable) {
        return res.status(400).json({ message: "Booking cannot be cancelled" });
      }
      
      const updatedBooking = await storage.updateBookingStatus(id, 'cancelled');
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  // Review routes
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId,
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/reviews/lot/:lotId', async (req, res) => {
    try {
      const { lotId } = req.params;
      const reviews = await storage.getLotReviews(lotId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // ===== SUPPLIER ROUTES =====

  // Supplier authentication
  app.post('/api/supplier/login', async (req, res) => {
    try {
      const { email, password } = supplierLoginSchema.parse(req.body);
      
      // For demo purposes, we'll use a simple password check
      // In production, you'd want to hash passwords and store them securely
      const supplierUser = await storage.getSupplierUserByEmail(email);
      
      if (!supplierUser) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // For demo, accept any password. In production, verify against hashed password
      const isValidPassword = true; // await verifyPassword(password, supplierUser.passwordHash);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate session token
      const token = generateSupplierToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await storage.createSupplierSession({
        supplierUserId: supplierUser.id,
        token,
        expiresAt,
      });

      // Update last login
      await storage.updateSupplierUser(supplierUser.id, { lastLoginAt: new Date() });

      res.cookie('supplierToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.json({
        user: {
          id: supplierUser.id,
          email: supplierUser.email,
          firstName: supplierUser.firstName,
          lastName: supplierUser.lastName,
          role: supplierUser.role,
          supplierId: supplierUser.supplierId,
        },
        token,
      });
    } catch (error) {
      console.error("Supplier login error:", error);
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.post('/api/supplier/logout', isSupplierAuthenticated, async (req: SupplierAuthRequest, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.supplierToken;
      if (token) {
        await storage.deleteSupplierSession(token);
      }
      
      res.clearCookie('supplierToken');
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Supplier logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  app.get('/api/supplier/profile', isSupplierAuthenticated, async (req: SupplierAuthRequest, res) => {
    try {
      const supplierUser = req.supplierUser;
      res.json({
        id: supplierUser.id,
        email: supplierUser.email,
        firstName: supplierUser.firstName,
        lastName: supplierUser.lastName,
        role: supplierUser.role,
        supplierId: supplierUser.supplierId,
      });
    } catch (error) {
      console.error("Error fetching supplier profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });



  // Supplier parking lot management
  app.get('/api/supplier/parking-lots', isSupplierAuthenticated, async (req: SupplierAuthRequest, res) => {
    try {
      const supplierUser = req.supplierUser;
      const lots = await storage.getSupplierParkingLots(supplierUser.supplierId!);
      res.json(lots);
    } catch (error) {
      console.error("Error fetching supplier parking lots:", error);
      res.status(500).json({ message: "Failed to fetch parking lots" });
    }
  });

  app.post('/api/supplier/parking-lots', isSupplierAuthenticated, async (req: SupplierAuthRequest, res) => {
    try {
      const supplierUser = req.supplierUser;
      
      // Extract pricing data before processing parking lot data
      const { pricePerDay, currency, ...parkingLotData } = req.body;
      
      // Convert decimal fields to strings for Drizzle schema validation
      const processedBody = {
        ...parkingLotData,
        // Convert decimal fields to strings
        latitude: parkingLotData.latitude ? parkingLotData.latitude.toString() : null,
        longitude: parkingLotData.longitude ? parkingLotData.longitude.toString() : null,
        distanceToTerminal: parkingLotData.distanceToTerminal ? parkingLotData.distanceToTerminal.toString() : null,
        rating: parkingLotData.rating ? parkingLotData.rating.toString() : null,
        reviewCount: parkingLotData.reviewCount || null,
      };

      // Validate the input data
      const validatedData = insertParkingLotSchema.parse({
        ...processedBody,
        supplierId: supplierUser.supplierId,
        isActive: true,
      });
      
      const lot = await storage.createParkingLot(validatedData);
      
      // If pricing data is provided, create pricing records
      if (pricePerDay && currency) {
        try {
          // Create pricing data with explicit string conversion
          const pricingData = {
            lotId: lot.id,
            priceType: 'daily',
            basePrice: pricePerDay.toString(),
            currency: currency,
            localizedPrice: pricePerDay.toString(),
            taxRate: '0.00',
            region: currency === 'GBP' ? 'GB' : 'US',
            discountedPrice: null,
            isActive: true,
          };
          
          console.log('🔍 Pricing data being sent:', pricingData);
          console.log('🔍 basePrice type:', typeof pricingData.basePrice);
          console.log('🔍 localizedPrice type:', typeof pricingData.localizedPrice);
          
          await storage.createParkingPricing(pricingData);
        } catch (pricingError: any) {
          console.error("Error creating pricing record:", pricingError);
          // Return success for parking lot creation but include pricing error info
          return res.status(201).json({
            ...lot,
            warning: "Parking lot created successfully but pricing could not be added",
            pricingError: pricingError.message
          });
        }
      }
      
      res.status(201).json(lot);
    } catch (error: any) {
      console.error("Error creating parking lot:", error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({ message: "Invalid data" });
      } else {
        res.status(400).json({ message: "Failed to create parking lot" });
      }
    }
  });

  // Update parking lot
  app.put('/api/supplier/parking-lots/:id', isSupplierAuthenticated, async (req: SupplierAuthRequest, res) => {
    try {
      const { id } = req.params;
      const supplierUser = req.supplierUser;
      
      // First check if the parking lot belongs to this supplier
      const existingLot = await storage.getParkingLot(id);
      if (!existingLot || existingLot.supplierId !== supplierUser.supplierId) {
        return res.status(404).json({ message: "Parking lot not found" });
      }

      // Extract and validate the update data - now handling all comprehensive fields
      const { 
        name, 
        address, 
        totalSpaces, 
        isActive, 
        description,
        distanceToTerminal, 
        shuttleFrequencyMinutes,
        isShuttleIncluded,
        isCovered,
        hasEvCharging,
        hasCarWash,
        hasSecurityPatrol,
        hasCctv,
        rating, 
        reviewCount 
      } = req.body;
      
      const updateData = {
        name: name || existingLot.name,
        address: address || existingLot.address,
        totalSpaces: totalSpaces || existingLot.totalSpaces,
        isActive: isActive !== undefined ? isActive : existingLot.isActive,
        description: description !== undefined ? description : existingLot.description,
        distanceToTerminal: distanceToTerminal ? distanceToTerminal.toString() : existingLot.distanceToTerminal,
        shuttleFrequencyMinutes: shuttleFrequencyMinutes || existingLot.shuttleFrequencyMinutes,
        isShuttleIncluded: isShuttleIncluded !== undefined ? isShuttleIncluded : existingLot.isShuttleIncluded,
        isCovered: isCovered !== undefined ? isCovered : existingLot.isCovered,
        hasEvCharging: hasEvCharging !== undefined ? hasEvCharging : existingLot.hasEvCharging,
        hasCarWash: hasCarWash !== undefined ? hasCarWash : existingLot.hasCarWash,
        hasSecurityPatrol: hasSecurityPatrol !== undefined ? hasSecurityPatrol : existingLot.hasSecurityPatrol,
        hasCctv: hasCctv !== undefined ? hasCctv : existingLot.hasCctv,
        rating: rating ? rating.toString() : existingLot.rating,
        reviewCount: reviewCount || existingLot.reviewCount,
      };

      const updatedLot = await storage.updateParkingLot(id, updateData);
      res.json(updatedLot);
    } catch (error: any) {
      console.error("Error updating parking lot:", error);
      res.status(400).json({ message: "Failed to update parking lot" });
    }
  });

  // Supplier slot management
  app.post('/api/supplier/slots', isSupplierAuthenticated, async (req: SupplierAuthRequest, res) => {
    try {
      const slotData = insertParkingSlotSchema.parse(req.body);
      const slot = await storage.createParkingSlot(slotData);
      res.status(201).json(slot);
    } catch (error) {
      console.error("Error creating parking slot:", error);
      res.status(400).json({ message: "Failed to create parking slot" });
    }
  });

  // Bulk create parking slots
  app.post('/api/supplier/slots/bulk', isSupplierAuthenticated, async (req: SupplierAuthRequest, res) => {
    try {
      const bulkData = bulkCreateSlotsSchema.parse(req.body);
      
      // Generate dates between start and end date
      const startDate = new Date(bulkData.startDate);
      const endDate = new Date(bulkData.endDate);
      const dates: Date[] = [];
      
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const currentDate = new Date(date);
        
        // Skip weekends if requested
        if (bulkData.skipWeekends && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
          continue;
        }
        
        // Skip holidays if requested (basic implementation)
        if (bulkData.skipHolidays && isHoliday(currentDate)) {
          continue;
        }
        
        // Check custom dates if provided
        if (bulkData.customDates && bulkData.customDates.length > 0) {
          const dateString = currentDate.toISOString().split('T')[0];
          if (!bulkData.customDates.includes(dateString)) {
            continue;
          }
        }
        
        dates.push(new Date(currentDate));
      }
      
      // Create slots for each date
      const createdSlots = [];
      for (const date of dates) {
        const slotData = {
          lotId: bulkData.lotId,
          date: date,
          totalSpaces: bulkData.totalSpaces,
          availableSpaces: bulkData.totalSpaces,
          reservedSpaces: 0,
          pricePerDay: bulkData.pricePerDay.toString(),
          currency: bulkData.currency,
          isActive: true,
        };
        
        const slot = await storage.createParkingSlot(slotData);
        createdSlots.push(slot);
      }
      
      res.status(201).json({
        message: `Successfully created ${createdSlots.length} parking slots`,
        slots: createdSlots,
        totalCreated: createdSlots.length,
        dateRange: {
          startDate: bulkData.startDate,
          endDate: bulkData.endDate,
        }
      });
    } catch (error: any) {
      console.error("Error creating bulk parking slots:", error);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(400).json({ message: "Failed to create bulk parking slots" });
      }
    }
  });

  app.get('/api/supplier/slots/:lotId', isSupplierAuthenticated, async (req: SupplierAuthRequest, res) => {
    try {
      const { lotId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const slots = await storage.getParkingSlots(
        lotId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(slots);
    } catch (error) {
      console.error("Error fetching parking slots:", error);
      res.status(500).json({ message: "Failed to fetch parking slots" });
    }
  });

  app.put('/api/supplier/slots/:id', isSupplierAuthenticated, async (req: SupplierAuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const slot = await storage.updateParkingSlot(id, updates);
      if (!slot) {
        return res.status(404).json({ message: "Parking slot not found" });
      }
      
      res.json(slot);
    } catch (error) {
      console.error("Error updating parking slot:", error);
      res.status(500).json({ message: "Failed to update parking slot" });
    }
  });

  app.delete('/api/supplier/slots/:id', isSupplierAuthenticated, async (req: SupplierAuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteParkingSlot(id);
      res.json({ message: "Parking slot deleted successfully" });
    } catch (error) {
      console.error("Error deleting parking slot:", error);
      res.status(500).json({ message: "Failed to delete parking slot" });
    }
  });

  // Supplier booking management
  app.get('/api/supplier/bookings', isSupplierAuthenticated, async (req: SupplierAuthRequest, res) => {
    try {
      const supplierUser = req.supplierUser;
      const bookings = await storage.getSupplierBookings(supplierUser.supplierId!);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching supplier bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Supplier analytics endpoint
  app.get('/api/supplier/analytics', isSupplierAuthenticated, async (req: SupplierAuthRequest, res) => {
    try {
      const supplierUser = req.supplierUser;
      const { timeRange = '30d' } = req.query;
      
      // Get supplier's parking lots
      const parkingLots = await storage.getSupplierParkingLots(supplierUser.supplierId!);
      
      // Get supplier's bookings
      const supplierBookings = await storage.getSupplierBookings(supplierUser.supplierId!);
      
      // Get actual booking data for each supplier booking
      const bookings = await Promise.all(
        supplierBookings.map(async (supplierBooking) => {
          if (supplierBooking.bookingId) {
            const booking = await storage.getBooking(supplierBooking.bookingId);
            return {
              ...supplierBooking,
              booking
            };
          }
          return supplierBooking;
        })
      );
      
      // Calculate analytics data
      const analytics = {
        overview: {
          totalParkingLots: parkingLots.length,
          totalSpaces: parkingLots.reduce((sum, lot) => sum + (lot.totalSpaces || 0), 0),
          totalBookings: bookings.length,
          totalRevenue: bookings.reduce((sum, booking: any) => {
            const amount = parseFloat(booking.booking?.totalAmount || '0');
            return sum + amount;
          }, 0),
          averageRating: parkingLots.length > 0 ? 
            parkingLots.reduce((sum, lot) => sum + parseFloat(lot.rating || '0'), 0) / parkingLots.length : 0
        },
        performance: parkingLots.map(lot => {
          const lotBookings = bookings.filter((booking: any) => 
            booking.booking?.lotId === lot.id
          );
          
          const lotRevenue = lotBookings.reduce((sum, booking: any) => {
            const amount = parseFloat(booking.booking?.totalAmount || '0');
            return sum + amount;
          }, 0);

          const rating = parseFloat(lot.rating || '0');
          const status = rating >= 4.5 ? 'excellent' : 
                        rating >= 4.0 ? 'good' : 
                        rating >= 3.5 ? 'average' : 
                        rating >= 3.0 ? 'poor' : 'critical';

          return {
            lotId: lot.id,
            lotName: lot.name,
            location: lot.address,
            totalBookings: lotBookings.length,
            revenue: lotRevenue,
            rating,
            occupancyRate: 0.8, // Placeholder - would calculate from actual slot data
            customerSatisfaction: rating * 2,
            onTimePerformance: 0.95, // Placeholder
            qualityScore: rating * 2,
            growthRate: 12.5, // Placeholder
            status
          };
        }),
        trends: generateTrendData(bookings, timeRange as string),
        geography: generateGeographyData(parkingLots, bookings),
        operations: generateOperationsData(parkingLots, bookings)
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching supplier analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Supplier booking update endpoint
  app.put('/api/supplier/bookings/:id', isSupplierAuthenticated, async (req: SupplierAuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const booking = await storage.updateSupplierBooking(id, updates);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error updating supplier booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // Helper function to generate trend data
  function generateTrendData(bookings: any[], timeRange: string) {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      
      const dayBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate.toDateString() === date.toDateString();
      });

      const dayRevenue = dayBookings.reduce((sum, booking) => {
        const amount = parseFloat(booking.booking?.totalAmount || '0');
        return sum + amount;
      }, 0);

      const averagePrice = dayBookings.length > 0 ? 
        dayBookings.reduce((sum, booking) => {
          const amount = parseFloat(booking.booking?.totalAmount || '0');
          return sum + amount;
        }, 0) / dayBookings.length : 0;

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
        bookings: dayBookings.length,
        averagePrice,
        lotCount: 1
      };
    });
  }

  // Helper function to generate geography data
  function generateGeographyData(parkingLots: any[], bookings: any[]) {
    const regions = new Map<string, any>();
    
    parkingLots.forEach(lot => {
      const region = lot.airportId || 'Unknown';
      if (!regions.has(region)) {
        regions.set(region, {
          region,
          lots: 0,
          revenue: 0,
          bookings: 0,
          totalRating: 0,
          count: 0
        });
      }
      
      const regionData = regions.get(region);
      regionData.lots++;
      regionData.count++;
      regionData.totalRating += parseFloat(lot.rating || '0');
    });

    bookings.forEach(booking => {
      const lot = parkingLots.find(l => l.id === booking.booking?.lotId);
      if (lot) {
        const region = lot.airportId || 'Unknown';
        if (regions.has(region)) {
          const regionData = regions.get(region);
          regionData.bookings++;
          regionData.revenue += parseFloat(booking.booking?.totalAmount || '0');
        }
      }
    });

    return Array.from(regions.values()).map(region => ({
      region: region.region,
      lots: region.lots,
      revenue: region.revenue,
      bookings: region.bookings,
      averageRating: region.count > 0 ? region.totalRating / region.count : 0,
      growth: 15.0
    }));
  }

  // Helper function to generate operations data
  function generateOperationsData(parkingLots: any[], bookings: any[]) {
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => {
      const amount = parseFloat(booking.booking?.totalAmount || '0');
      return sum + amount;
    }, 0);

    const averageRating = parkingLots.length > 0 ? 
      parkingLots.reduce((sum, lot) => sum + parseFloat(lot.rating || '0'), 0) / parkingLots.length : 0;

    return [
      {
        category: 'Performance',
        metric: 'On-Time Performance',
        value: 94,
        target: 95,
        status: 94 >= 95 ? 'excellent' : 94 >= 90 ? 'good' : 94 >= 85 ? 'average' : 94 >= 80 ? 'poor' : 'critical',
        trend: 'up'
      },
      {
        category: 'Quality',
        metric: 'Customer Satisfaction',
        value: averageRating * 2,
        target: 9.0,
        status: (averageRating * 2) >= 9.0 ? 'excellent' : 
                (averageRating * 2) >= 8.0 ? 'good' : 
                (averageRating * 2) >= 7.0 ? 'average' : 
                (averageRating * 2) >= 6.0 ? 'poor' : 'critical',
        trend: 'up'
      },
      {
        category: 'Efficiency',
        metric: 'Occupancy Rate',
        value: 75,
        target: 80,
        status: 75 >= 80 ? 'excellent' : 75 >= 70 ? 'good' : 75 >= 60 ? 'average' : 75 >= 50 ? 'poor' : 'critical',
        trend: 'stable'
      },
      {
        category: 'Growth',
        metric: 'Revenue Growth',
        value: 12.5,
        target: 15.0,
        status: 12.5 >= 15.0 ? 'excellent' : 12.5 >= 10.0 ? 'good' : 12.5 >= 5.0 ? 'average' : 12.5 >= 0.0 ? 'poor' : 'critical',
        trend: 'up'
      },
      {
        category: 'Retention',
        metric: 'Customer Retention',
        value: 85,
        target: 90,
        status: 85 >= 90 ? 'excellent' : 85 >= 80 ? 'good' : 85 >= 70 ? 'average' : 85 >= 60 ? 'poor' : 'critical',
        trend: 'stable'
      }
    ];
  }

  // Bulk slot management
  app.post('/api/supplier/slots/bulk', isSupplierAuthenticated, async (req: SupplierAuthRequest, res) => {
    try {
      const { lotId, startDate, endDate, totalSpaces, pricePerDay, currency } = supplierSlotManagementSchema.parse(req.body);
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const slots = [];

      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const slot = await storage.createParkingSlot({
          lotId,
          date: new Date(date),
          totalSpaces,
          availableSpaces: totalSpaces,
          pricePerDay: pricePerDay.toString(),
          currency,
        });
        slots.push(slot);
      }

      res.status(201).json({ message: `${slots.length} slots created successfully`, slots });
    } catch (error) {
      console.error("Error creating bulk parking slots:", error);
      res.status(400).json({ message: "Failed to create parking slots" });
    }
  });

  // ===== NEW API ROUTES FOR STAGE 1.5 =====

  // Payment Methods
  app.post('/api/payment-methods', async (req, res) => {
    try {
      const { userId, paymentType, lastFour, expiryDate, tokenHash, metadata } = req.body;
      
      if (!userId || !paymentType || !tokenHash) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const paymentMethod = await storage.createPaymentMethod({
        userId,
        paymentType,
        lastFour,
        expiryDate,
        tokenHash,
        metadata,
        isDefault: false
      });

      res.json(paymentMethod);
    } catch (error) {
      console.error("Error creating payment method:", error);
      res.status(500).json({ message: "Failed to create payment method" });
    }
  });

  app.get('/api/payment-methods/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const paymentMethods = await storage.getUserPaymentMethods(userId);
      res.json(paymentMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  // Transactions
  app.post('/api/transactions', async (req, res) => {
    try {
      const { bookingId, paymentMethodId, amount, currency, gatewayName, transactionId } = req.body;
      
      if (!bookingId || !amount || !gatewayName) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const transaction = await storage.createTransaction({
        bookingId,
        paymentMethodId,
        amount,
        currency: currency || 'USD',
        status: 'pending',
        gatewayName,
        transactionId
      });

      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.put('/api/transactions/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, gatewayResponse } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const transaction = await storage.updateTransactionStatus(id, status, gatewayResponse);
      
      // Update booking payment status if transaction is completed
      if (status === 'completed' && transaction.bookingId) {
        await storage.updateBookingPaymentStatus(transaction.bookingId, 'completed', transaction.id);
      }

      res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction status:", error);
      res.status(500).json({ message: "Failed to update transaction status" });
    }
  });

  // Email Templates
  app.get('/api/email-templates/:templateKey', async (req, res) => {
    try {
      const { templateKey } = req.params;
      const { locale = 'en-US' } = req.query;
      
      const template = await storage.getEmailTemplate(templateKey, locale as string);
      
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }

      res.json(template);
    } catch (error) {
      console.error("Error fetching email template:", error);
      res.status(500).json({ message: "Failed to fetch email template" });
    }
  });

  // Email Logs
  app.post('/api/email-logs', async (req, res) => {
    try {
      const { userId, templateId, recipient, subject, status = 'sent' } = req.body;
      
      if (!recipient || !subject) {
        return res.status(400).json({ message: "Recipient and subject are required" });
      }

      const emailLog = await storage.createEmailLog({
        userId,
        templateId,
        recipient,
        subject,
        status
      });

      res.json(emailLog);
    } catch (error) {
      console.error("Error creating email log:", error);
      res.status(500).json({ message: "Failed to create email log" });
    }
  });

  app.put('/api/email-logs/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, deliveryStatus } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const emailLog = await storage.updateEmailLogStatus(id, status, deliveryStatus);
      res.json(emailLog);
    } catch (error) {
      console.error("Error updating email log status:", error);
      res.status(500).json({ message: "Failed to update email log status" });
    }
  });

  // SMS Logs
  app.post('/api/sms-logs', async (req, res) => {
    try {
      const { userId, phoneNumber, message, status = 'sent' } = req.body;
      
      if (!phoneNumber || !message) {
        return res.status(400).json({ message: "Phone number and message are required" });
      }

      const smsLog = await storage.createSmsLog({
        userId,
        phoneNumber,
        message,
        status
      });

      res.json(smsLog);
    } catch (error) {
      console.error("Error creating SMS log:", error);
      res.status(500).json({ message: "Failed to create SMS log" });
    }
  });

  // User Activity Logs
  app.post('/api/activity-logs', async (req, res) => {
    try {
      const { userId, activityType, pageUrl, sessionId, deviceInfo, ipAddress, userAgent, metadata } = req.body;
      
      if (!userId || !activityType) {
        return res.status(400).json({ message: "User ID and activity type are required" });
      }

      const activityLog = await storage.logUserActivity({
        userId,
        activityType,
        pageUrl,
        sessionId,
        deviceInfo,
        ipAddress,
        userAgent,
        metadata
      });

      res.json(activityLog);
    } catch (error) {
      console.error("Error logging user activity:", error);
      res.status(500).json({ message: "Failed to log user activity" });
    }
  });

  app.get('/api/activity-logs/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;
      
      const activityLogs = await storage.getUserActivityLogs(userId, parseInt(limit as string));
      res.json(activityLogs);
    } catch (error) {
      console.error("Error fetching user activity logs:", error);
      res.status(500).json({ message: "Failed to fetch user activity logs" });
    }
  });

  // Search Analytics
  app.post('/api/search-analytics', async (req, res) => {
    try {
      const { userId, airportCode, searchDate, resultsCount, filtersUsed, sortOrder, conversionToBooking, searchDuration } = req.body;
      
      if (!userId || !searchDate || !resultsCount) {
        return res.status(400).json({ message: "User ID, search date, and results count are required" });
      }

      const searchAnalytic = await storage.logSearchAnalytics({
        userId,
        airportCode,
        searchDate: new Date(searchDate),
        resultsCount,
        filtersUsed,
        sortOrder,
        conversionToBooking: conversionToBooking || false,
        searchDuration
      });

      res.json(searchAnalytic);
    } catch (error) {
      console.error("Error logging search analytics:", error);
      res.status(500).json({ message: "Failed to log search analytics" });
    }
  });

  app.get('/api/search-analytics', async (req, res) => {
    try {
      const { airportCode, startDate, endDate } = req.query;
      
      let start: Date | undefined;
      let end: Date | undefined;
      
      if (startDate && endDate) {
        start = new Date(startDate as string);
        end = new Date(endDate as string);
      }

      const searchAnalytics = await storage.getSearchAnalytics(
        airportCode as string,
        start,
        end
      );

      res.json(searchAnalytics);
    } catch (error) {
      console.error("Error fetching search analytics:", error);
      res.status(500).json({ message: "Failed to fetch search analytics" });
    }
  });

  // Revenue Analytics
  app.post('/api/revenue-analytics', async (req, res) => {
    try {
      const { date, totalBookings, totalRevenue, avgOrderValue, currencyBreakdown, supplierBreakdown, regionBreakdown } = req.body;
      
      if (!date || totalBookings === undefined || totalRevenue === undefined) {
        return res.status(400).json({ message: "Date, total bookings, and total revenue are required" });
      }

      const revenueAnalytic = await storage.logRevenueAnalytics({
        date: new Date(date),
        totalBookings,
        totalRevenue,
        avgOrderValue,
        currencyBreakdown,
        supplierBreakdown,
        regionBreakdown
      });

      res.json(revenueAnalytic);
    } catch (error) {
      console.error("Error logging revenue analytics:", error);
      res.status(500).json({ message: "Failed to log revenue analytics" });
    }
  });

  app.get('/api/revenue-analytics', async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      const revenueAnalytics = await storage.getRevenueAnalytics(start, end);
      res.json(revenueAnalytics);
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });

  // User Preferences
  app.get('/api/user-preferences/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  app.post('/api/user-preferences', async (req, res) => {
    try {
      const { userId, key, value, category } = req.body;
      
      if (!userId || !key || !value || !category) {
        return res.status(400).json({ message: "User ID, key, value, and category are required" });
      }

      const preference = await storage.setUserPreference(userId, key, value, category);
      res.json(preference);
    } catch (error) {
      console.error("Error setting user preference:", error);
      res.status(500).json({ message: "Failed to set user preference" });
    }
  });

  // User Loyalty
  app.get('/api/user-loyalty/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const loyalty = await storage.getUserLoyalty(userId);
      
      if (!loyalty) {
        return res.status(404).json({ message: "Loyalty record not found" });
      }

      res.json(loyalty);
    } catch (error) {
      console.error("Error fetching user loyalty:", error);
      res.status(500).json({ message: "Failed to fetch user loyalty" });
    }
  });

  app.post('/api/user-loyalty/:userId/points', async (req, res) => {
    try {
      const { userId } = req.params;
      const { points } = req.body;
      
      if (!points || points <= 0) {
        return res.status(400).json({ message: "Valid points amount is required" });
      }

      const loyalty = await storage.addLoyaltyPoints(userId, points);
      res.json(loyalty);
    } catch (error) {
      console.error("Error adding loyalty points:", error);
      res.status(500).json({ message: "Failed to add loyalty points" });
    }
  });

  // Saved Searches
  app.post('/api/saved-searches', async (req, res) => {
    try {
      const { userId, searchName, searchCriteria, notificationSettings } = req.body;
      
      if (!userId || !searchName || !searchCriteria) {
        return res.status(400).json({ message: "User ID, search name, and search criteria are required" });
      }

      const savedSearch = await storage.saveSearch({
        userId,
        searchName,
        searchCriteria,
        notificationSettings,
        isActive: true
      });

      res.json(savedSearch);
    } catch (error) {
      console.error("Error saving search:", error);
      res.status(500).json({ message: "Failed to save search" });
    }
  });

  app.get('/api/saved-searches/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const savedSearches = await storage.getUserSavedSearches(userId);
      res.json(savedSearches);
    } catch (error) {
      console.error("Error fetching saved searches:", error);
      res.status(500).json({ message: "Failed to fetch saved searches" });
    }
  });

  // Search Filters
  app.get('/api/search-filters', async (req, res) => {
    try {
      const filters = await storage.getSearchFilters();
      res.json(filters);
    } catch (error) {
      console.error("Error fetching search filters:", error);
      res.status(500).json({ message: "Failed to fetch search filters" });
    }
  });

  // Booking Status History
  app.post('/api/booking-status-history', async (req, res) => {
    try {
      const { bookingId, userId, newStatus, oldStatus, reason } = req.body;
      
      if (!bookingId || !userId || !newStatus) {
        return res.status(400).json({ message: "Booking ID, user ID, and new status are required" });
      }

      const statusHistory = await storage.logBookingStatusChange(bookingId, userId, newStatus, oldStatus, reason);
      res.json(statusHistory);
    } catch (error) {
      console.error("Error logging booking status change:", error);
      res.status(500).json({ message: "Failed to log booking status change" });
    }
  });

  app.get('/api/booking-status-history/:bookingId', async (req, res) => {
    try {
      const { bookingId } = req.params;
      const statusHistory = await storage.getBookingStatusHistory(bookingId);
      res.json(statusHistory);
    } catch (error) {
      console.error("Error fetching booking status history:", error);
      res.status(500).json({ message: "Failed to fetch booking status history" });
    }
  });

  // ===== END NEW API ROUTES FOR STAGE 1.5 =====

  // ===== STAGE 3: COMPREHENSIVE ANALYTICS ROUTES =====
  
  // Customer Analytics
  app.get('/api/analytics/customer/overview/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeRange = '30d' } = req.query;
      const overview = await storage.getCustomerMetrics(userId, timeRange as string);
      res.json(overview);
    } catch (error) {
      console.error("Error fetching customer analytics overview:", error);
      res.status(500).json({ message: "Failed to fetch customer analytics" });
    }
  });

  app.get('/api/analytics/customer/segments/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeRange = '30d', segmentType = 'all' } = req.query;
      const segments = await storage.getCustomerSegments(userId, timeRange as string, segmentType as string);
      res.json(segments);
    } catch (error) {
      console.error("Error fetching customer segments:", error);
      res.status(500).json({ message: "Failed to fetch customer segments" });
    }
  });

  app.get('/api/analytics/customer/trends/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeRange = '30d', metric = 'bookings' } = req.query;
      const trends = await storage.getCustomerTrends(userId, timeRange as string, metric as string);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching customer trends:", error);
      res.status(500).json({ message: "Failed to fetch customer trends" });
    }
  });

  app.get('/api/analytics/customer/geography/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeRange = '30d', region = 'all' } = req.query;
      const geography = await storage.getCustomerGeography(userId, timeRange as string, region as string);
      res.json(geography);
    } catch (error) {
      console.error("Error fetching customer geography:", error);
      res.status(500).json({ message: "Failed to fetch customer geography" });
    }
  });

  // Supplier Analytics
  app.get('/api/analytics/supplier/overview/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeRange = '30d' } = req.query;
      const overview = await storage.getSupplierMetrics(userId, timeRange as string);
      res.json(overview);
    } catch (error) {
      console.error("Error fetching supplier analytics overview:", error);
      res.status(500).json({ message: "Failed to fetch supplier analytics" });
    }
  });

  app.get('/api/analytics/supplier/performance/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeRange = '30d', sortBy = 'revenue', limit = 50 } = req.query;
      const performance = await storage.getSupplierPerformance(userId, timeRange as string, sortBy as string, parseInt(limit as string));
      res.json(performance);
    } catch (error) {
      console.error("Error fetching supplier performance:", error);
      res.status(500).json({ message: "Failed to fetch supplier performance" });
    }
  });

  app.get('/api/analytics/supplier/trends/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeRange = '30d', metric = 'revenue' } = req.query;
      const trends = await storage.getSupplierTrends(userId, timeRange as string, metric as string);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching supplier trends:", error);
      res.status(500).json({ message: "Failed to fetch supplier trends" });
    }
  });

  app.get('/api/analytics/supplier/geography/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeRange = '30d', region = 'all' } = req.query;
      const geography = await storage.getSupplierGeography(userId, timeRange as string, region as string);
      res.json(geography);
    } catch (error) {
      console.error("Error fetching supplier geography:", error);
      res.status(500).json({ message: "Failed to fetch supplier geography" });
    }
  });

  app.get('/api/analytics/supplier/operations/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeRange = '30d', category = 'all' } = req.query;
      const operations = await storage.getSupplierOperations(userId, timeRange as string, category as string);
      res.json(operations);
    } catch (error) {
      console.error("Error fetching supplier operations:", error);
      res.status(500).json({ message: "Failed to fetch supplier operations" });
    }
  });

  // Business Intelligence Analytics
  app.get('/api/analytics/business/overview/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeRange = '30d' } = req.query;
      const overview = await storage.getBusinessOverview(userId, timeRange as string);
      res.json(overview);
    } catch (error) {
      console.error("Error fetching business overview:", error);
      res.status(500).json({ message: "Failed to fetch business overview" });
    }
  });

  app.get('/api/analytics/business/revenue/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeRange = '30d', breakdown = 'daily' } = req.query;
      const revenue = await storage.getBusinessRevenue(userId, timeRange as string, breakdown as string);
      res.json(revenue);
    } catch (error) {
      console.error("Error fetching business revenue:", error);
      res.status(500).json({ message: "Failed to fetch business revenue" });
    }
  });

  app.get('/api/analytics/business/bookings/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeRange = '30d', breakdown = 'daily' } = req.query;
      const bookings = await storage.getBusinessBookings(userId, timeRange as string, breakdown as string);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching business bookings:", error);
      res.status(500).json({ message: "Failed to fetch business bookings" });
    }
  });

  // Search Analytics (using existing methods)
  app.get('/api/analytics/search/overview', async (req, res) => {
    try {
      const { timeRange = '30d' } = req.query;
      const overview = await storage.getSearchAnalytics(undefined, undefined, undefined);
      res.json(overview);
    } catch (error) {
      console.error("Error fetching search analytics overview:", error);
      res.status(500).json({ message: "Failed to fetch search analytics" });
    }
  });

  // ===== END STAGE 3: COMPREHENSIVE ANALYTICS ROUTES =====

  // Admin routes
app.get('/api/admin/customers', async (req, res) => {
  try {
    const customers = await storage.getAllCustomers();
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
});

app.get('/api/admin/suppliers', async (req, res) => {
  try {
    const suppliers = await storage.getAllSuppliers();
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Failed to fetch suppliers' });
  }
});

app.get('/api/admin/airports', async (req, res) => {
  try {
    // Get airports with proper statistics
    const { db } = await import('./db');
    const { airports, parkingLots, bookings } = await import('@shared/schema');
    const { asc, eq } = await import('drizzle-orm');
    
    const airportsData = await db
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
    
    // Calculate statistics for each airport (simplified approach)
    const airportsWithStats = [];
    
    for (const airport of airportsData) {
      try {
        // Get parking lots count for this airport
        const parkingLotsCount = await db
          .select({ count: parkingLots.id })
          .from(parkingLots)
          .where(eq(parkingLots.airportId, airport.id));
        
        // Get bookings count for this airport
        const bookingsCount = await db
          .select({ count: bookings.id })
          .from(bookings)
          .leftJoin(parkingLots, eq(bookings.lotId, parkingLots.id))
          .where(eq(parkingLots.airportId, airport.id));
        
        airportsWithStats.push({
          ...airport,
          isActive: true,
          totalParkingLots: parkingLotsCount.length,
          totalBookings: bookingsCount.length
        });
        
      } catch (error) {
        console.error(`Error calculating stats for airport ${airport.code}:`, error);
        // Add airport with default stats if calculation fails
        airportsWithStats.push({
          ...airport,
          isActive: true,
          totalParkingLots: 0,
          totalBookings: 0
        });
      }
    }
    
    res.json(airportsWithStats);
  } catch (error) {
    console.error('Error fetching airports:', error);
    res.status(500).json({ message: 'Failed to fetch airports' });
  }
});

app.get('/api/admin/payments', async (req, res) => {
  try {
    const payments = await storage.getAllPayments();
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

app.get('/api/admin/analytics', async (req, res) => {
  try {
    const analytics = await storage.getAdminAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Admin CRUD operations
app.post('/api/admin/customers', async (req, res) => {
  try {
    const customer = await storage.createCustomer(req.body);
    res.json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Failed to create customer' });
  }
});

app.put('/api/admin/customers/:id', async (req, res) => {
  try {
    const customer = await storage.updateCustomer(req.params.id, req.body);
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Failed to update customer' });
  }
});

app.delete('/api/admin/customers/:id', async (req, res) => {
  try {
    await storage.deleteCustomer(req.params.id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Failed to delete customer' });
  }
});

app.post('/api/admin/suppliers', async (req, res) => {
  try {
    const supplier = await storage.createSupplier(req.body);
    res.json(supplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ message: 'Failed to create supplier' });
  }
});

app.put('/api/admin/suppliers/:id', async (req, res) => {
  try {
    const supplier = await storage.updateSupplier(req.params.id, req.body);
    res.json(supplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ message: 'Failed to update supplier' });
  }
});

app.delete('/api/admin/suppliers/:id', async (req, res) => {
  try {
    await storage.deleteSupplier(req.params.id);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ message: 'Failed to delete supplier' });
  }
});

app.post('/api/admin/airports', async (req, res) => {
  try {
    const airport = await storage.createAirport(req.body);
    res.json(airport);
  } catch (error) {
    console.error('Error creating airport:', error);
    res.status(500).json({ message: 'Failed to create airport' });
  }
});

app.put('/api/admin/airports/:id', async (req, res) => {
  try {
    const airport = await storage.updateAirport(req.params.id, req.body);
    res.json(airport);
  } catch (error) {
    console.error('Error updating airport:', error);
    res.status(500).json({ message: 'Failed to update airport' });
  }
});

app.delete('/api/admin/airports/:id', async (req, res) => {
  try {
    await storage.deleteAirport(req.params.id);
    res.json({ message: 'Airport deleted successfully' });
  } catch (error) {
    console.error('Error deleting airport:', error);
    res.status(500).json({ message: 'Failed to delete airport' });
  }
});

app.get('/api/admin/bookings', async (req, res) => {
  try {
    // Get all bookings with customer and parking lot information
    const { db } = await import('./db');
    const { bookings, users, parkingLots, airports } = await import('@shared/schema');
    const { desc, eq } = await import('drizzle-orm');
    
    const bookingsData = await db
      .select({
        id: bookings.id,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        totalAmount: bookings.totalAmount,
        status: bookings.status,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        userId: bookings.userId,
        lotId: bookings.lotId,
        // Customer information
        customerFirstName: users.firstName,
        customerLastName: users.lastName,
        customerEmail: users.email,
        // Parking lot and airport information
        parkingLotName: parkingLots.name,
        parkingLotAddress: parkingLots.address,
        airportId: parkingLots.airportId,
        airportCode: airports.code,
        airportName: airports.name
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .leftJoin(parkingLots, eq(bookings.lotId, parkingLots.id))
      .leftJoin(airports, eq(parkingLots.airportId, airports.id))
      .orderBy(desc(bookings.createdAt));
    
    // Format the data for the frontend
    const formattedBookings = bookingsData.map(booking => ({
      id: booking.id,
      startDate: booking.startDate,
      endDate: booking.endDate,
      amount: booking.totalAmount,
      status: booking.status || 'pending',
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      customerName: booking.customerFirstName && booking.customerLastName ? 
        `${booking.customerFirstName} ${booking.customerLastName}` : 
        'Unknown Customer',
      customerEmail: booking.customerEmail,
      parkingLotName: booking.parkingLotName || 'Unknown Lot',
      parkingLotAddress: booking.parkingLotAddress || 'Unknown Address',
      airportId: booking.airportId,
      airportCode: booking.airportCode || 'N/A',
      airportName: booking.airportName || 'Unknown Airport'
    }));
    
    res.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

  // Admin: Get payment gateway config
  app.get('/api/admin/gateway/:gatewayName', async (req, res) => {
    try {
      const { gatewayName } = req.params;
      const config = await storage.getPaymentGatewayConfig(gatewayName);
      if (!config) {
        return res.status(404).json({ message: 'Gateway config not found' });
      }
      res.json(config);
    } catch (error) {
      console.error('Error fetching gateway config:', error);
      res.status(500).json({ message: 'Failed to fetch gateway config' });
    }
  });

  // Admin: Create payment gateway config
  app.post('/api/admin/gateway', async (req, res) => {
    try {
      const { gatewayName, isActive, apiKeys, webhookUrls, configOptions, testMode } = req.body;
      const newConfig = await storage.createPaymentGatewayConfig({
        gatewayName,
        isActive,
        apiKeys,
        webhookUrls,
        configOptions,
        testMode
      });
      res.status(201).json(newConfig);
    } catch (error) {
      console.error('Error creating gateway config:', error);
      res.status(500).json({ message: 'Failed to create gateway config' });
    }
  });

  // Admin: Update payment gateway config
  app.put('/api/admin/gateway/:gatewayName', async (req, res) => {
    try {
      const { gatewayName } = req.params;
      const { isActive, apiKeys, webhookUrls, configOptions, testMode } = req.body;
      const updatedConfig = await storage.updatePaymentGatewayConfig(gatewayName, {
        isActive,
        apiKeys,
        webhookUrls,
        configOptions,
        testMode
      });
      res.json(updatedConfig);
    } catch (error) {
      console.error('Error updating gateway config:', error);
      res.status(500).json({ message: 'Failed to update gateway config' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
