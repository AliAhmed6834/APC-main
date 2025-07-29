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
