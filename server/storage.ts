import {
  users,
  airports,
  parkingLots,
  parkingPricing,
  bookings,
  reviews,
  supplierUsers,
  supplierSessions,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, like, desc, asc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Airport operations
  getAirports(): Promise<Airport[]>;
  getAirportByCode(code: string): Promise<Airport | undefined>;
  createAirport(airport: InsertAirport): Promise<Airport>;
  
  // Parking lot operations
  searchParkingLots(params: SearchParams): Promise<ParkingLot[]>;
  getParkingLot(id: string): Promise<ParkingLot | undefined>;
  getParkingLotsByAirport(airportId: string): Promise<ParkingLot[]>;
  createParkingLot(lot: InsertParkingLot): Promise<ParkingLot>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getUserBookings(userId: string): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  
  // Pricing operations
  getParkingPricing(lotId: string, currency: string, region: string): Promise<any | undefined>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getLotReviews(lotId: string): Promise<Review[]>;
  getUserReviews(userId: string): Promise<Review[]>;
  
  // Supplier operations
  getSupplierUserByEmail(email: string): Promise<any | undefined>;
  createSupplierUser(userData: any): Promise<any>;
  createSupplierSession(sessionData: any): Promise<any>;
  getSupplierSession(sessionToken: string): Promise<any | undefined>;
  deleteSupplierSession(sessionToken: string): Promise<void>;
  updateSupplierUser(userId: string, data: any): Promise<any>;
  
  // Parking lot operations for suppliers
  getSupplierParkingLots(supplierId: string): Promise<any[]>;
  createSupplierParkingLot(lotData: any): Promise<any>;
  updateSupplierParkingLot(id: string, lotData: any): Promise<any>;
  deleteSupplierParkingLot(id: string): Promise<void>;
  getSupplierParkingLot(id: string): Promise<any | undefined>;
  
  // Airport operations
  getAirports(): Promise<any[]>;
}

// Mock data for development
const mockAirports: Airport[] = [
  {
    id: "1",
    code: "LAX",
    name: "Los Angeles International Airport",
    city: "Los Angeles",
    state: "CA",
    country: "United States",
    countryCode: "US",
    timezone: "America/Los_Angeles",
    latitude: "33.9416",
    longitude: "-118.4085",
    createdAt: new Date(),
  },
  {
    id: "2",
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    state: "NY",
    country: "United States",
    countryCode: "US",
    timezone: "America/New_York",
    latitude: "40.6413",
    longitude: "-73.7781",
    createdAt: new Date(),
  },
  {
    id: "3",
    code: "LHR",
    name: "London Heathrow Airport",
    city: "London",
    state: "",
    country: "United Kingdom",
    countryCode: "GB",
    timezone: "Europe/London",
    latitude: "51.4700",
    longitude: "-0.4543",
    createdAt: new Date(),
  },
  {
    id: "4",
    code: "LGW",
    name: "London Gatwick Airport",
    city: "London",
    state: "",
    country: "United Kingdom",
    countryCode: "GB",
    timezone: "Europe/London",
    latitude: "51.1537",
    longitude: "-0.1821",
    createdAt: new Date(),
  },
  {
    id: "5",
    code: "MAN",
    name: "Manchester Airport",
    city: "Manchester",
    state: "",
    country: "United Kingdom",
    countryCode: "GB",
    timezone: "Europe/London",
    latitude: "53.3537",
    longitude: "-2.2750",
    createdAt: new Date(),
  },
  {
    id: "6",
    code: "BHX",
    name: "Birmingham Airport",
    city: "Birmingham",
    state: "",
    country: "United Kingdom",
    countryCode: "GB",
    timezone: "Europe/London",
    latitude: "52.4539",
    longitude: "-1.7480",
    createdAt: new Date(),
  },
  {
    id: "7",
    code: "EDI",
    name: "Edinburgh Airport",
    city: "Edinburgh",
    state: "",
    country: "United Kingdom",
    countryCode: "GB",
    timezone: "Europe/London",
    latitude: "55.9500",
    longitude: "-3.3725",
    createdAt: new Date(),
  },
  {
    id: "8",
    code: "GLA",
    name: "Glasgow International Airport",
    city: "Glasgow",
    state: "",
    country: "United Kingdom",
    countryCode: "GB",
    timezone: "Europe/London",
    latitude: "55.8659",
    longitude: "-4.4333",
    createdAt: new Date(),
  },
];

const mockParkingLots: ParkingLot[] = [
  {
    id: "1",
    supplierId: "supplier1",
    airportId: "1",
    name: "LAX Premium Parking",
    description: "Covered parking with shuttle service",
    address: "123 Airport Blvd, Los Angeles, CA 90210",
    latitude: "33.9416",
    longitude: "-118.4085",
    distanceToTerminal: "0.5",
    shuttleFrequencyMinutes: 10,
    isShuttleIncluded: true,
    isCovered: true,
    hasEvCharging: true,
    hasCarWash: false,
    hasSecurityPatrol: true,
    hasCctv: true,
    totalSpaces: 500,
    imageUrl: "/images/premium-parking.jpg",
    rating: "4.8",
    reviewCount: 1250,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    supplierId: "supplier2",
    airportId: "1",
    name: "LAX Economy Parking",
    description: "Affordable uncovered parking",
    address: "456 Airport Way, Los Angeles, CA 90210",
    latitude: "33.9416",
    longitude: "-118.4085",
    distanceToTerminal: "1.2",
    shuttleFrequencyMinutes: 15,
    isShuttleIncluded: true,
    isCovered: false,
    hasEvCharging: false,
    hasCarWash: false,
    hasSecurityPatrol: true,
    hasCctv: true,
    totalSpaces: 800,
    imageUrl: "/images/economy-parking.jpg",
    rating: "4.2",
    reviewCount: 890,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    supplierId: "supplier3",
    airportId: "3",
    name: "LHR Terminal 5 Car Park",
    description: "Official Heathrow parking with direct terminal access",
    address: "Heathrow Airport, London, UK",
    latitude: "51.4700",
    longitude: "-0.4543",
    distanceToTerminal: "0.3",
    shuttleFrequencyMinutes: 5,
    isShuttleIncluded: true,
    isCovered: true,
    hasEvCharging: true,
    hasCarWash: true,
    hasSecurityPatrol: true,
    hasCctv: true,
    totalSpaces: 300,
    imageUrl: "/images/lhr-parking.jpg",
    rating: "4.6",
    reviewCount: 650,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    supplierId: "supplier4",
    airportId: "3",
    name: "LHR Meet & Greet Service",
    description: "Premium meet & greet service - your car is collected at terminal",
    address: "Heathrow Airport, London, UK",
    latitude: "51.4700",
    longitude: "-0.4543",
    distanceToTerminal: "0.0",
    shuttleFrequencyMinutes: 0,
    isShuttleIncluded: false,
    isCovered: true,
    hasEvCharging: true,
    hasCarWash: true,
    hasSecurityPatrol: true,
    hasCctv: true,
    totalSpaces: 150,
    imageUrl: "/images/meet-greet.jpg",
    rating: "4.9",
    reviewCount: 320,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    supplierId: "supplier5",
    airportId: "4",
    name: "Gatwick South Terminal Parking",
    description: "Official Gatwick parking with 24/7 shuttle service",
    address: "Gatwick Airport, London, UK",
    latitude: "51.1537",
    longitude: "-0.1821",
    distanceToTerminal: "0.4",
    shuttleFrequencyMinutes: 8,
    isShuttleIncluded: true,
    isCovered: true,
    hasEvCharging: true,
    hasCarWash: false,
    hasSecurityPatrol: true,
    hasCctv: true,
    totalSpaces: 400,
    imageUrl: "/images/gatwick-parking.jpg",
    rating: "4.5",
    reviewCount: 520,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    supplierId: "supplier6",
    airportId: "5",
    name: "Manchester Airport Multi-Storey",
    description: "Covered multi-storey parking with direct terminal access",
    address: "Manchester Airport, Manchester, UK",
    latitude: "53.3537",
    longitude: "-2.2750",
    distanceToTerminal: "0.2",
    shuttleFrequencyMinutes: 0,
    isShuttleIncluded: false,
    isCovered: true,
    hasEvCharging: true,
    hasCarWash: false,
    hasSecurityPatrol: true,
    hasCctv: true,
    totalSpaces: 600,
    imageUrl: "/images/manchester-parking.jpg",
    rating: "4.4",
    reviewCount: 780,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "7",
    supplierId: "supplier7",
    airportId: "6",
    name: "Birmingham Airport Car Park 1",
    description: "Official Birmingham airport parking with shuttle service",
    address: "Birmingham Airport, Birmingham, UK",
    latitude: "52.4539",
    longitude: "-1.7480",
    distanceToTerminal: "0.6",
    shuttleFrequencyMinutes: 12,
    isShuttleIncluded: true,
    isCovered: false,
    hasEvCharging: false,
    hasCarWash: false,
    hasSecurityPatrol: true,
    hasCctv: true,
    totalSpaces: 350,
    imageUrl: "/images/birmingham-parking.jpg",
    rating: "4.3",
    reviewCount: 420,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "8",
    supplierId: "supplier8",
    airportId: "7",
    name: "Edinburgh Airport Long Stay",
    description: "Economical long-stay parking with regular shuttle",
    address: "Edinburgh Airport, Edinburgh, UK",
    latitude: "55.9500",
    longitude: "-3.3725",
    distanceToTerminal: "1.8",
    shuttleFrequencyMinutes: 20,
    isShuttleIncluded: true,
    isCovered: false,
    hasEvCharging: false,
    hasCarWash: false,
    hasSecurityPatrol: true,
    hasCctv: true,
    totalSpaces: 250,
    imageUrl: "/images/edinburgh-parking.jpg",
    rating: "4.1",
    reviewCount: 310,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export class MockStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return {
      id,
      email: "user@example.com",
      firstName: "John",
      lastName: "Doe",
      profileImageUrl: "",
      preferredLocale: "en-US",
      preferredCurrency: "USD",
      detectedCountry: "US",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return {
      id: userData.id || "user123",
      email: userData.email || "user@example.com",
      firstName: userData.firstName || "John",
      lastName: userData.lastName || "Doe",
      profileImageUrl: userData.profileImageUrl || "",
      preferredLocale: userData.preferredLocale || "en-US",
      preferredCurrency: userData.preferredCurrency || "USD",
      detectedCountry: userData.detectedCountry || "US",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Airport operations
  async getAirports(): Promise<Airport[]> {
    return mockAirports;
  }

  async getAirportByCode(code: string): Promise<Airport | undefined> {
    return mockAirports.find(airport => airport.code === code.toUpperCase());
  }

  async createAirport(airportData: InsertAirport): Promise<Airport> {
    const airport: Airport = {
      id: `airport_${Date.now()}`,
      ...airportData,
      state: airportData.state || null,
      countryCode: airportData.countryCode || null,
      timezone: airportData.timezone || null,
      latitude: airportData.latitude || null,
      longitude: airportData.longitude || null,
      createdAt: new Date(),
    };
    return airport;
  }

  // Parking lot operations
  async searchParkingLots(params: SearchParams): Promise<ParkingLot[]> {
    const airport = await this.getAirportByCode(params.airportCode);
    if (!airport) {
      return [];
    }

    return mockParkingLots.filter(lot => lot.airportId === airport.id);
  }

  async getParkingLot(id: string): Promise<ParkingLot | undefined> {
    return mockParkingLots.find(lot => lot.id === id);
  }

  async getParkingLotsByAirport(airportId: string): Promise<ParkingLot[]> {
    return mockParkingLots.filter(lot => lot.airportId === airportId);
  }

  async createParkingLot(lotData: InsertParkingLot): Promise<ParkingLot> {
    const lot: ParkingLot = {
      id: `lot_${Date.now()}`,
      ...lotData,
      description: lotData.description || null,
      supplierId: lotData.supplierId || null,
      airportId: lotData.airportId || null,
      latitude: lotData.latitude || null,
      longitude: lotData.longitude || null,
      distanceToTerminal: lotData.distanceToTerminal || null,
      shuttleFrequencyMinutes: lotData.shuttleFrequencyMinutes || null,
      totalSpaces: lotData.totalSpaces || null,
      imageUrl: lotData.imageUrl || null,
      rating: lotData.rating || null,
      reviewCount: lotData.reviewCount || null,
      isActive: lotData.isActive ?? true,
      isShuttleIncluded: lotData.isShuttleIncluded ?? true,
      isCovered: lotData.isCovered ?? false,
      hasEvCharging: lotData.hasEvCharging ?? false,
      hasCarWash: lotData.hasCarWash ?? false,
      hasSecurityPatrol: lotData.hasSecurityPatrol ?? false,
      hasCctv: lotData.hasCctv ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return lot;
  }

  // Booking operations
  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const booking: Booking = {
      id: `booking_${Date.now()}`,
      bookingReference: `PK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      ...bookingData,
      lotId: bookingData.lotId || null,
      userId: bookingData.userId || null,
      vehicleInfo: bookingData.vehicleInfo || null,
      specialRequests: bookingData.specialRequests || null,
      isCancellable: bookingData.isCancellable ?? true,
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return booking;
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return [];
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return undefined;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    return undefined;
  }

  // Pricing operations
  async getParkingPricing(lotId: string, currency: string, region: string): Promise<any | undefined> {
    const basePrice = currency === 'GBP' ? 15.99 : 19.99;
    return {
      id: `pricing_${lotId}`,
      lotId,
      priceType: 'daily',
      basePrice: basePrice.toString(),
      currency,
      localizedPrice: basePrice.toString(),
      taxRate: region === 'GB' ? '0.20' : '0.08',
      region,
      isActive: true,
      createdAt: new Date(),
    };
  }

  // Review operations
  async createReview(reviewData: InsertReview): Promise<Review> {
    const review: Review = {
      id: `review_${Date.now()}`,
      ...reviewData,
      title: reviewData.title || null,
      lotId: reviewData.lotId || null,
      userId: reviewData.userId || null,
      bookingId: reviewData.bookingId || null,
      comment: reviewData.comment || null,
      isVerified: false,
      createdAt: new Date(),
    };
    return review;
  }

  async getLotReviews(lotId: string): Promise<Review[]> {
    return [];
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return [];
  }

  // Supplier operations
  private static mockSupplierUsers: any[] = [];
  private static mockSupplierSessions: any[] = [];

  // Method to clear mock storage for testing
  static clearMockStorage() {
    MockStorage.mockSupplierUsers = [];
    MockStorage.mockSupplierSessions = [];
    console.log('Mock storage cleared');
  }

  async getSupplierUserByEmail(email: string): Promise<any | undefined> {
    return MockStorage.mockSupplierUsers.find((user: any) => user.email === email);
  }

  async createSupplierUser(userData: any): Promise<any> {
    const user = {
      id: `supplier_user_${Date.now()}`,
      ...userData,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    MockStorage.mockSupplierUsers.push(user);
    console.log('Created supplier user:', user.email);
    console.log('User data:', { ...user, password: '[HIDDEN]' });
    console.log('Total users in mock storage:', MockStorage.mockSupplierUsers.length);
    return user;
  }

  async createSupplierSession(sessionData: any): Promise<any> {
    const session = {
      id: `session_${Date.now()}`,
      ...sessionData,
      createdAt: new Date(),
    };
    MockStorage.mockSupplierSessions.push(session);
    return session;
  }

  async getSupplierSession(sessionToken: string): Promise<any | undefined> {
    return MockStorage.mockSupplierSessions.find((session: any) => session.sessionToken === sessionToken);
  }

  async deleteSupplierSession(sessionToken: string): Promise<void> {
    const index = MockStorage.mockSupplierSessions.findIndex((session: any) => session.sessionToken === sessionToken);
    if (index > -1) {
      MockStorage.mockSupplierSessions.splice(index, 1);
    }
  }

  async updateSupplierUser(userId: string, data: any): Promise<any> {
    const index = MockStorage.mockSupplierUsers.findIndex((user: any) => user.id === userId);
    if (index > -1) {
      MockStorage.mockSupplierUsers[index] = { ...MockStorage.mockSupplierUsers[index], ...data, updatedAt: new Date() };
      return MockStorage.mockSupplierUsers[index];
    }
    return null;
  }

  // Parking lot operations for suppliers
  private static mockParkingLots: any[] = [];
  private static mockAirports: any[] = [
    {
      id: 'airport_1',
      code: 'LAX',
      name: 'Los Angeles International Airport',
      city: 'Los Angeles',
      country: 'United States',
      countryCode: 'US',
      timezone: 'America/Los_Angeles',
      latitude: 33.9416,
      longitude: -118.4085,
      createdAt: new Date(),
    },
    {
      id: 'airport_2',
      code: 'JFK',
      name: 'John F. Kennedy International Airport',
      city: 'New York',
      country: 'United States',
      countryCode: 'US',
      timezone: 'America/New_York',
      latitude: 40.6413,
      longitude: -73.7781,
      createdAt: new Date(),
    },
    {
      id: 'airport_3',
      code: 'LHR',
      name: 'London Heathrow Airport',
      city: 'London',
      country: 'United Kingdom',
      countryCode: 'GB',
      timezone: 'Europe/London',
      latitude: 51.4700,
      longitude: -0.4543,
      createdAt: new Date(),
    },
  ];

  async getSupplierParkingLots(supplierId: string): Promise<any[]> {
    return MockStorage.mockParkingLots.filter((lot: any) => lot.supplierId === supplierId);
  }

  async createSupplierParkingLot(lotData: any): Promise<any> {
    const lot = {
      id: `parking_lot_${Date.now()}`,
      ...lotData,
      rating: null,
      reviewCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    MockStorage.mockParkingLots.push(lot);
    console.log('Created parking lot:', lot.name);
    return lot;
  }

  async updateSupplierParkingLot(id: string, lotData: any): Promise<any> {
    const index = MockStorage.mockParkingLots.findIndex((lot: any) => lot.id === id);
    if (index > -1) {
      MockStorage.mockParkingLots[index] = { 
        ...MockStorage.mockParkingLots[index], 
        ...lotData, 
        updatedAt: new Date() 
      };
      return MockStorage.mockParkingLots[index];
    }
    return null;
  }

  async deleteSupplierParkingLot(id: string): Promise<void> {
    const index = MockStorage.mockParkingLots.findIndex((lot: any) => lot.id === id);
    if (index > -1) {
      MockStorage.mockParkingLots.splice(index, 1);
    }
  }

  async getSupplierParkingLot(id: string): Promise<any | undefined> {
    return MockStorage.mockParkingLots.find((lot: any) => lot.id === id);
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Airport operations
  async getAirports(): Promise<Airport[]> {
    return await db.select().from(airports).orderBy(asc(airports.name));
  }

  async getAirportByCode(code: string): Promise<Airport | undefined> {
    const [airport] = await db.select().from(airports).where(eq(airports.code, code.toUpperCase()));
    return airport;
  }

  async createAirport(airportData: InsertAirport): Promise<Airport> {
    const airport: Airport = {
      id: `airport_${Date.now()}`,
      ...airportData,
      state: airportData.state || null,
      countryCode: airportData.countryCode || null,
      timezone: airportData.timezone || null,
      latitude: airportData.latitude || null,
      longitude: airportData.longitude || null,
      createdAt: new Date(),
    };
    return airport;
  }

  // Parking lot operations
  async searchParkingLots(params: SearchParams): Promise<ParkingLot[]> {
    const airport = await this.getAirportByCode(params.airportCode);
    if (!airport) {
      return [];
    }

    let query = db
      .select()
      .from(parkingLots)
      .where(
        and(
          eq(parkingLots.airportId, airport.id),
          eq(parkingLots.isActive, true)
        )
      );

    // Apply filters
    const conditions = [
      eq(parkingLots.airportId, airport.id),
      eq(parkingLots.isActive, true)
    ];

    if (params.maxDistance) {
      conditions.push(lte(parkingLots.distanceToTerminal, params.maxDistance.toString()));
    }

    // Apply sorting
    switch (params.sortBy) {
      case 'distance':
        return await db
          .select()
          .from(parkingLots)
          .where(and(...conditions))
          .orderBy(asc(parkingLots.distanceToTerminal));
      case 'rating':
        return await db
          .select()
          .from(parkingLots)
          .where(and(...conditions))
          .orderBy(desc(parkingLots.rating));
      case 'price':
      default:
        // For price sorting, we'd need to join with pricing table
        return await db
          .select()
          .from(parkingLots)
          .where(and(...conditions))
          .orderBy(asc(parkingLots.name));
    }
  }

  async getParkingLot(id: string): Promise<ParkingLot | undefined> {
    const [lot] = await db.select().from(parkingLots).where(eq(parkingLots.id, id));
    return lot;
  }

  async getParkingLotsByAirport(airportId: string): Promise<ParkingLot[]> {
    return await db
      .select()
      .from(parkingLots)
      .where(
        and(
          eq(parkingLots.airportId, airportId),
          eq(parkingLots.isActive, true)
        )
      )
      .orderBy(asc(parkingLots.distanceToTerminal));
  }

  async createParkingLot(lotData: InsertParkingLot): Promise<ParkingLot> {
    const lot: ParkingLot = {
      id: `lot_${Date.now()}`,
      ...lotData,
      description: lotData.description || null,
      supplierId: lotData.supplierId || null,
      airportId: lotData.airportId || null,
      latitude: lotData.latitude || null,
      longitude: lotData.longitude || null,
      distanceToTerminal: lotData.distanceToTerminal || null,
      shuttleFrequencyMinutes: lotData.shuttleFrequencyMinutes || null,
      totalSpaces: lotData.totalSpaces || null,
      imageUrl: lotData.imageUrl || null,
      rating: lotData.rating || null,
      reviewCount: lotData.reviewCount || null,
      isActive: lotData.isActive ?? true,
      isShuttleIncluded: lotData.isShuttleIncluded ?? true,
      isCovered: lotData.isCovered ?? false,
      hasEvCharging: lotData.hasEvCharging ?? false,
      hasCarWash: lotData.hasCarWash ?? false,
      hasSecurityPatrol: lotData.hasSecurityPatrol ?? false,
      hasCctv: lotData.hasCctv ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return lot;
  }

  // Booking operations
  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const bookingReference = `PK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const [booking] = await db
      .insert(bookings)
      .values({
        ...bookingData,
        bookingReference,
      })
      .returning();
    return booking;
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  // Pricing operations
  async getParkingPricing(lotId: string, currency: string, region: string): Promise<any | undefined> {
    const [pricing] = await db
      .select()
      .from(parkingPricing)
      .where(
        and(
          eq(parkingPricing.lotId, lotId),
          eq(parkingPricing.currency, currency),
          eq(parkingPricing.region, region),
          eq(parkingPricing.isActive, true)
        )
      )
      .limit(1);
    return pricing;
  }

  // Review operations
  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(reviewData).returning();
    
    // Update lot rating
    const avgRating = await db
      .select({ avg: sql<number>`AVG(${reviews.rating})` })
      .from(reviews)
      .where(eq(reviews.lotId, reviewData.lotId!))
      .then((result: any) => result[0]?.avg || 0);

    const reviewCount = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(reviews)
      .where(eq(reviews.lotId, reviewData.lotId!))
      .then((result: any) => result[0]?.count || 0);

    await db
      .update(parkingLots)
      .set({ 
        rating: (Math.round(avgRating * 10) / 10).toString(), // Round to 1 decimal and convert to string
        reviewCount: reviewCount
      })
      .where(eq(parkingLots.id, reviewData.lotId!));

    return review;
  }

  async getLotReviews(lotId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.lotId, lotId))
      .orderBy(desc(reviews.createdAt));
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  // Supplier operations
  async getSupplierUserByEmail(email: string): Promise<any | undefined> {
    const [user] = await db
      .select()
      .from(supplierUsers)
      .where(eq(supplierUsers.email, email))
      .limit(1);
    return user;
  }

  // Parking lot operations for suppliers
  async getSupplierParkingLots(supplierId: string): Promise<any[]> {
    return await db
      .select()
      .from(parkingLots)
      .where(eq(parkingLots.supplierId, supplierId))
      .orderBy(desc(parkingLots.createdAt));
  }

  async createSupplierParkingLot(lotData: any): Promise<any> {
    const [lot] = await db
      .insert(parkingLots)
      .values(lotData)
      .returning();
    return lot;
  }

  async updateSupplierParkingLot(id: string, lotData: any): Promise<any> {
    const [lot] = await db
      .update(parkingLots)
      .set({ ...lotData, updatedAt: new Date() })
      .where(eq(parkingLots.id, id))
      .returning();
    return lot;
  }

  async deleteSupplierParkingLot(id: string): Promise<void> {
    await db
      .delete(parkingLots)
      .where(eq(parkingLots.id, id));
  }

  async getSupplierParkingLot(id: string): Promise<any | undefined> {
    const [lot] = await db
      .select()
      .from(parkingLots)
      .where(eq(parkingLots.id, id))
      .limit(1);
    return lot;
  }

  async createSupplierUser(userData: any): Promise<any> {
    const [user] = await db
      .insert(supplierUsers)
      .values(userData)
      .returning();
    return user;
  }

  async createSupplierSession(sessionData: any): Promise<any> {
    const [session] = await db
      .insert(supplierSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async getSupplierSession(sessionToken: string): Promise<any | undefined> {
    const [session] = await db
      .select()
      .from(supplierSessions)
      .where(eq(supplierSessions.sessionToken, sessionToken))
      .limit(1);
    return session;
  }

  async deleteSupplierSession(sessionToken: string): Promise<void> {
    await db
      .delete(supplierSessions)
      .where(eq(supplierSessions.sessionToken, sessionToken));
  }

  async updateSupplierUser(userId: string, data: any): Promise<any> {
    const [user] = await db
      .update(supplierUsers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(supplierUsers.id, userId))
      .returning();
    return user;
  }
}

// Use mock storage if DATABASE_URL is not set
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MockStorage();
