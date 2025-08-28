import { db } from './server/db';
import { reviews } from './shared/schema';

const mockReviews = [
  {
    id: "review_1",
    userId: null,
    lotId: "1", // LHR Terminal 5 Official
    bookingId: "booking_1",
    rating: 5,
    title: "Excellent service and convenience",
    comment: "Perfect location right at Terminal 5. Shuttle service was prompt and the staff were very helpful. Will definitely use again!",
    isVerified: true,
    createdAt: new Date("2025-01-18T15:30:00Z"),
  },
  {
    id: "review_2",
    userId: null,
    lotId: "3", // LHR Meet & Greet Premium
    bookingId: "booking_2",
    rating: 5,
    title: "Premium service worth every penny",
    comment: "The meet & greet service was flawless. Car was collected and returned exactly as promised. Very professional and convenient.",
    isVerified: true,
    createdAt: new Date("2025-01-22T17:00:00Z"),
  },
  {
    id: "review_3",
    userId: null,
    lotId: "5", // LHR Economy Parking
    bookingId: "booking_3",
    rating: 4,
    title: "Great value for money",
    comment: "Good value parking option. Shuttle service was reliable, though it took a bit longer than expected. Staff were friendly.",
    isVerified: true,
    createdAt: new Date("2025-02-01T11:00:00Z"),
  },
  {
    id: "review_4",
    userId: null,
    lotId: "7", // LHR Valet Parking Premium
    bookingId: "booking_4",
    rating: 5,
    title: "Luxury experience",
    comment: "Absolutely fantastic valet service. Car was spotless when returned and the concierge service was exceptional. Highly recommend!",
    isVerified: true,
    createdAt: new Date("2025-01-30T21:00:00Z"),
  },
  {
    id: "review_5",
    userId: null,
    lotId: "14", // LAX Official Parking Structure
    bookingId: "booking_5",
    rating: 4,
    title: "Convenient and secure",
    comment: "Very convenient location with direct terminal access. Parking structure was clean and well-lit. Good value for the location.",
    isVerified: true,
    createdAt: new Date("2025-02-02T19:00:00Z"),
  },
  {
    id: "review_6",
    userId: null,
    lotId: "16", // LAX Valet Parking Premium
    bookingId: "booking_6",
    rating: 5,
    title: "Outstanding valet service",
    comment: "Best valet parking experience I've had. Staff were professional, car was immaculate, and the EV charging worked perfectly.",
    isVerified: true,
    createdAt: new Date("2025-02-07T16:00:00Z"),
  },
  {
    id: "review_7",
    userId: "user_7",
    lotId: "11", // Gatwick South Terminal
    bookingId: "booking_7",
    rating: 4,
    title: "Reliable service",
    comment: "Good parking facility with regular shuttle service. Staff were helpful and the location was easy to find.",
    isVerified: true,
    createdAt: new Date("2025-02-12T20:00:00Z"),
  },
  {
    id: "review_8",
    userId: "user_8",
    lotId: "12", // Manchester Multi-Storey
    bookingId: "booking_8",
    rating: 4,
    title: "Convenient multi-storey parking",
    comment: "Easy to access and well-maintained multi-storey car park. Direct terminal access was a big plus.",
    isVerified: true,
    createdAt: new Date("2025-02-17T17:30:00Z"),
  },
  {
    id: "review_9",
    userId: null,
    lotId: "15", // LAX Economy Parking
    bookingId: "booking_9",
    rating: 3,
    title: "Budget-friendly option",
    comment: "Good value for the price. Shuttle service was functional but could be more frequent. Overall satisfied for the cost.",
    isVerified: true,
    createdAt: new Date("2025-02-25T15:00:00Z"),
  },
  {
    id: "review_10",
    userId: null,
    lotId: "8", // LHR Business Parking
    bookingId: "booking_10",
    rating: 5,
    title: "Perfect for business travel",
    comment: "Excellent business parking option. Fast access, covered parking, and professional service. Ideal for frequent travelers.",
    isVerified: true,
    createdAt: new Date("2025-02-27T19:00:00Z"),
  },
  // Additional reviews for variety
  {
    id: "review_11",
    userId: "user_11",
    lotId: "1", // LHR Terminal 5 Official
    bookingId: null,
    rating: 4,
    title: "Good experience overall",
    comment: "Parking was clean and well-organized. Shuttle service was on time. Would recommend for Terminal 5 travelers.",
    isVerified: false,
    createdAt: new Date("2025-01-20T12:00:00Z"),
  },
  {
    id: "review_12",
    userId: "user_12",
    lotId: "2", // LHR Terminal 2&3 Official
    bookingId: null,
    rating: 4,
    title: "Convenient for Terminal 2",
    comment: "Easy to find and good shuttle frequency. Staff were helpful with directions.",
    isVerified: false,
    createdAt: new Date("2025-01-22T14:30:00Z"),
  },
  {
    id: "review_13",
    userId: "user_13",
    lotId: "4", // LHR Park & Fly Express
    bookingId: null,
    rating: 4,
    title: "Fast and efficient",
    comment: "Quick shuttle service and good value. Covered parking was a nice bonus.",
    isVerified: false,
    createdAt: new Date("2025-01-25T16:00:00Z"),
  },
  {
    id: "review_14",
    userId: "user_14",
    lotId: "6", // LHR Long Stay Parking
    bookingId: null,
    rating: 3,
    title: "Basic but functional",
    comment: "Basic long-stay parking. Shuttle service was reliable but infrequent. Good for extended trips.",
    isVerified: false,
    createdAt: new Date("2025-01-28T10:00:00Z"),
  },
  {
    id: "review_15",
    userId: "user_15",
    lotId: "9", // LHR Quick Park Express
    bookingId: null,
    rating: 4,
    title: "Quick and convenient",
    comment: "Fast shuttle service as advertised. Good value for the convenience level.",
    isVerified: false,
    createdAt: new Date("2025-02-01T13:00:00Z"),
  },
  {
    id: "review_16",
    userId: "user_16",
    lotId: "10", // LHR Quick Park Budget
    bookingId: null,
    rating: 3,
    title: "Budget-friendly option",
    comment: "Cheap parking option. Shuttle service was adequate but not frequent. Good for budget-conscious travelers.",
    isVerified: false,
    createdAt: new Date("2025-02-03T11:30:00Z"),
  },
  {
    id: "review_17",
    userId: "user_17",
    lotId: "13", // Birmingham Car Park
    bookingId: null,
    rating: 4,
    title: "Good Birmingham option",
    comment: "Convenient parking for Birmingham Airport. Shuttle service was reliable.",
    isVerified: false,
    createdAt: new Date("2025-02-05T15:00:00Z"),
  },
  {
    id: "review_18",
    userId: "user_18",
    lotId: "17", // LAX Long Term Parking
    bookingId: null,
    rating: 3,
    title: "Economical long-term option",
    comment: "Good value for long-term parking. Shuttle service was functional but could be more frequent.",
    isVerified: false,
    createdAt: new Date("2025-02-08T12:00:00Z"),
  },
  {
    id: "review_19",
    userId: "user_19",
    lotId: "18", // LAX Quick Park Express
    bookingId: null,
    rating: 4,
    title: "Express service delivered",
    comment: "Quick shuttle service as promised. Good value for the convenience.",
    isVerified: false,
    createdAt: new Date("2025-02-10T14:30:00Z"),
  },
  {
    id: "review_20",
    userId: "user_20",
    lotId: "3", // LHR Meet & Greet Premium
    bookingId: null,
    rating: 5,
    title: "Exceptional service",
    comment: "Absolutely outstanding meet & greet service. Staff were professional and the whole experience was seamless.",
    isVerified: false,
    createdAt: new Date("2025-02-12T18:00:00Z"),
  },
];

async function insertSampleReviews() {
  try {
    console.log('Inserting sample reviews...');
    
    for (const review of mockReviews) {
      await db.insert(reviews).values(review);
      console.log(`Inserted review: ${review.rating}/5 stars for lot ${review.lotId} - "${review.title}"`);
    }
    
    console.log('✅ All sample reviews inserted successfully!');
  } catch (error) {
    console.error('❌ Error inserting sample reviews:', error);
  } finally {
    process.exit(0);
  }
}

insertSampleReviews(); 
