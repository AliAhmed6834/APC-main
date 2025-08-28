import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  preferredLocale: varchar("preferred_locale", { length: 5 }).default("en-US"), // en-US, en-GB
  preferredCurrency: varchar("preferred_currency", { length: 3 }).default("USD"), // USD, GBP
  detectedCountry: varchar("detected_country", { length: 2 }), // US, GB
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Parking suppliers/providers
export const parkingSuppliers = pgTable("parking_suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  logoUrl: varchar("logo_url"),
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Airport information
export const airports = pgTable("airports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 3 }).notNull().unique(), // LAX, JFK, etc.
  name: varchar("name").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state"),
  country: varchar("country").notNull(),
  countryCode: varchar("country_code", { length: 2 }).default("US"), // US, GB
  timezone: varchar("timezone").default("America/New_York"), // America/Los_Angeles, Europe/London
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Parking lots/facilities
export const parkingLots = pgTable("parking_lots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").references(() => parkingSuppliers.id),
  airportId: varchar("airport_id").references(() => airports.id),
  name: varchar("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  distanceToTerminal: decimal("distance_to_terminal", { precision: 5, scale: 2 }), // in miles
  shuttleFrequencyMinutes: integer("shuttle_frequency_minutes"),
  isShuttleIncluded: boolean("is_shuttle_included").default(true),
  isCovered: boolean("is_covered").default(false),
  hasEvCharging: boolean("has_ev_charging").default(false),
  hasCarWash: boolean("has_car_wash").default(false),
  hasSecurityPatrol: boolean("has_security_patrol").default(false),
  hasCctv: boolean("has_cctv").default(false),
  totalSpaces: integer("total_spaces"),
  imageUrl: varchar("image_url"),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  reviewCount: integer("review_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pricing tiers for parking lots - Multi-currency support
export const parkingPricing = pgTable("parking_pricing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lotId: varchar("lot_id").references(() => parkingLots.id),
  priceType: varchar("price_type").notNull(), // 'daily', 'weekly', 'monthly'
  basePrice: decimal("base_price", { precision: 8, scale: 2 }).notNull(), // USD baseline
  currency: varchar("currency", { length: 3 }).notNull().default("USD"), // USD, GBP, EUR
  localizedPrice: decimal("localized_price", { precision: 8, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).default("0"), // VAT/Sales tax
  region: varchar("region", { length: 2 }).notNull().default("US"), // US, GB, EU
  discountedPrice: decimal("discounted_price", { precision: 8, scale: 2 }),
  validFrom: timestamp("valid_from").defaultNow(),
  validTo: timestamp("valid_to"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User bookings
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  lotId: varchar("lot_id").references(() => parkingLots.id),
  bookingReference: varchar("booking_reference").notNull().unique(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalDays: integer("total_days").notNull(),
  pricePerDay: decimal("price_per_day", { precision: 8, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 8, scale: 2 }).notNull(),
  status: varchar("status").notNull().default('confirmed'), // confirmed, cancelled, completed
  vehicleInfo: jsonb("vehicle_info"), // make, model, color, license plate
  specialRequests: text("special_requests"),
  isCancellable: boolean("is_cancellable").default(true),
  parkingLotDetails: jsonb("parking_lot_details"), // Store complete parking lot information for customer dashboard
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User reviews for parking lots
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  lotId: varchar("lot_id").references(() => parkingLots.id),
  bookingId: varchar("booking_id").references(() => bookings.id),
  rating: integer("rating").notNull(), // 1-5
  title: varchar("title"),
  comment: text("comment"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Exchange rates cache for currency conversion
export const exchangeRates = pgTable("exchange_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  baseCurrency: varchar("base_currency", { length: 3 }).notNull().default("USD"),
  targetCurrency: varchar("target_currency", { length: 3 }).notNull(),
  rate: decimal("rate", { precision: 12, scale: 6 }).notNull(),
  provider: varchar("provider").notNull().default("openexchangerates"), 
  lastUpdated: timestamp("last_updated").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Locale-specific content and translations
export const localeContent = pgTable("locale_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentKey: varchar("content_key").notNull(), // 'parking_lot', 'car_park', etc.
  locale: varchar("locale", { length: 5 }).notNull(), // en-US, en-GB
  content: text("content").notNull(),
  contentType: varchar("content_type").notNull().default("text"), // text, html, json
  category: varchar("category").notNull(), // terminology, legal, marketing
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Supplier users (separate from regular users)
export const supplierUsers = pgTable("supplier_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").references(() => parkingSuppliers.id),
  email: varchar("email").notNull().unique(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  role: varchar("role").notNull().default("manager"), // admin, manager, operator
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Supplier authentication sessions
export const supplierSessions = pgTable("supplier_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierUserId: varchar("supplier_user_id").references(() => supplierUsers.id),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Supplier parking slots/inventory
export const parkingSlots = pgTable("parking_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lotId: varchar("lot_id").references(() => parkingLots.id),
  date: timestamp("date").notNull(), // Date for this slot
  totalSpaces: integer("total_spaces").notNull(),
  availableSpaces: integer("available_spaces").notNull(),
  reservedSpaces: integer("reserved_spaces").default(0),
  pricePerDay: decimal("price_per_day", { precision: 8, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Supplier booking management
export const supplierBookings = pgTable("supplier_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id),
  supplierUserId: varchar("supplier_user_id").references(() => supplierUsers.id),
  status: varchar("status").notNull().default("confirmed"), // confirmed, cancelled, completed, no_show
  notes: text("notes"),
  assignedTo: varchar("assigned_to").references(() => supplierUsers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment Methods Table - Store user payment methods securely
export const paymentMethods = pgTable("payment_methods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  paymentType: varchar("payment_type").notNull(), // 'credit_card', 'paypal', 'apple_pay', 'google_pay'
  lastFour: varchar("last_four", { length: 4 }),
  expiryDate: varchar("expiry_date", { length: 7 }), // MM/YYYY format
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  tokenHash: varchar("token_hash").notNull(), // Encrypted payment method token
  metadata: jsonb("metadata"), // Additional payment method details
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions Table - Track all payment transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id),
  paymentMethodId: varchar("payment_method_id").references(() => paymentMethods.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  status: varchar("status").notNull().default("pending"), // pending, completed, failed, refunded, cancelled
  transactionId: varchar("transaction_id").unique(), // Gateway transaction ID
  gatewayName: varchar("gateway_name").notNull(), // 'stripe', 'paypal'
  gatewayResponse: jsonb("gateway_response"), // Full gateway response
  errorMessage: text("error_message"),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  refundReason: text("refund_reason"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment Gateway Configs - Manage Stripe/PayPal settings
export const paymentGatewayConfigs = pgTable("payment_gateway_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gatewayName: varchar("gateway_name").notNull().unique(), // 'stripe', 'paypal'
  isActive: boolean("is_active").default(true),
  apiKeys: jsonb("api_keys").notNull(), // Encrypted API keys
  webhookUrls: jsonb("webhook_urls"), // Webhook endpoints
  configOptions: jsonb("config_options"), // Gateway-specific settings
  testMode: boolean("test_mode").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email Templates Table - Dynamic email content management
export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateKey: varchar("template_key").notNull(), // 'booking_confirmation', 'welcome', 'password_reset'
  locale: varchar("locale", { length: 5 }).notNull().default("en-US"),
  subject: varchar("subject").notNull(),
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content").notNull(),
  contentType: varchar("content_type").notNull().default("html"), // 'html', 'text', 'markdown'
  category: varchar("category").notNull(), // 'booking', 'authentication', 'marketing'
  version: integer("version").notNull().default(1),
  isActive: boolean("is_active").default(true),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email Logs Table - Track email delivery and engagement
export const emailLogs = pgTable("email_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  templateId: varchar("template_id").references(() => emailTemplates.id),
  recipient: varchar("recipient").notNull(),
  subject: varchar("subject").notNull(),
  status: varchar("status").notNull().default("sent"), // sent, delivered, opened, clicked, failed, bounced
  gatewayResponse: jsonb("gateway_response"), // Email service response
  deliveryStatus: varchar("delivery_status"), // 'delivered', 'bounced', 'spam'
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  sentAt: timestamp("sent_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// SMS Logs Table - Track SMS delivery
export const smsLogs = pgTable("sms_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  phoneNumber: varchar("phone_number").notNull(),
  message: text("message").notNull(),
  status: varchar("status").notNull().default("sent"), // sent, delivered, failed, undelivered
  gatewayResponse: jsonb("gateway_response"), // SMS service response
  deliveryStatus: varchar("delivery_status"), // 'delivered', 'failed', 'pending'
  sentAt: timestamp("sent_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Activity Logs - Track user behavior and engagement
export const userActivityLogs = pgTable("user_activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  activityType: varchar("activity_type").notNull(), // 'search', 'booking', 'payment', 'login', 'page_view'
  pageUrl: varchar("page_url"),
  sessionId: varchar("session_id"),
  deviceInfo: jsonb("device_info"), // Device, browser, OS information
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"), // Additional activity data
  createdAt: timestamp("created_at").defaultNow(),
});

// Search Analytics - Track search behavior and performance
export const searchAnalytics = pgTable("search_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  airportCode: varchar("airport_code", { length: 3 }),
  searchDate: timestamp("search_date").notNull(),
  resultsCount: integer("results_count").notNull(),
  filtersUsed: jsonb("filters_used"), // Applied search filters
  sortOrder: varchar("sort_order"), // 'price', 'distance', 'rating'
  conversionToBooking: boolean("conversion_to_booking").default(false),
  searchDuration: integer("search_duration"), // Time spent on search in milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

// Revenue Analytics - Financial reporting and business intelligence
export const revenueAnalytics = pgTable("revenue_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  totalBookings: integer("total_bookings").notNull().default(0),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  avgOrderValue: decimal("avg_order_value", { precision: 8, scale: 2 }),
  currencyBreakdown: jsonb("currency_breakdown"), // Revenue by currency
  supplierBreakdown: jsonb("supplier_breakdown"), // Revenue by supplier
  regionBreakdown: jsonb("region_breakdown"), // Revenue by region
  createdAt: timestamp("created_at").defaultNow(),
});

// Supplier Performance - Track supplier metrics and performance
export const supplierPerformance = pgTable("supplier_performance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").references(() => parkingSuppliers.id),
  metricDate: timestamp("metric_date").notNull(),
  metricType: varchar("metric_type").notNull(), // 'daily', 'weekly', 'monthly'
  bookingsCount: integer("bookings_count").notNull().default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).notNull().default("0"),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  occupancyRate: decimal("occupancy_rate", { precision: 5, scale: 2 }), // Percentage
  customerSatisfaction: decimal("customer_satisfaction", { precision: 3, scale: 2 }), // 0-10 scale
  createdAt: timestamp("created_at").defaultNow(),
});

// User Preferences - Detailed user settings and preferences
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  preferenceKey: varchar("preference_key").notNull(), // 'notification_email', 'notification_sms', 'privacy_share_data'
  preferenceValue: text("preference_value").notNull(),
  category: varchar("category").notNull(), // 'booking', 'communication', 'privacy', 'display'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Loyalty Program - Rewards and points system
export const userLoyalty = pgTable("user_loyalty", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).unique(),
  pointsBalance: integer("points_balance").notNull().default(0),
  tierLevel: varchar("tier_level").notNull().default("bronze"), // bronze, silver, gold, platinum
  joinDate: timestamp("join_date").defaultNow(),
  pointsEarned: integer("points_earned").notNull().default(0),
  pointsRedeemed: integer("points_redeemed").notNull().default(0),
  tierHistory: jsonb("tier_history"), // History of tier changes
  lastActivity: timestamp("last_activity"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Supplier Contracts - Business agreements and commission tracking
export const supplierContracts = pgTable("supplier_contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").references(() => parkingSuppliers.id),
  contractType: varchar("contract_type").notNull(), // 'standard', 'premium', 'exclusive'
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).notNull(), // 0.05 = 5%
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  contractTerms: jsonb("contract_terms"), // Contract terms and conditions
  paymentSchedule: varchar("payment_schedule").notNull().default("monthly"), // weekly, monthly, quarterly
  status: varchar("status").notNull().default("active"), // active, expired, terminated
  version: integer("version").notNull().default(1),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Supplier Metrics - Detailed performance tracking
export const supplierMetrics = pgTable("supplier_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").references(() => parkingSuppliers.id),
  metricDate: timestamp("metric_date").notNull(),
  metricType: varchar("metric_type").notNull(), // 'booking_conversion_rate', 'customer_satisfaction', 'revenue_per_booking'
  metricValue: decimal("metric_value", { precision: 10, scale: 4 }).notNull(),
  targetValue: decimal("target_value", { precision: 10, scale: 4 }),
  benchmarkValue: decimal("benchmark_value", { precision: 10, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Booking Status History - Track all status changes with audit trail
export const bookingStatusHistory = pgTable("booking_status_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id),
  userId: varchar("user_id").references(() => users.id), // Who made the change
  oldStatus: varchar("old_status"),
  newStatus: varchar("new_status").notNull(),
  reason: text("reason"), // Reason for status change
  metadata: jsonb("metadata"), // Additional change details
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved Searches - User search preferences
export const savedSearches = pgTable("saved_searches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  searchName: varchar("search_name").notNull(),
  searchCriteria: jsonb("search_criteria").notNull(), // Search parameters
  notificationSettings: jsonb("notification_settings"), // Price drop alerts, etc.
  lastUsed: timestamp("last_used"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Search Filters Configuration - Dynamic filter options
export const searchFilters = pgTable("search_filters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filterKey: varchar("filter_key").notNull().unique(), // 'price_range', 'amenities', 'distance'
  filterName: varchar("filter_name").notNull(),
  filterOptions: jsonb("filter_options").notNull(), // Available filter values
  filterCategories: jsonb("filter_categories"), // Filter grouping
  sortOrder: integer("sort_order").default(0),
  defaultValue: text("default_value"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin Users Table - Separate from regular users for admin access
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  role: varchar("role").notNull().default("admin"), // admin, super_admin, support
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  permissions: jsonb("permissions"), // Store admin permissions as JSON
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin Sessions Table - For admin authentication
export const adminSessions = pgTable("admin_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminUserId: varchar("admin_user_id").references(() => adminUsers.id),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin Activity Logs - Track admin actions for audit purposes
export const adminActivityLogs = pgTable("admin_activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminUserId: varchar("admin_user_id").references(() => adminUsers.id),
  actionType: varchar("action_type").notNull(), // create, update, delete, view, export
  tableName: varchar("table_name").notNull(), // Which table was affected
  recordId: varchar("record_id"), // ID of the record that was affected
  oldValues: jsonb("old_values"), // Previous values before change
  newValues: jsonb("new_values"), // New values after change
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"), // Additional context about the action
  createdAt: timestamp("created_at").defaultNow(),
});

// Customer Analytics Table - Store customer metrics for admin dashboard
export const customerAnalytics = pgTable("customer_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => users.id),
  totalBookings: integer("total_bookings").default(0).notNull(),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0.00").notNull(),
  lastBookingDate: timestamp("last_booking_date"),
  averageBookingValue: decimal("average_booking_value", { precision: 8, scale: 2 }),
  favoriteAirport: varchar("favorite_airport", { length: 3 }),
  bookingFrequency: integer("booking_frequency").default(0).notNull(), // Bookings per month
  customerSatisfactionScore: decimal("customer_satisfaction_score", { precision: 3, scale: 2 }), // 0-10 scale
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Supplier Analytics Table - Store supplier metrics for admin dashboard
export const supplierAnalytics = pgTable("supplier_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").references(() => parkingSuppliers.id),
  totalParkingLots: integer("total_parking_lots").default(0).notNull(),
  totalBookings: integer("total_bookings").default(0).notNull(),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0.00").notNull(),
  averageRating: decimal("average_rating", { precision: 2, scale: 1 }).default("0.0").notNull(),
  totalReviews: integer("total_reviews").default(0).notNull(),
  occupancyRate: decimal("occupancy_rate", { precision: 5, scale: 2 }), // Percentage
  customerSatisfactionScore: decimal("customer_satisfaction_score", { precision: 3, scale: 2 }), // 0-10 scale
  responseTimeHours: decimal("response_time_hours", { precision: 5, scale: 2 }), // Average response time
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Airport Analytics Table - Store airport metrics for admin dashboard
export const airportAnalytics = pgTable("airport_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  airportId: varchar("airport_id").references(() => airports.id),
  totalParkingLots: integer("total_parking_lots").default(0).notNull(),
  totalBookings: integer("total_bookings").default(0).notNull(),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0.00").notNull(),
  averageRating: decimal("average_rating", { precision: 2, scale: 1 }).default("0.0").notNull(),
  popularAmenities: jsonb("popular_amenities"), // Most requested amenities
  peakBookingTimes: jsonb("peak_booking_times"), // Peak booking hours/days
  seasonalTrends: jsonb("seasonal_trends"), // Seasonal booking patterns
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment Analytics Table - Store payment metrics for admin dashboard
export const paymentAnalytics = pgTable("payment_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paymentDate: timestamp("payment_date").notNull(),
  totalTransactions: integer("total_transactions").default(0).notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  successfulPayments: integer("successful_payments").default(0).notNull(),
  failedPayments: integer("failed_payments").default(0).notNull(),
  refundedPayments: integer("refunded_payments").default(0).notNull(),
  paymentMethodBreakdown: jsonb("payment_method_breakdown"), // Breakdown by payment method
  gatewayBreakdown: jsonb("gateway_breakdown"), // Breakdown by payment gateway
  currencyBreakdown: jsonb("currency_breakdown"), // Breakdown by currency
  averageTransactionValue: decimal("average_transaction_value", { precision: 8, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Booking Analytics Table - Store booking metrics for admin dashboard
export const bookingAnalytics = pgTable("booking_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingDate: timestamp("booking_date").notNull(),
  totalBookings: integer("total_bookings").default(0).notNull(),
  confirmedBookings: integer("confirmed_bookings").default(0).notNull(),
  cancelledBookings: integer("cancelled_bookings").default(0).notNull(),
  completedBookings: integer("completed_bookings").default(0).notNull(),
  noShowBookings: integer("no_show_bookings").default(0).notNull(),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0.00").notNull(),
  averageBookingDuration: decimal("average_booking_duration", { precision: 5, scale: 2 }), // Average days
  airportBreakdown: jsonb("airport_breakdown"), // Bookings by airport
  supplierBreakdown: jsonb("supplier_breakdown"), // Bookings by supplier
  seasonalPatterns: jsonb("seasonal_patterns"), // Seasonal booking trends
  createdAt: timestamp("created_at").defaultNow(),
});

// System Settings Table - Store admin-configurable system settings
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  settingKey: varchar("setting_key").notNull().unique(),
  settingValue: text("setting_value").notNull(),
  settingType: varchar("setting_type").notNull().default("string"), // string, number, boolean, json
  category: varchar("category").notNull(), // general, payment, email, sms, security
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(), // Whether this setting can be exposed to frontend
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin Notifications Table - Store admin notifications and alerts
export const adminNotifications = pgTable("admin_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminUserId: varchar("admin_user_id").references(() => adminUsers.id),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull().default("info"), // info, warning, error, success
  priority: varchar("priority").notNull().default("normal"), // low, normal, high, urgent
  isRead: boolean("is_read").default(false).notNull(),
  actionRequired: boolean("action_required").default(false).notNull(),
  actionUrl: varchar("action_url"), // URL to navigate to for action
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin Reports Table - Store generated admin reports
export const adminReports = pgTable("admin_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminUserId: varchar("admin_user_id").references(() => adminUsers.id),
  reportName: varchar("report_name").notNull(),
  reportType: varchar("report_type").notNull(), // analytics, financial, operational, custom
  reportFormat: varchar("report_format").notNull().default("json"), // json, csv, pdf, excel
  reportData: jsonb("report_data").notNull(), // The actual report data
  filtersApplied: jsonb("filters_applied"), // Filters that were applied to generate the report
  filePath: varchar("file_path"), // Path to stored report file if exported
  expiresAt: timestamp("expires_at"), // When the report data expires
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const parkingLotRelations = relations(parkingLots, ({ one, many }) => ({
  supplier: one(parkingSuppliers, {
    fields: [parkingLots.supplierId],
    references: [parkingSuppliers.id],
  }),
  airport: one(airports, {
    fields: [parkingLots.airportId],
    references: [airports.id],
  }),
  pricing: many(parkingPricing),
  bookings: many(bookings),
  reviews: many(reviews),
  slots: many(parkingSlots),
}));

export const parkingSupplierRelations = relations(parkingSuppliers, ({ one, many }) => ({
  lots: many(parkingLots),
  users: many(supplierUsers),
}));

export const supplierUserRelations = relations(supplierUsers, ({ one, many }) => ({
  supplier: one(parkingSuppliers, {
    fields: [supplierUsers.supplierId],
    references: [parkingSuppliers.id],
  }),
  sessions: many(supplierSessions),
  managedBookings: many(supplierBookings, { relationName: "managed_by" }),
  assignedBookings: many(supplierBookings, { relationName: "assigned_to" }),
}));

export const parkingSlotRelations = relations(parkingSlots, ({ one }) => ({
  lot: one(parkingLots, {
    fields: [parkingSlots.lotId],
    references: [parkingLots.id],
  }),
}));

export const supplierBookingRelations = relations(supplierBookings, ({ one }) => ({
  booking: one(bookings, {
    fields: [supplierBookings.bookingId],
    references: [bookings.id],
  }),
  supplierUser: one(supplierUsers, {
    fields: [supplierBookings.supplierUserId],
    references: [supplierUsers.id],
  }),
  assignedTo: one(supplierUsers, {
    fields: [supplierBookings.assignedTo],
    references: [supplierUsers.id],
  }),
}));

export const bookingRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  lot: one(parkingLots, {
    fields: [bookings.lotId],
    references: [parkingLots.id],
  }),
}));

export const reviewRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  lot: one(parkingLots, {
    fields: [reviews.lotId],
    references: [parkingLots.id],
  }),
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
}));

// Insert schemas
export const insertAirportSchema = createInsertSchema(airports).omit({
  id: true,
  createdAt: true,
});

export const insertParkingLotSchema = createInsertSchema(parkingLots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  bookingReference: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Insert schemas for supplier operations
export const insertSupplierUserSchema = createInsertSchema(supplierUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertParkingSlotSchema = createInsertSchema(parkingSlots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplierBookingSchema = createInsertSchema(supplierBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertParkingPricingSchema = createInsertSchema(parkingPricing).omit({
  id: true,
  createdAt: true,
});

// Supplier authentication schema
export const supplierLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const supplierSlotManagementSchema = z.object({
  lotId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  totalSpaces: z.number().min(1),
  pricePerDay: z.number().min(0),
  currency: z.string().length(3),
});

export const bulkCreateSlotsSchema = z.object({
  lotId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  totalSpaces: z.number().min(1),
  pricePerDay: z.number().min(0),
  currency: z.string().length(3),
  skipWeekends: z.boolean().optional().default(false),
  skipHolidays: z.boolean().optional().default(false),
  customDates: z.array(z.string()).optional(), // Specific dates to include/exclude
});

// Search schema
export const searchSchema = z.object({
  airportCode: z.string().min(3).max(3),
  startDate: z.string().min(1), // Accept date strings like "2025-02-01"
  endDate: z.string().min(1), // Accept date strings like "2025-02-03"
  sortBy: z.enum(['price', 'distance', 'rating']).optional().default('price'),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  maxDistance: z.number().optional(),
  amenities: z.array(z.string()).optional(),
});

// Locale and geo types
export type LocaleInfo = {
  locale: string;
  currency: string;
  region: string;
  timezone: string;
  dateFormat: string;
  timeFormat: 12 | 24;
  distanceUnit: 'miles' | 'km';
  terminology: Record<string, string>;
};

export type SupportedLocale = 'en-US' | 'en-GB';
export type SupportedCurrency = 'USD' | 'GBP';
export type SupportedRegion = 'US' | 'GB';

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Airport = typeof airports.$inferSelect;
export type InsertAirport = z.infer<typeof insertAirportSchema>;
export type ParkingLot = typeof parkingLots.$inferSelect;
export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type LocaleContent = typeof localeContent.$inferSelect;
export type InsertParkingLot = z.infer<typeof insertParkingLotSchema>;
export type ParkingPricing = typeof parkingPricing.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type SearchParams = z.infer<typeof searchSchema>;

// Supplier types
export type SupplierUser = typeof supplierUsers.$inferSelect;
export type InsertSupplierUser = z.infer<typeof insertSupplierUserSchema>;
export type ParkingSlot = typeof parkingSlots.$inferSelect;
export type InsertParkingSlot = z.infer<typeof insertParkingSlotSchema>;
export type SupplierBooking = typeof supplierBookings.$inferSelect;
export type InsertSupplierBooking = z.infer<typeof insertSupplierBookingSchema>;
export type SupplierLogin = z.infer<typeof supplierLoginSchema>;
export type SupplierSlotManagement = z.infer<typeof supplierSlotManagementSchema>;
export type BulkCreateSlots = z.infer<typeof bulkCreateSlotsSchema>;

// New table types for Stage 1.5
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export type PaymentGatewayConfig = typeof paymentGatewayConfigs.$inferSelect;
export type InsertPaymentGatewayConfig = typeof paymentGatewayConfigs.$inferInsert;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;
export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;
export type SmsLog = typeof smsLogs.$inferSelect;
export type InsertSmsLog = typeof smsLogs.$inferInsert;
export type UserActivityLog = typeof userActivityLogs.$inferSelect;
export type InsertUserActivityLog = typeof userActivityLogs.$inferInsert;
export type SearchAnalytic = typeof searchAnalytics.$inferSelect;
export type InsertSearchAnalytic = typeof searchAnalytics.$inferInsert;
export type RevenueAnalytic = typeof revenueAnalytics.$inferSelect;
export type InsertRevenueAnalytic = typeof revenueAnalytics.$inferInsert;
export type SupplierPerformance = typeof supplierPerformance.$inferSelect;
export type InsertSupplierPerformance = typeof supplierPerformance.$inferInsert;
export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;
export type UserLoyalty = typeof userLoyalty.$inferSelect;
export type InsertUserLoyalty = typeof userLoyalty.$inferInsert;
export type SupplierContract = typeof supplierContracts.$inferSelect;
export type InsertSupplierContract = typeof supplierContracts.$inferInsert;
export type SupplierMetric = typeof supplierMetrics.$inferSelect;
export type InsertSupplierMetric = typeof supplierMetrics.$inferInsert;
export type BookingStatusHistory = typeof bookingStatusHistory.$inferSelect;
export type InsertBookingStatusHistory = typeof bookingStatusHistory.$inferInsert;
export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = typeof savedSearches.$inferInsert;
export type SearchFilter = typeof searchFilters.$inferSelect;
export type InsertSearchFilter = typeof searchFilters.$inferInsert;

// New table types for Admin Dashboard
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;
export type AdminSession = typeof adminSessions.$inferSelect;
export type InsertAdminSession = typeof adminSessions.$inferInsert;
export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;
export type InsertAdminActivityLog = typeof adminActivityLogs.$inferInsert;
export type CustomerAnalytic = typeof customerAnalytics.$inferSelect;
export type InsertCustomerAnalytic = typeof customerAnalytics.$inferInsert;
export type SupplierAnalytic = typeof supplierAnalytics.$inferSelect;
export type InsertSupplierAnalytic = typeof supplierAnalytics.$inferInsert;
export type AirportAnalytic = typeof airportAnalytics.$inferSelect;
export type InsertAirportAnalytic = typeof airportAnalytics.$inferInsert;
export type PaymentAnalytic = typeof paymentAnalytics.$inferSelect;
export type InsertPaymentAnalytic = typeof paymentAnalytics.$inferInsert;
export type BookingAnalytic = typeof bookingAnalytics.$inferSelect;
export type InsertBookingAnalytic = typeof bookingAnalytics.$inferInsert;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;
export type AdminNotification = typeof adminNotifications.$inferSelect;
export type InsertAdminNotification = typeof adminNotifications.$inferInsert;
export type AdminReport = typeof adminReports.$inferSelect;
export type InsertAdminReport = typeof adminReports.$inferInsert;
