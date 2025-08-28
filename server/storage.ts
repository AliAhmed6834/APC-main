import {
  users,
  airports,
  parkingLots,
  parkingPricing,
  bookings,
  reviews,
  supplierUsers,
  supplierSessions,
  parkingSlots,
  supplierBookings,
  parkingSuppliers,
  // ===== NEW SCHEMA TABLES FOR STAGE 1.5 =====
  paymentMethods,
  transactions,
  paymentGatewayConfigs,
  emailTemplates,
  emailLogs,
  smsLogs,
  userActivityLogs,
  searchAnalytics,
  revenueAnalytics,
  supplierPerformance,
  userPreferences,
  userLoyalty,
  savedSearches,
  searchFilters,
  bookingStatusHistory,
  // ===== END NEW SCHEMA TABLES =====
  type User,
  type UpsertUser,
  type Airport,
  type InsertAirport,
  type ParkingLot,
  type InsertParkingLot,
  type Booking,
  type InsertBooking,
  type Review,
  type InsertReview,
  type SearchParams,
  type SupplierUser,
  type InsertSupplierUser,
  type ParkingSlot,
  type InsertParkingSlot,
  type SupplierBooking,
  type InsertSupplierBooking,
  // ===== NEW SCHEMA TYPES FOR STAGE 1.5 =====
  type PaymentMethod,
  type InsertPaymentMethod,
  type Transaction,
  type InsertTransaction,
  type PaymentGatewayConfig,
  type EmailTemplate,
  type InsertEmailLog,
  type EmailLog,
  type InsertSmsLog,
  type SmsLog,
  type UserActivityLog,
  type InsertUserActivityLog,
  type SearchAnalytic,
  type InsertSearchAnalytic,
  type RevenueAnalytic,
  type InsertRevenueAnalytic,
  type SupplierPerformance,
  type InsertSupplierPerformance,
  type UserPreference,
  type UserLoyalty,
  type InsertSavedSearch,
  type SavedSearch,
  type SearchFilter,
  type BookingStatusHistory,
  InsertPaymentGatewayConfig
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, like, desc, asc, sql, inArray, between } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsers(): Promise<User[]>; // NEW: Get all users
  
  // Airport operations
  getAirports(): Promise<Airport[]>;
  getAirportByCode(code: string): Promise<Airport | undefined>;
  createAirport(airport: InsertAirport): Promise<Airport>;
  
  // Parking lot operations
  searchParkingLots(params: SearchParams): Promise<ParkingLot[]>;
  getParkingLot(id: string): Promise<ParkingLot | undefined>;
  getParkingLotsByAirport(airportId: string): Promise<ParkingLot[]>;
  createParkingLot(lot: InsertParkingLot): Promise<ParkingLot>;
  updateParkingLot(id: string, updates: Partial<ParkingLot>): Promise<ParkingLot | undefined>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getUserBookings(userId: string): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  
  // Pricing operations
  getParkingPricing(lotId: string, currency: string, region: string): Promise<any | undefined>;
  createParkingPricing(pricingData: any): Promise<any>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getLotReviews(lotId: string): Promise<Review[]>;
  getUserReviews(userId: string): Promise<Review[]>;
  
  // Supplier operations
  getSupplierUser(id: string): Promise<SupplierUser | undefined>;
  getSupplierUserByEmail(email: string): Promise<SupplierUser | undefined>;
  createSupplierUser(user: InsertSupplierUser): Promise<SupplierUser>;
  updateSupplierUser(id: string, updates: Partial<SupplierUser>): Promise<SupplierUser | undefined>;
  
  // Supplier authentication
  getSupplierSession(token: string): Promise<any | undefined>;
  createSupplierSession(sessionData: any): Promise<any>;
  deleteSupplierSession(token: string): Promise<void>;
  
  // Supplier parking operations
  getSupplierParkingLots(supplierId: string): Promise<ParkingLot[]>;
  createParkingSlot(slot: InsertParkingSlot): Promise<ParkingSlot>;
  getParkingSlots(lotId: string, startDate: Date, endDate: Date): Promise<ParkingSlot[]>;
  updateParkingSlot(id: string, updates: Partial<ParkingSlot>): Promise<ParkingSlot | undefined>;
  deleteParkingSlot(id: string): Promise<void>;
  
  // Supplier booking management
  getSupplierBookings(supplierId: string): Promise<SupplierBooking[]>;
  createSupplierBooking(booking: InsertSupplierBooking): Promise<SupplierBooking>;
  updateSupplierBooking(id: string, updates: Partial<SupplierBooking>): Promise<SupplierBooking | undefined>;
  
  // Supplier management
  getParkingSuppliers(): Promise<any[]>;
  getParkingSupplier(id: string): Promise<any | undefined>;
  createParkingSupplier(supplier: any): Promise<any>; // NEW: Create parking supplier

  // ===== NEW STORAGE METHODS FOR STAGE 1.5 =====

  // Payment Methods
  createPaymentMethod(data: InsertPaymentMethod): Promise<PaymentMethod>;
  getUserPaymentMethods(userId: string): Promise<PaymentMethod[]>;
  updatePaymentMethod(id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod>;

  // Transactions
  createTransaction(data: InsertTransaction): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction | null>;
  updateTransactionStatus(id: string, status: string, gatewayResponse?: any): Promise<Transaction>;

  // Payment Gateway Configs
  getPaymentGatewayConfig(gatewayName: string): Promise<PaymentGatewayConfig | null>;
  createPaymentGatewayConfig(data: InsertPaymentGatewayConfig): Promise<PaymentGatewayConfig>;
  updatePaymentGatewayConfig(gatewayName: string, data: Partial<InsertPaymentGatewayConfig>): Promise<PaymentGatewayConfig | null>;

  // Email Templates
  getEmailTemplate(templateKey: string, locale?: string): Promise<EmailTemplate | null>;
  createEmailLog(data: InsertEmailLog): Promise<EmailLog>;
  updateEmailLogStatus(id: string, status: string, deliveryStatus?: string): Promise<EmailLog>;

  // SMS Logs
  createSmsLog(data: InsertSmsLog): Promise<SmsLog>;

  // User Activity Logs
  logUserActivity(data: InsertUserActivityLog): Promise<UserActivityLog>;
  getUserActivityLogs(userId: string, limit?: number): Promise<UserActivityLog[]>;

  // Search Analytics
  logSearchAnalytics(data: InsertSearchAnalytic): Promise<SearchAnalytic>;
  getSearchAnalytics(airportCode?: string, startDate?: Date, endDate?: Date): Promise<SearchAnalytic[]>;

  // Revenue Analytics
  logRevenueAnalytics(data: InsertRevenueAnalytic): Promise<RevenueAnalytic>;
  getRevenueAnalytics(startDate: Date, endDate: Date): Promise<RevenueAnalytic[]>;

  // Supplier Performance
  logSupplierPerformance(data: InsertSupplierPerformance): Promise<SupplierPerformance>;
  getSupplierPerformance(supplierId: string, startDate: Date, endDate: Date): Promise<SupplierPerformance[]>;

  // User Preferences
  getUserPreferences(userId: string): Promise<UserPreference[]>;
  setUserPreference(userId: string, key: string, value: string, category: string): Promise<UserPreference>;

  // User Loyalty
  getUserLoyalty(userId: string): Promise<UserLoyalty | null>;
  addLoyaltyPoints(userId: string, points: number): Promise<UserLoyalty>;

  // Saved Searches
  saveSearch(data: InsertSavedSearch): Promise<SavedSearch>;
  getUserSavedSearches(userId: string): Promise<SavedSearch[]>;

  // Search Filters
  getSearchFilters(): Promise<SearchFilter[]>;

  // Booking Status History
  logBookingStatusChange(bookingId: string, userId: string, newStatus: string, oldStatus?: string, reason?: string): Promise<BookingStatusHistory>;
  getBookingStatusHistory(bookingId: string): Promise<BookingStatusHistory[]>;

  // Update existing booking with payment status
  updateBookingPaymentStatus(bookingId: string, paymentStatus: string, transactionId?: string): Promise<Booking>;

  // ===== END NEW STORAGE METHODS =====

  // ===== ANALYTICS METHODS FOR STAGE 3 =====

  // Customer Analytics
  getCustomerMetrics(userId: string, timeRange: string): Promise<any>;
  getCustomerSegments(userId: string, timeRange: string, segmentType: string): Promise<any[]>;
  getCustomerTrends(userId: string, timeRange: string, metric: string): Promise<any[]>;
  getCustomerGeography(userId: string, timeRange: string, region: string): Promise<any[]>;

  // Supplier Analytics
  getSupplierMetrics(userId: string, timeRange: string): Promise<any>;
  getSupplierPerformance(userId: string, timeRange: string, sortBy: string, limit: number): Promise<any[]>;
  getSupplierTrends(userId: string, timeRange: string, metric: string): Promise<any[]>;
  getSupplierGeography(userId: string, timeRange: string, region: string): Promise<any[]>;
  getSupplierOperations(userId: string, timeRange: string, category: string): Promise<any[]>;

  // Business Intelligence
  getBusinessOverview(userId: string, timeRange: string): Promise<any>;
  getBusinessRevenue(userId: string, timeRange: string, breakdown: string): Promise<any[]>;
  getBusinessBookings(userId: string, timeRange: string, breakdown: string): Promise<any[]>;

  // Search Analytics
  getSearchAnalytics(userId: string, timeRange: string): Promise<any>;
  getPopularSearches(userId: string, timeRange: string, limit: number): Promise<any[]>;
  getSearchConversionRates(userId: string, timeRange: string, searchType: string): Promise<any[]>;

  // Analytics Export
  generateAnalyticsExport(userId: string, type: string, timeRange: string, format: string, filters: any): Promise<string>;

  // Analytics Dashboard Configuration
  getAnalyticsDashboardConfig(userId: string): Promise<any>;
  updateAnalyticsDashboardConfig(userId: string, config: any): Promise<void>;

  // Analytics Health Check
  analyticsHealthCheck(): Promise<any>;

  // Helper method to calculate date from time range
  getDateFromTimeRange(timeRange: string): Date;

  // ===== END ANALYTICS METHODS =====

  // ===== ADMIN METHODS =====
  
  // Customer management
  getAllCustomers(): Promise<any[]>;
  createCustomer(data: any): Promise<any>;
  updateCustomer(id: string, data: any): Promise<any>;
  deleteCustomer(id: string): Promise<void>;
  
  // Supplier management
  getAllSuppliers(): Promise<any[]>;
  createSupplier(data: any): Promise<any>;
  updateSupplier(id: string, data: any): Promise<any>;
  deleteSupplier(id: string): Promise<void>;

  // Airport management
  getAllAirports(): Promise<any[]>;
  createAirport(data: any): Promise<any>;
  updateAirport(id: string, data: any): Promise<any>;
  deleteAirport(id: string): Promise<void>;

  // Payment management
  getAllPayments(): Promise<any[]>;

  // Analytics
  getAdminAnalytics(): Promise<any>;

  // Create payment gateway config
  createPaymentGatewayConfig(data: InsertPaymentGatewayConfig): Promise<PaymentGatewayConfig>;

  // Update payment gateway config
  updatePaymentGatewayConfig(gatewayName: string, data: Partial<InsertPaymentGatewayConfig>): Promise<PaymentGatewayConfig | null>;

  // ===== END ADMIN METHODS =====
}

// Database storage implementation
class DatabaseStorage implements IStorage {
  // Basic user methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values(user).returning();
      return result[0];
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      return await db.select().from(users).orderBy(desc(users.createdAt));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // Basic airport methods
  async getAirports(): Promise<Airport[]> {
    try {
      return await db.select().from(airports).orderBy(asc(airports.code));
    } catch (error) {
      console.error('Error fetching airports:', error);
      return [];
    }
  }

  async getAirportByCode(code: string): Promise<Airport | undefined> {
    try {
      const result = await db.select().from(airports).where(eq(airports.code, code)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching airport by code:', error);
      return undefined;
    }
  }

  async createAirport(airport: InsertAirport): Promise<Airport> {
    try {
      const result = await db.insert(airports).values(airport).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating airport:', error);
      throw error;
    }
  }

  // Basic parking lot methods
  async searchParkingLots(params: SearchParams): Promise<ParkingLot[]> {
    try {
      let query = db.select().from(parkingLots);
      
      if (params.airportId) {
        query = query.where(eq(parkingLots.airportId, params.airportId));
      }
      
      if (params.startDate && params.endDate) {
        // Add date filtering logic here
      }
      
      return await query.orderBy(asc(parkingLots.name));
    } catch (error) {
      console.error('Error searching parking lots:', error);
      return [];
    }
  }

  async getParkingLot(id: string): Promise<ParkingLot | undefined> {
    try {
      const result = await db.select().from(parkingLots).where(eq(parkingLots.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching parking lot:', error);
      return undefined;
    }
  }

  async getParkingLotsByAirport(airportId: string): Promise<ParkingLot[]> {
    try {
      return await db.select().from(parkingLots).where(eq(parkingLots.airportId, airportId));
    } catch (error) {
      console.error('Error fetching parking lots by airport:', error);
    return [];
    }
  }

  async createParkingLot(lot: InsertParkingLot): Promise<ParkingLot> {
    try {
      const result = await db.insert(parkingLots).values(lot).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating parking lot:', error);
      throw error;
    }
  }

  async updateParkingLot(id: string, updates: Partial<ParkingLot>): Promise<ParkingLot | undefined> {
    try {
      const result = await db.update(parkingLots).set(updates).where(eq(parkingLots.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Error updating parking lot:', error);
    return undefined;
  }
  }

  // Basic booking methods
  async createBooking(booking: InsertBooking): Promise<Booking> {
    try {
      const result = await db.insert(bookings).values(booking).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      return await db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    try {
      const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching booking:', error);
      return undefined;
    }
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    try {
      const result = await db.update(bookings).set({ status }).where(eq(bookings.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Error updating booking status:', error);
      return undefined;
    }
  }

  // Supplier methods
  async getSupplierParkingLots(supplierId: string): Promise<ParkingLot[]> {
    try {
      return await db.select().from(parkingLots).where(eq(parkingLots.supplierId, supplierId));
    } catch (error) {
      console.error('Error fetching supplier parking lots:', error);
      return [];
    }
  }

  async getParkingSuppliers(): Promise<any[]> {
    try {
      return await db.select().from(parkingSuppliers).orderBy(asc(parkingSuppliers.name));
    } catch (error) {
      console.error('Error fetching parking suppliers:', error);
      return [];
    }
  }

  async getParkingSupplier(id: string): Promise<any | undefined> {
    const suppliers = await this.getParkingSuppliers();
    return suppliers.find((s: any) => s.id === id);
  }

  async createParkingSupplier(supplier: any): Promise<any> {
    // Mock implementation - just return the supplier data
    return {
      id: `supplier_${Date.now()}`,
      ...supplier,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Add missing essential methods
  async getParkingPricing(lotId: string, currency: string, region: string): Promise<any | undefined> {
    try {
      const result = await db.select().from(parkingPricing).where(
        and(
          eq(parkingPricing.lotId, lotId),
          eq(parkingPricing.currency, currency),
          eq(parkingPricing.region, region)
        )
      ).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching parking pricing:', error);
      return undefined;
    }
  }

  async createParkingPricing(pricingData: any): Promise<any> {
    try {
      const result = await db.insert(parkingPricing).values(pricingData).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating parking pricing:', error);
      throw error;
    }
  }

  async createReview(review: InsertReview): Promise<Review> {
    try {
      const result = await db.insert(reviews).values(review).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  async getLotReviews(lotId: string): Promise<Review[]> {
    try {
      return await db.select().from(reviews).where(eq(reviews.lotId, lotId)).orderBy(desc(reviews.createdAt));
    } catch (error) {
      console.error('Error fetching lot reviews:', error);
      return [];
    }
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    try {
      return await db.select().from(reviews).where(eq(reviews.userId, userId)).orderBy(desc(reviews.createdAt));
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return [];
    }
  }

  // Add other missing methods with basic implementations
  async getSupplierUser(id: string): Promise<SupplierUser | undefined> {
    try {
      const result = await db.select().from(supplierUsers).where(eq(supplierUsers.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching supplier user:', error);
      return undefined;
    }
  }

  async getSupplierUserByEmail(email: string): Promise<SupplierUser | undefined> {
    try {
      const result = await db.select().from(supplierUsers).where(eq(supplierUsers.email, email)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching supplier user by email:', error);
      return undefined;
    }
  }

  async createSupplierUser(user: InsertSupplierUser): Promise<SupplierUser> {
    try {
      const result = await db.insert(supplierUsers).values(user).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating supplier user:', error);
      throw error;
    }
  }

  async updateSupplierUser(id: string, updates: Partial<SupplierUser>): Promise<SupplierUser | undefined> {
    try {
      const result = await db.update(supplierUsers).set(updates).where(eq(supplierUsers.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Error updating supplier user:', error);
      return undefined;
    }
  }

  // Add remaining methods with basic implementations
  async getSupplierSession(token: string): Promise<any | undefined> {
    try {
      const result = await db.select().from(supplierSessions).where(eq(supplierSessions.token, token)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching supplier session:', error);
      return undefined;
    }
  }

  async createSupplierSession(sessionData: any): Promise<any> {
    try {
      const result = await db.insert(supplierSessions).values(sessionData).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating supplier session:', error);
      throw error;
    }
  }

  async deleteSupplierSession(token: string): Promise<void> {
    try {
    await db.delete(supplierSessions).where(eq(supplierSessions.token, token));
    } catch (error) {
      console.error('Error deleting supplier session:', error);
      throw error;
  }
  }

  // Add remaining methods with basic implementations
  async createParkingSlot(slot: InsertParkingSlot): Promise<ParkingSlot> {
    try {
      const result = await db.insert(parkingSlots).values(slot).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating parking slot:', error);
      throw error;
    }
  }

  async getParkingSlots(lotId: string, startDate: Date, endDate: Date): Promise<ParkingSlot[]> {
    try {
      return await db.select().from(parkingSlots).where(
        and(
          eq(parkingSlots.lotId, lotId)
          // gte(parkingSlots.date, startDate),
          // lte(parkingSlots.date, endDate)
        )
      );
    } catch (error) {
      console.error('Error fetching parking slots:', error);
      return [];
    }
  }

  async updateParkingSlot(id: string, updates: Partial<ParkingSlot>): Promise<ParkingSlot | undefined> {
    try {
      const result = await db.update(parkingSlots).set(updates).where(eq(parkingSlots.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Error updating parking slot:', error);
      return undefined;
    }
  }

  async deleteParkingSlot(id: string): Promise<void> {
    try {
    await db.delete(parkingSlots).where(eq(parkingSlots.id, id));
    } catch (error) {
      console.error('Error deleting parking slot:', error);
      throw error;
    }
  }

  async getSupplierBookings(supplierId: string): Promise<SupplierBooking[]> {
    try {
      // Get all supplier users for this supplier
      const users = await db.select().from(supplierUsers).where(eq(supplierUsers.supplierId, supplierId));
      const userIds = users.map(u => u.id);
      if (userIds.length === 0) return [];
      // Get all bookings for these users
      return await db.select().from(supplierBookings).where(inArray(supplierBookings.supplierUserId, userIds)).orderBy(desc(supplierBookings.createdAt));
    } catch (error) {
      console.error('Error fetching supplier bookings:', error);
      return [];
    }
  }

  async createSupplierBooking(booking: InsertSupplierBooking): Promise<SupplierBooking> {
    try {
      const result = await db.insert(supplierBookings).values(booking).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating supplier booking:', error);
      throw error;
    }
  }

  async updateSupplierBooking(id: string, updates: Partial<SupplierBooking>): Promise<SupplierBooking | undefined> {
    try {
      const result = await db.update(supplierBookings).set(updates).where(eq(supplierBookings.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Error updating supplier booking:', error);
      return undefined;
    }
  }

  // ===== NEW STORAGE METHODS FOR STAGE 1.5 =====

  // Payment Methods
  async createPaymentMethod(data: InsertPaymentMethod): Promise<PaymentMethod> {
    try {
      const result = await db.insert(paymentMethods).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  }

  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      return await db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId));
    } catch (error) {
      console.error('Error fetching user payment methods:', error);
      return [];
    }
  }

  async updatePaymentMethod(id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> {
    try {
      const result = await db.update(paymentMethods).set(data).where(eq(paymentMethods.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  // Transactions
  async createTransaction(data: InsertTransaction): Promise<Transaction> {
    try {
      const result = await db.insert(transactions).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    try {
      const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  async updateTransactionStatus(id: string, status: string, gatewayResponse?: any): Promise<Transaction> {
    try {
      const result = await db.update(transactions)
        .set({ status, gatewayResponse })
        .where(eq(transactions.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }

  // Payment Gateway Configs
  async getPaymentGatewayConfig(gatewayName: string): Promise<PaymentGatewayConfig | null> {
    try {
      const result = await db.select().from(paymentGatewayConfigs).where(eq(paymentGatewayConfigs.gatewayName, gatewayName)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching payment gateway config:', error);
      return null;
    }
  }

  async createPaymentGatewayConfig(data: InsertPaymentGatewayConfig): Promise<PaymentGatewayConfig> {
    try {
      const [created] = await db.insert(paymentGatewayConfigs).values(data).returning();
      return created;
    } catch (error) {
      console.error('Error creating payment gateway config:', error);
      throw error;
    }
  }

  async updatePaymentGatewayConfig(gatewayName: string, data: Partial<InsertPaymentGatewayConfig>): Promise<PaymentGatewayConfig | null> {
    try {
      const [updated] = await db.update(paymentGatewayConfigs)
        .set(data)
        .where(eq(paymentGatewayConfigs.gatewayName, gatewayName))
        .returning();
      return updated || null;
    } catch (error) {
      console.error('Error updating payment gateway config:', error);
      throw error;
    }
  }

  // Email Templates
  async getEmailTemplate(templateKey: string, locale?: string): Promise<EmailTemplate | null> {
    try {
      const result = await db.select().from(emailTemplates).where(
        and(
          eq(emailTemplates.templateKey, templateKey),
          eq(emailTemplates.locale, locale || 'en')
        )
      ).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching email template:', error);
      return null;
    }
  }

  async createEmailLog(data: InsertEmailLog): Promise<EmailLog> {
    try {
      const result = await db.insert(emailLogs).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating email log:', error);
      throw error;
    }
  }

  async updateEmailLogStatus(id: string, status: string, deliveryStatus?: string): Promise<EmailLog> {
    try {
      const result = await db.update(emailLogs)
        .set({ status, deliveryStatus })
        .where(eq(emailLogs.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating email log status:', error);
      throw error;
    }
  }

  // SMS Logs
  async createSmsLog(data: InsertSmsLog): Promise<SmsLog> {
    try {
      const result = await db.insert(smsLogs).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating sms log:', error);
      throw error;
    }
  }

  // User Activity Logs
  async logUserActivity(data: InsertUserActivityLog): Promise<UserActivityLog> {
    try {
      const result = await db.insert(userActivityLogs).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error logging user activity:', error);
      throw error;
    }
  }

  async getUserActivityLogs(userId: string, limit?: number): Promise<UserActivityLog[]> {
    try {
      let query = db.select().from(userActivityLogs).where(eq(userActivityLogs.userId, userId));
      if (limit) {
        query = query.limit(limit);
      }
      return await query.orderBy(desc(userActivityLogs.createdAt));
    } catch (error) {
      console.error('Error fetching user activity logs:', error);
      return [];
    }
  }

  // Search Analytics
  async logSearchAnalytics(data: InsertSearchAnalytic): Promise<SearchAnalytic> {
    try {
      const result = await db.insert(searchAnalytics).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error logging search analytics:', error);
      throw error;
    }
  }

  async getSearchAnalytics(airportCode?: string, startDate?: Date, endDate?: Date): Promise<SearchAnalytic[]> {
    try {
      let query = db.select().from(searchAnalytics);
      if (airportCode) {
        query = query.where(eq(searchAnalytics.airportCode, airportCode));
      }
      if (startDate && endDate) {
        query = query.where(
          and(
            gte(searchAnalytics.createdAt, startDate),
            lte(searchAnalytics.createdAt, endDate)
          )
        );
      }
      return await query.orderBy(desc(searchAnalytics.createdAt));
    } catch (error) {
      console.error('Error fetching search analytics:', error);
      return [];
    }
  }

  // Revenue Analytics
  async logRevenueAnalytics(data: InsertRevenueAnalytic): Promise<RevenueAnalytic> {
    try {
      const result = await db.insert(revenueAnalytics).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error logging revenue analytics:', error);
      throw error;
    }
  }

  async getRevenueAnalytics(startDate: Date, endDate: Date): Promise<RevenueAnalytic[]> {
    try {
      return await db.select().from(revenueAnalytics).where(
        and(
          gte(revenueAnalytics.createdAt, startDate),
          lte(revenueAnalytics.createdAt, endDate)
        )
      ).orderBy(desc(revenueAnalytics.createdAt));
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      return [];
    }
  }

  // Supplier Performance
  async logSupplierPerformance(data: InsertSupplierPerformance): Promise<SupplierPerformance> {
    try {
      const result = await db.insert(supplierPerformance).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error logging supplier performance:', error);
      throw error;
    }
  }

  async getSupplierPerformance(supplierId: string, startDate: Date, endDate: Date): Promise<SupplierPerformance[]> {
    try {
      return await db.select().from(supplierPerformance).where(
        and(
          eq(supplierPerformance.supplierId, supplierId),
          gte(supplierPerformance.createdAt, startDate),
          lte(supplierPerformance.createdAt, endDate)
        )
      ).orderBy(desc(supplierPerformance.createdAt));
    } catch (error) {
      console.error('Error fetching supplier performance:', error);
      return [];
    }
  }

  // User Preferences
  async getUserPreferences(userId: string): Promise<UserPreference[]> {
    try {
      return await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return [];
    }
  }

  async setUserPreference(userId: string, key: string, value: string, category: string): Promise<UserPreference> {
    try {
      const result = await db.insert(userPreferences).values({ userId, key, value, category }).onConflictDoUpdate({
        target: [userPreferences.userId, userPreferences.key, userPreferences.category],
        set: { value }
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error setting user preference:', error);
      throw error;
    }
  }

  // User Loyalty
  async getUserLoyalty(userId: string): Promise<UserLoyalty | null> {
    try {
      const result = await db.select().from(userLoyalty).where(eq(userLoyalty.userId, userId)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching user loyalty:', error);
      return null;
    }
  }

  async addLoyaltyPoints(userId: string, points: number): Promise<UserLoyalty> {
    try {
      const result = await db.update(userLoyalty)
        .set({ points: sql`${userLoyalty.points} + ${points}` })
        .where(eq(userLoyalty.userId, userId))
          .returning();
      return result[0];
    } catch (error) {
      console.error('Error adding loyalty points:', error);
      throw error;
    }
  }

  // Saved Searches
  async saveSearch(data: InsertSavedSearch): Promise<SavedSearch> {
    try {
      const result = await db.insert(savedSearches).values(data).returning();
      return result[0];
    } catch (error) {
      console.error('Error saving search:', error);
      throw error;
    }
  }

  async getUserSavedSearches(userId: string): Promise<SavedSearch[]> {
    try {
      return await db.select().from(savedSearches).where(eq(savedSearches.userId, userId)).orderBy(desc(savedSearches.createdAt));
    } catch (error) {
      console.error('Error fetching user saved searches:', error);
      return [];
    }
  }

  // Search Filters
  async getSearchFilters(): Promise<SearchFilter[]> {
    try {
      return await db.select().from(searchFilters).orderBy(desc(searchFilters.createdAt));
    } catch (error) {
      console.error('Error fetching search filters:', error);
      return [];
    }
  }

  // Booking Status History
  async logBookingStatusChange(bookingId: string, userId: string, newStatus: string, oldStatus?: string, reason?: string): Promise<BookingStatusHistory> {
    try {
      const result = await db.insert(bookingStatusHistory).values({ bookingId, userId, newStatus, oldStatus, reason }).returning();
      return result[0];
    } catch (error) {
      console.error('Error logging booking status change:', error);
      throw error;
    }
  }

  async getBookingStatusHistory(bookingId: string): Promise<BookingStatusHistory[]> {
    try {
      return await db.select().from(bookingStatusHistory).where(eq(bookingStatusHistory.bookingId, bookingId)).orderBy(desc(bookingStatusHistory.createdAt));
    } catch (error) {
      console.error('Error fetching booking status history:', error);
      return [];
    }
  }

  // Update existing booking with payment status
  async updateBookingPaymentStatus(bookingId: string, paymentStatus: string, transactionId?: string): Promise<Booking> {
    try {
      const result = await db.update(bookings)
        .set({ paymentStatus, transactionId })
        .where(eq(bookings.id, bookingId))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating booking payment status:', error);
      throw error;
    }
  }

  // ===== END NEW STORAGE METHODS =====

  // ===== ANALYTICS METHODS FOR STAGE 3 =====

  // Customer Analytics
  async getCustomerMetrics(userId: string, timeRange: string): Promise<any> {
    try {
      const startDate = this.getDateFromTimeRange(timeRange);
      const endDate = new Date();

      const totalBookings = await db.select({ count: sql`count(*)` }).from(bookings).where(
        and(
          eq(bookings.userId, userId),
          gte(bookings.createdAt, startDate),
          lte(bookings.createdAt, endDate)
        )
      );

      const totalAmount = await db.select({ sum: sql`sum(totalAmount)` }).from(bookings).where(
        and(
          eq(bookings.userId, userId),
          gte(bookings.createdAt, startDate),
          lte(bookings.createdAt, endDate)
        )
      );

      const totalRevenue = totalAmount[0]?.sum || 0;

      return {
        totalBookings: totalBookings[0]?.count || 0,
        totalRevenue: totalRevenue
      };
    } catch (error) {
      console.error('Error fetching customer metrics:', error);
      return { totalBookings: 0, totalRevenue: 0 };
    }
  }

  async getCustomerSegments(userId: string, timeRange: string, segmentType: string): Promise<any[]> {
    try {
      const startDate = this.getDateFromTimeRange(timeRange);
      const endDate = new Date();

      let query: any;
      if (segmentType === 'by_booking_count') {
        query = db.select({
          segment: bookings.status,
          count: sql`count(*)`
        }).from(bookings).where(
          and(
            eq(bookings.userId, userId),
            gte(bookings.createdAt, startDate),
            lte(bookings.createdAt, endDate)
          )
        ).groupBy(bookings.status);
      } else if (segmentType === 'by_booking_amount') {
        query = db.select({
          segment: bookings.status,
          sum: sql`sum(totalAmount)`
        }).from(bookings).where(
          and(
            eq(bookings.userId, userId),
            gte(bookings.createdAt, startDate),
            lte(bookings.createdAt, endDate)
          )
        ).groupBy(bookings.status);
      } else {
        return [];
      }

      const result = await query;
      return result.map(item => ({
        segment: item.segment,
        count: item.count || 0,
        sum: item.sum || 0
      }));
    } catch (error) {
      console.error('Error fetching customer segments:', error);
      return [];
    }
  }

  async getCustomerTrends(userId: string, timeRange: string, metric: string): Promise<any[]> {
    try {
      const startDate = this.getDateFromTimeRange(timeRange);
      const endDate = new Date();

      let query: any;
      if (metric === 'total_bookings') {
        query = db.select({
          date: bookings.createdAt,
          count: sql`count(*)`
        }).from(bookings).where(
          and(
            eq(bookings.userId, userId),
            gte(bookings.createdAt, startDate),
            lte(bookings.createdAt, endDate)
          )
        ).groupBy(bookings.createdAt);
      } else if (metric === 'total_amount') {
        query = db.select({
          date: bookings.createdAt,
          sum: sql`sum(totalAmount)`
        }).from(bookings).where(
          and(
            eq(bookings.userId, userId),
            gte(bookings.createdAt, startDate),
            lte(bookings.createdAt, endDate)
          )
        ).groupBy(bookings.createdAt);
      } else {
        return [];
      }

      const result = await query;
      return result.map(item => ({
        date: item.date,
        value: item.count || item.sum || 0
      }));
    } catch (error) {
      console.error('Error fetching customer trends:', error);
      return [];
    }
  }

  async getCustomerGeography(userId: string, timeRange: string, region: string): Promise<any[]> {
    try {
      const startDate = this.getDateFromTimeRange(timeRange);
      const endDate = new Date();

      let query: any;
      if (region === 'country') {
        query = db.select({
          country: airports.country,
          count: sql`count(distinct bookings.id)`
        }).from(bookings).leftJoin(parkingLots, eq(bookings.lotId, parkingLots.id)).leftJoin(airports, eq(parkingLots.airportId, airports.id)).where(
          and(
            eq(bookings.userId, userId),
            gte(bookings.createdAt, startDate),
            lte(bookings.createdAt, endDate)
          )
        ).groupBy(airports.country);
      } else if (region === 'city') {
        query = db.select({
          city: airports.city,
          count: sql`count(distinct bookings.id)`
        }).from(bookings).leftJoin(parkingLots, eq(bookings.lotId, parkingLots.id)).leftJoin(airports, eq(parkingLots.airportId, airports.id)).where(
          and(
            eq(bookings.userId, userId),
            gte(bookings.createdAt, startDate),
            lte(bookings.createdAt, endDate)
          )
        ).groupBy(airports.city);
      } else {
        return [];
      }

      const result = await query;
      return result.map(item => ({
        name: item.city || item.country,
        value: item.count || 0
      }));
    } catch (error) {
      console.error('Error fetching customer geography:', error);
      return [];
    }
  }

  // Supplier Analytics
  async getSupplierMetrics(userId: string, timeRange: string): Promise<any> {
    try {
      const startDate = this.getDateFromTimeRange(timeRange);
      const endDate = new Date();

      const totalBookings = await db.select({ count: sql`count(*)` }).from(supplierBookings).where(
        and(
          eq(supplierBookings.supplierId, userId),
          gte(supplierBookings.createdAt, startDate),
          lte(supplierBookings.createdAt, endDate)
        )
      );

      const totalAmount = await db.select({ sum: sql`sum(booking.totalAmount)` }).from(supplierBookings).leftJoin(bookings, eq(supplierBookings.bookingId, bookings.id)).where(
        and(
          eq(supplierBookings.supplierId, userId),
          gte(supplierBookings.createdAt, startDate),
          lte(supplierBookings.createdAt, endDate)
        )
      );

      const totalRevenue = totalAmount[0]?.sum || 0;

      return {
        totalBookings: totalBookings[0]?.count || 0,
        totalRevenue: totalRevenue
      };
    } catch (error) {
      console.error('Error fetching supplier metrics:', error);
      return { totalBookings: 0, totalRevenue: 0 };
    }
  }

  async getSupplierPerformance(userId: string, timeRange: string, sortBy: string, limit: number): Promise<any[]> {
    try {
      const startDate = this.getDateFromTimeRange(timeRange);
      const endDate = new Date();

      let query: any;
      if (sortBy === 'total_revenue') {
        query = db.select({
          date: supplierPerformance.createdAt,
          sum: sql`sum(totalRevenue)`
        }).from(supplierPerformance).where(
          and(
            eq(supplierPerformance.supplierId, userId),
            gte(supplierPerformance.createdAt, startDate),
            lte(supplierPerformance.createdAt, endDate)
          )
        ).groupBy(supplierPerformance.createdAt);
      } else if (sortBy === 'total_bookings') {
        query = db.select({
          date: supplierPerformance.createdAt,
          count: sql`count(*)`
        }).from(supplierPerformance).where(
          and(
            eq(supplierPerformance.supplierId, userId),
            gte(supplierPerformance.createdAt, startDate),
            lte(supplierPerformance.createdAt, endDate)
          )
        ).groupBy(supplierPerformance.createdAt);
      } else {
        return [];
      }

      const result = await query;
      return result.map(item => ({
        date: item.date,
        value: item.sum || item.count || 0
      }));
    } catch (error) {
      console.error('Error fetching supplier performance:', error);
      return [];
    }
  }

  async getSupplierTrends(userId: string, timeRange: string, metric: string): Promise<any[]> {
    try {
      const startDate = this.getDateFromTimeRange(timeRange);
      const endDate = new Date();

      let query: any;
      if (metric === 'total_revenue') {
        query = db.select({
          date: revenueAnalytics.createdAt,
          sum: sql`sum(totalRevenue)`
        }).from(revenueAnalytics).where(
          and(
            eq(revenueAnalytics.supplierId, userId),
            gte(revenueAnalytics.createdAt, startDate),
            lte(revenueAnalytics.createdAt, endDate)
          )
        ).groupBy(revenueAnalytics.createdAt);
      } else if (metric === 'total_bookings') {
        query = db.select({
          date: searchAnalytics.createdAt,
          count: sql`count(*)`
        }).from(searchAnalytics).where(
          and(
            eq(searchAnalytics.supplierId, userId),
            gte(searchAnalytics.createdAt, startDate),
            lte(searchAnalytics.createdAt, endDate)
          )
        ).groupBy(searchAnalytics.createdAt);
      } else {
        return [];
      }

      const result = await query;
      return result.map(item => ({
        date: item.date,
        value: item.sum || item.count || 0
      }));
    } catch (error) {
      console.error('Error fetching supplier trends:', error);
      return [];
    }
  }

  async getSupplierGeography(userId: string, timeRange: string, region: string): Promise<any[]> {
    try {
      const startDate = this.getDateFromTimeRange(timeRange);
      const endDate = new Date();

      let query: any;
      if (region === 'country') {
        query = db.select({
          country: airports.country,
          count: sql`count(distinct supplierBookings.id)`
        }).from(supplierBookings).leftJoin(bookings, eq(supplierBookings.bookingId, bookings.id)).leftJoin(parkingLots, eq(bookings.lotId, parkingLots.id)).leftJoin(airports, eq(parkingLots.airportId, airports.id)).where(
          and(
            eq(supplierBookings.supplierId, userId),
            gte(supplierBookings.createdAt, startDate),
            lte(supplierBookings.createdAt, endDate)
          )
        ).groupBy(airports.country);
      } else if (region === 'city') {
        query = db.select({
          city: airports.city,
          count: sql`count(distinct supplierBookings.id)`
        }).from(supplierBookings).leftJoin(bookings, eq(supplierBookings.bookingId, bookings.id)).leftJoin(parkingLots, eq(bookings.lotId, parkingLots.id)).leftJoin(airports, eq(parkingLots.airportId, airports.id)).where(
          and(
            eq(supplierBookings.supplierId, userId),
            gte(supplierBookings.createdAt, startDate),
            lte(supplierBookings.createdAt, endDate)
          )
        ).groupBy(airports.city);
      } else {
        return [];
      }

      const result = await query;
      return result.map(item => ({
        name: item.city || item.country,
        value: item.count || 0
      }));
    } catch (error) {
      console.error('Error fetching supplier geography:', error);
      return [];
    }
  }

  async getSupplierOperations(userId: string, timeRange: string, category: string): Promise<any[]> {
    try {
      const startDate = this.getDateFromTimeRange(timeRange);
      const endDate = new Date();

      let query: any;
      if (category === 'booking_count') {
        query = db.select({
          date: supplierBookings.createdAt,
          count: sql`count(*)`
        }).from(supplierBookings).where(
          and(
            eq(supplierBookings.supplierId, userId),
            gte(supplierBookings.createdAt, startDate),
            lte(supplierBookings.createdAt, endDate)
          )
        ).groupBy(supplierBookings.createdAt);
      } else if (category === 'booking_amount') {
        query = db.select({
          date: supplierBookings.createdAt,
          sum: sql`sum(booking.totalAmount)`
        }).from(supplierBookings).leftJoin(bookings, eq(supplierBookings.bookingId, bookings.id)).where(
          and(
            eq(supplierBookings.supplierId, userId),
            gte(supplierBookings.createdAt, startDate),
            lte(supplierBookings.createdAt, endDate)
          )
        ).groupBy(supplierBookings.createdAt);
      } else {
        return [];
      }

      const result = await query;
      return result.map(item => ({
        date: item.date,
        value: item.sum || item.count || 0
      }));
    } catch (error) {
      console.error('Error fetching supplier operations:', error);
      return [];
    }
  }

  // Business Intelligence
  async getBusinessOverview(userId: string, timeRange: string): Promise<any> {
    try {
      const startDate = this.getDateFromTimeRange(timeRange);
      const endDate = new Date();

      const totalBookings = await db.select({ count: sql`count(*)` }).from(bookings).where(
        and(
          eq(bookings.userId, userId),
          gte(bookings.createdAt, startDate),
          lte(bookings.createdAt, endDate)
        )
      );

      const totalAmount = await db.select({ sum: sql`sum(totalAmount)` }).from(bookings).where(
        and(
          eq(bookings.userId, userId),
          gte(bookings.createdAt, startDate),
          lte(bookings.createdAt, endDate)
        )
      );

      const totalRevenue = totalAmount[0]?.sum || 0;

      const activeAirports = await db.select({ count: sql`count(distinct bookings.lotId)` }).from(bookings).leftJoin(parkingLots, eq(bookings.lotId, parkingLots.id)).where(
        and(
          eq(bookings.userId, userId),
          gte(bookings.createdAt, startDate),
          lte(bookings.createdAt, endDate)
        )
      );

      const pendingPayments = await db.select({ count: sql`count(*)` }).from(bookings).where(
        and(
          eq(bookings.userId, userId),
          eq(bookings.status, 'pending'),
          gte(bookings.createdAt, startDate),
          lte(bookings.createdAt, endDate)
        )
      );

      return {
        totalBookings: totalBookings[0]?.count || 0,
        totalRevenue: totalRevenue,
        activeAirports: activeAirports[0]?.count || 0,
        pendingPayments: pendingPayments[0]?.count || 0
      };
    } catch (error) {
      console.error('Error fetching business overview:', error);
      return { totalBookings: 0, totalRevenue: 0, activeAirports: 0, pendingPayments: 0 };
    }
  }

  async getBusinessRevenue(userId: string, timeRange: string, breakdown: string): Promise<any[]> {
    try {
      const startDate = this.getDateFromTimeRange(timeRange);
      const endDate = new Date();

      let query: any;
      if (breakdown === 'by_airport') {
        query = db.select({
          airportCode: airports.code,
          sum: sql`sum(booking.totalAmount)`
        }).from(bookings).leftJoin(parkingLots, eq(bookings.lotId, parkingLots.id)).leftJoin(airports, eq(parkingLots.airportId, airports.id)).where(
          and(
            eq(bookings.userId, userId),
            gte(bookings.createdAt, startDate),
            lte(bookings.createdAt, endDate)
          )
        ).groupBy(airports.code);
      } else if (breakdown === 'by_lot') {
        query = db.select({
          lotName: parkingLots.name,
          sum: sql`sum(booking.totalAmount)`
        }).from(bookings).leftJoin(parkingLots, eq(bookings.lotId, parkingLots.id)).where(
          and(
            eq(bookings.userId, userId),
            gte(bookings.createdAt, startDate),
            lte(bookings.createdAt, endDate)
          )
        ).groupBy(parkingLots.name);
      } else {
        return [];
      }

      const result = await query;
      return result.map(item => ({
        name: item.lotName || item.airportCode,
        value: item.sum || 0
      }));
    } catch (error) {
      console.error('Error fetching business revenue:', error);
      return [];
    }
  }

  async getBusinessBookings(userId: string, timeRange: string, breakdown: string): Promise<any[]> {
    try {
      const startDate = this.getDateFromTimeRange(timeRange);
      const endDate = new Date();

      let query: any;
      if (breakdown === 'by_airport') {
        query = db.select({
          airportCode: airports.code,
          count: sql`count(*)`
        }).from(bookings).leftJoin(parkingLots, eq(bookings.lotId, parkingLots.id)).leftJoin(airports, eq(parkingLots.airportId, airports.id)).where(
          and(
            eq(bookings.userId, userId),
            gte(bookings.createdAt, startDate),
            lte(bookings.createdAt, endDate)
          )
        ).groupBy(airports.code);
      } else if (breakdown === 'by_lot') {
        query = db.select({
          lotName: parkingLots.name,
          count: sql`count(*)`
        }).from(bookings).leftJoin(parkingLots, eq(bookings.lotId, parkingLots.id)).where(
          and(
            eq(bookings.userId, userId),
            gte(bookings.createdAt, startDate),
            lte(bookings.createdAt, endDate)
          )
        ).groupBy(parkingLots.name);
      } else {
        return [];
      }

      const result = await query;
      return result.map(item => ({
        name: item.lotName || item.airportCode,
        value: item.count || 0
      }));
    } catch (error) {
      console.error('Error fetching business bookings:', error);
      return [];
    }
  }

  // Search Analytics
  async getSearchAnalytics(userId: string, timeRange: string): Promise<any> {
    try {
      const startDate = this.getDateFromTimeRange(timeRange);
      const endDate = new Date();

      const totalSearches = await db.select({ count: sql`count(*)` }).from(searchAnalytics).where(
        and(
          eq(searchAnalytics.userId, userId),
          gte(searchAnalytics.createdAt, startDate),
          lte(searchAnalytics.createdAt, endDate)
        )
      );

      const totalConversions = await db.select({ count: sql`count(*)` }).from(bookings).where(
        and(
          eq(bookings.userId, userId),
          eq(bookings.status, 'completed'),
          gte(bookings.createdAt, startDate),
          lte(bookings.createdAt, endDate)
        )
      );

      return {
        totalSearches: totalSearches[0]?.count || 0,
        totalConversions: totalConversions[0]?.count || 0
      };
    } catch (error) {
      console.error('Error fetching search analytics:', error);
      return { totalSearches: 0, totalConversions: 0 };
    }
  }

  async getPopularSearches(userId: string, timeRange: string, limit: number): Promise<any[]> {
    try {
      const startDate = this.getDateFromTimeRange(timeRange);
      const endDate = new Date();

      const popularSearches = await db.select({
        searchTerm: searchAnalytics.searchTerm,
        count: sql`count(*)`
      }).from(searchAnalytics).where(
        and(
          eq(searchAnalytics.userId, userId),
          gte(searchAnalytics.createdAt, startDate),
          lte(searchAnalytics.createdAt, endDate)
        )
      ).groupBy(searchAnalytics.searchTerm).orderBy(desc(sql`count`)).limit(limit);

      return popularSearches.map(item => ({
        searchTerm: item.searchTerm,
        count: item.count || 0
      }));
    } catch (error) {
      console.error('Error fetching popular searches:', error);
      return [];
    }
  }

  async getSearchConversionRates(userId: string, timeRange: string, searchType: string): Promise<any[]> {
    try {
      const startDate = this.getDateFromTimeRange(timeRange);
      const endDate = new Date();

      let query: any;
      if (searchType === 'booking_rate') {
        query = db.select({
          searchTerm: searchAnalytics.searchTerm,
          rate: sql`sum(case when bookings.id is not null then 1 else 0 end) / count(*)`
        }).from(searchAnalytics).leftJoin(bookings, eq(searchAnalytics.searchId, bookings.id)).where(
          and(
            eq(searchAnalytics.userId, userId),
            gte(searchAnalytics.createdAt, startDate),
            lte(searchAnalytics.createdAt, endDate)
          )
        ).groupBy(searchAnalytics.searchTerm);
      } else if (searchType === 'completion_rate') {
        query = db.select({
          searchTerm: searchAnalytics.searchTerm,
          rate: sql`sum(case when bookings.id is not null then 1 else 0 end) / count(*)`
        }).from(searchAnalytics).leftJoin(bookings, eq(searchAnalytics.searchId, bookings.id)).where(
          and(
            eq(searchAnalytics.userId, userId),
            gte(searchAnalytics.createdAt, startDate),
            lte(searchAnalytics.createdAt, endDate)
          )
        ).groupBy(searchAnalytics.searchTerm);
      } else {
        return [];
      }

      const result = await query;
      return result.map(item => ({
        searchTerm: item.searchTerm,
        rate: item.rate || 0
      }));
    } catch (error) {
      console.error('Error fetching search conversion rates:', error);
      return [];
    }
  }

  // Analytics Export
  async generateAnalyticsExport(userId: string, type: string, timeRange: string, format: string, filters: any): Promise<string> {
    try {
      // In a real application, you would generate a report based on the type, timeRange, and filters.
      // For this example, we'll just return a placeholder.
      return `Exporting ${type} analytics for user ${userId} from ${timeRange} in ${format} format.`;
    } catch (error) {
      console.error('Error generating analytics export:', error);
      throw error;
    }
  }

  // Analytics Dashboard Configuration
  async getAnalyticsDashboardConfig(userId: string): Promise<any> {
    try {
      const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).and(eq(userPreferences.key, 'dashboardConfig')).limit(1);
      return result[0]?.value || {};
    } catch (error) {
      console.error('Error fetching analytics dashboard config:', error);
      return {};
    }
  }

  async updateAnalyticsDashboardConfig(userId: string, config: any): Promise<void> {
    try {
      await db.insert(userPreferences).values({ userId, key: 'dashboardConfig', value: config, category: 'analytics' }).onConflictDoUpdate({
        target: [userPreferences.userId, userPreferences.key, userPreferences.category],
        set: { value: config }
      });
    } catch (error) {
      console.error('Error updating analytics dashboard config:', error);
      throw error;
    }
  }

  // Analytics Health Check
  async analyticsHealthCheck(): Promise<any> {
    try {
      // Simulate a health check
      return { status: 'OK', message: 'All analytics services are running' };
    } catch (error) {
      console.error('Error performing analytics health check:', error);
      return { status: 'ERROR', message: 'Analytics services are experiencing issues' };
    }
  }

  // Helper method to calculate date from time range
  getDateFromTimeRange(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case 'last_7_days':
        return new Date(now.setDate(now.getDate() - 7));
      case 'last_30_days':
        return new Date(now.setDate(now.getDate() - 30));
      case 'last_90_days':
        return new Date(now.setDate(now.getDate() - 90));
      case 'last_year':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return now; // Default to current date
    }
  }

  // ===== END ANALYTICS METHODS =====

  // ===== ADMIN METHODS =====
  
  // Customer management
  async getAllCustomers(): Promise<any[]> {
    try {
      const customersData = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt
        })
        .from(users)
        .orderBy(desc(users.createdAt));

      // Get booking statistics for each customer
      const customersWithStats = await Promise.all(
        customersData.map(async (customer) => {
          const customerBookings = await db
            .select()
            .from(bookings)
            .where(eq(bookings.userId, customer.id));

          const totalBookings = customerBookings.length;
          const totalSpent = customerBookings.reduce((sum, booking) => {
            return sum + parseFloat(booking.totalAmount || '0');
          }, 0);

          const lastBooking = customerBookings.length > 0 ? 
            customerBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] : 
            null;

          return {
            ...customer,
            phone: customer.phone || null,
            isActive: true, // Default to active since we don't have this field
            totalBookings,
            totalSpent,
            lastBookingDate: lastBooking?.createdAt
          };
        })
      );

      return customersWithStats;
    } catch (error) {
      console.error('Error fetching all customers:', error);
      return [];
    }
  }

  async getAllSuppliers(): Promise<any[]> {
    try {
      const suppliersData = await db
        .select({
          id: supplierUsers.id,
          email: supplierUsers.email,
          firstName: supplierUsers.firstName,
          lastName: supplierUsers.lastName,
          createdAt: supplierUsers.createdAt,
          updatedAt: supplierUsers.updatedAt,
          supplierId: supplierUsers.supplierId
        })
        .from(supplierUsers)
        .orderBy(desc(supplierUsers.createdAt));

      // Get statistics for each supplier
      const suppliersWithStats = await Promise.all(
        suppliersData.map(async (supplier) => {
          const supplierLots = await this.getSupplierParkingLots(supplier.supplierId);
          const supplierBookings = await this.getSupplierBookings(supplier.supplierId);

          const totalParkingLots = supplierLots.length;
          const totalBookings = supplierBookings.length;
          const totalRevenue = supplierBookings.reduce((sum, booking) => {
            return sum + parseFloat(booking.booking?.totalAmount || '0');
          }, 0);

          // Calculate average rating from parking lots
          const totalRating = supplierLots.reduce((sum, lot) => {
            return sum + parseFloat(lot.rating || '0');
          }, 0);
          const averageRating = supplierLots.length > 0 ? totalRating / supplierLots.length : 0;

          return {
            ...supplier,
            phone: supplier.phone || null,
            companyName: supplier.companyName || 'Unknown Company',
            isActive: true, // Default to active
            totalParkingLots,
            totalBookings,
            totalRevenue,
            rating: averageRating
          };
        })
      );

      return suppliersWithStats;
    } catch (error) {
      console.error('Error fetching all suppliers:', error);
      return [];
    }
  }

  async getAllAirports(): Promise<any[]> {
    try {
      console.log('🔍 getAllAirports: Starting to fetch airports...');
      
      const airportsData = await db
        .select({
          id: airports.id,
          code: airports.code,
          name: airports.name,
          city: airports.city,
          country: airports.country,
          createdAt: airports.createdAt,
          updatedAt: airports.updatedAt
        })
        .from(airports)
        .orderBy(asc(airports.code));

      console.log('🔍 getAllAirports: Raw airports data:', airportsData);
      console.log('🔍 getAllAirports: Number of airports found:', airportsData.length);

      // Return airports with basic stats (simplified to avoid errors)
      const result = airportsData.map(airport => ({
        ...airport,
        isActive: true, // Default to active
        totalParkingLots: 0, // Will be calculated later
        totalBookings: 0 // Will be calculated later
      }));

      console.log('🔍 getAllAirports: Final result:', result);
      return result;

    } catch (error) {
      console.error('❌ Error fetching all airports:', error);
      return [];
    }
  }

  async getAllPayments(): Promise<any[]> {
    try {
      // Get all bookings as payments with customer and supplier information
      const paymentsData = await db
        .select({
          id: bookings.id,
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
          // Parking lot and supplier information
          lotName: parkingLots.name,
          lotAddress: parkingLots.address,
          airportId: parkingLots.airportId,
          airportCode: airports.code,
          airportName: airports.name,
          supplierId: parkingLots.supplierId
        })
        .from(bookings)
        .leftJoin(users, eq(bookings.userId, users.id))
        .leftJoin(parkingLots, eq(bookings.lotId, parkingLots.id))
        .leftJoin(airports, eq(parkingLots.airportId, airports.id))
        .orderBy(desc(bookings.createdAt));

      // Get supplier names for each payment
      const paymentsWithSuppliers = await Promise.all(
        paymentsData.map(async (payment) => {
          let supplierName = 'Unknown Supplier';
          if (payment.supplierId) {
            const supplier = await db
              .select({
                firstName: supplierUsers.firstName,
                lastName: supplierUsers.lastName,
                companyName: supplierUsers.companyName
              })
              .from(supplierUsers)
              .where(eq(supplierUsers.supplierId, payment.supplierId))
              .limit(1);
            
            if (supplier.length > 0) {
              supplierName = supplier[0].companyName || 
                `${supplier[0].firstName} ${supplier[0].lastName}`;
            }
          }

          return {
            id: payment.id,
            amount: payment.totalAmount,
            currency: 'USD', // Default currency
            status: payment.status || 'pending',
            paymentMethod: 'credit_card', // Default payment method
            createdAt: payment.createdAt,
            customerName: payment.customerFirstName && payment.customerLastName ? 
              `${payment.customerFirstName} ${payment.customerLastName}` : 
              payment.customerEmail || 'Unknown Customer',
            supplierName: supplierName,
            airportCode: payment.airportCode,
            airportName: payment.airportName,
            parkingLotName: payment.lotName
          };
        })
      );

      return paymentsWithSuppliers;
    } catch (error) {
      console.error('Error fetching all payments:', error);
      return [];
    }
  }

  async getAdminAnalytics(): Promise<any> {
    try {
      const customers = await this.getAllCustomers();
      const suppliers = await this.getAllSuppliers();
      const airports = await this.getAllAirports();
      const payments = await this.getAllPayments();

      const totalCustomers = customers.length;
      const totalSuppliers = suppliers.length;
      const totalBookings = payments.length;
      const totalRevenue = payments.reduce((sum, payment) => {
        return sum + parseFloat(payment.amount || '0');
      }, 0);

      const activeAirports = airports.filter(airport => airport.isActive).length;
      const pendingPayments = payments.filter(payment => payment.status === 'pending').length;

      // Calculate growth rates (simplified - would need historical data for real calculation)
      const customerGrowth = 15; // Placeholder
      const supplierGrowth = 8; // Placeholder

      // Generate trend data (simplified)
      const dailyBookings = Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 10);
      const dailyRevenue = dailyBookings.map(bookings => bookings * (Math.random() * 50 + 25));

      return {
        overview: {
          totalCustomers,
          totalSuppliers,
          totalBookings,
          totalRevenue,
          activeAirports,
          pendingPayments
        },
        trends: {
          dailyBookings,
          dailyRevenue,
          customerGrowth,
          supplierGrowth
        }
      };
    } catch (error) {
      console.error('Error fetching admin analytics:', error);
      return {
        overview: {
          totalCustomers: 0,
          totalSuppliers: 0,
          totalBookings: 0,
          totalRevenue: 0,
          activeAirports: 0,
          pendingPayments: 0
        },
        trends: {
          dailyBookings: [],
          dailyRevenue: [],
          customerGrowth: 0,
          supplierGrowth: 0
        }
      };
    }
  }

  // Create payment gateway config
  async createPaymentGatewayConfig(data: InsertPaymentGatewayConfig): Promise<PaymentGatewayConfig> {
    try {
      const [created] = await db.insert(paymentGatewayConfigs).values(data).returning();
      return created;
    } catch (error) {
      console.error('Error creating payment gateway config:', error);
      throw error;
    }
  }

  // Update payment gateway config
  async updatePaymentGatewayConfig(gatewayName: string, data: Partial<InsertPaymentGatewayConfig>): Promise<PaymentGatewayConfig | null> {
    try {
      const [updated] = await db.update(paymentGatewayConfigs)
        .set(data)
        .where(eq(paymentGatewayConfigs.gatewayName, gatewayName))
        .returning();
      return updated || null;
    } catch (error) {
      console.error('Error updating payment gateway config:', error);
      throw error;
    }
  }

  async createCustomer(data: any): Promise<any> {
    try {
      const newCustomer = await db.insert(users).values({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: 'customer',
        isActive: data.isActive !== false
      }).returning();

      return newCustomer[0];
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  async updateCustomer(id: string, data: any): Promise<any> {
    try {
      const updatedCustomer = await db.update(users)
        .set({ 
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          isActive: data.isActive,
            updatedAt: new Date()
          })
        .where(eq(users.id, id))
          .returning();

      return updatedCustomer[0];
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    try {
      await db.delete(users).where(eq(users.id, id));
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  async createSupplier(data: any): Promise<any> {
    try {
      const newSupplier = await db.insert(supplierUsers).values({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        companyName: data.companyName,
        isActive: data.isActive !== false
      }).returning();

      return newSupplier[0];
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  }

  async updateSupplier(id: string, data: any): Promise<any> {
    try {
      const updatedSupplier = await db.update(supplierUsers)
        .set({ 
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          companyName: data.companyName,
          isActive: data.isActive,
          updatedAt: new Date() 
        })
        .where(eq(supplierUsers.id, id))
        .returning();

      return updatedSupplier[0];
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  }

  async deleteSupplier(id: string): Promise<void> {
    try {
      await db.delete(supplierUsers).where(eq(supplierUsers.id, id));
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  }

  async createAirport(data: any): Promise<any> {
    try {
      const newAirport = await db.insert(airports).values({
        code: data.code,
        name: data.name,
        city: data.city,
        country: data.country,
        isActive: data.isActive !== false
      }).returning();

      return newAirport[0];
    } catch (error) {
      console.error('Error creating airport:', error);
      throw error;
    }
  }

  async updateAirport(id: string, data: any): Promise<any> {
    try {
      const updatedAirport = await db.update(airports)
        .set({
          code: data.code,
          name: data.name,
          city: data.city,
          country: data.country,
          isActive: data.isActive
        })
        .where(eq(airports.id, id))
        .returning();

      return updatedAirport[0];
    } catch (error) {
      console.error('Error updating airport:', error);
      throw error;
    }
  }

  async deleteAirport(id: string): Promise<void> {
    try {
      await db.delete(airports).where(eq(airports.id, id));
    } catch (error) {
      console.error('Error deleting airport:', error);
      throw error;
    }
  }
}

// Use mock storage if DATABASE_URL is not set
export const storage = new DatabaseStorage(); // Always use PostgreSQL database
