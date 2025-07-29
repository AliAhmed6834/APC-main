import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from 'cookie-parser';
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { geoDetectionMiddleware, localeOverrideMiddleware } from "./middleware/geoDetection";
import { CurrencyService } from "./services/currencyService";
import { searchSchema, insertBookingSchema, insertReviewSchema } from "@shared/schema";
import { zfd } from "zod-form-data";

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
      const params = searchSchema.parse(req.query);
      const parkingLots = await storage.searchParkingLots(params);
      
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
      
      res.json(localizedLots);
    } catch (error) {
      console.error("Error searching parking:", error);
      res.status(400).json({ message: "Invalid search parameters" });
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

  const httpServer = createServer(app);
  return httpServer;
}
