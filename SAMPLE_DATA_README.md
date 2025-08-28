# Sample Data Insertion Scripts

This directory contains JavaScript scripts to populate your database with sample data for the Airport Parking application. The data is based on the mock data from `storage.ts` and includes realistic airport parking information.

## 📁 Scripts Overview

### Individual Scripts

1. **`insert-airports.js`** - Inserts 30 airports (US and UK)
2. **`insert-parking-suppliers.js`** - Inserts 8 parking suppliers
3. **`insert-parking-lots.js`** - Inserts 18 parking lots across different airports
4. **`insert-parking-pricing.js`** - Inserts pricing data in USD and GBP
5. **`insert-supplier-users.js`** - Inserts 13 supplier user accounts
6. **`insert-parking-slots.js`** - Inserts 540 parking slots (30 days × 18 lots)
7. **`insert-sample-bookings.js`** - Inserts 10 sample customer bookings
8. **`insert-sample-reviews.js`** - Inserts 20 customer reviews
9. **`insert-supplier-bookings.js`** - Inserts 15 supplier booking management records

### Master Script

- **`insert-all-sample-data.js`** - Runs all scripts in the correct order

## 🚀 Usage

### Prerequisites

1. Make sure your database is set up and migrations have been run
2. Ensure your database connection is configured in `server/db.ts`
3. Install dependencies: `npm install`

### Running the Scripts

#### Option 1: Run All Data at Once (Recommended)
```bash
node insert-all-sample-data.js
```

#### Option 2: Run Individual Scripts
```bash
# Run scripts in order (important for foreign key relationships)
node insert-airports.js
node insert-parking-suppliers.js
node insert-parking-lots.js
node insert-parking-pricing.js
node insert-supplier-users.js
node insert-parking-slots.js
node insert-sample-bookings.js
node insert-sample-reviews.js
node insert-supplier-bookings.js
```

## 📊 Sample Data Summary

### Airports (30 total)
- **US Airports**: LAX, JFK, ORD, DFW, ATL, MIA, SFO, LAS, DEN, BOS, SEA, IAH, MCO, PHX, EWR
- **UK Airports**: LHR, LGW, MAN, STN, LTN, BHX, EDI, BRS, NCL, LPL, BFS, GLA, CWL, LCY, ABZ

### Parking Suppliers (8 total)
- Heathrow Official Parking
- Park & Fly UK
- Airport Parking Solutions
- Premium Parking Services
- Quick Park Heathrow
- Gatwick Parking Services
- Manchester Airport Parking
- Birmingham Airport Parking

### Parking Lots (18 total)
- **LHR**: 10 different lots (Terminal 5, Terminal 2&3, Meet & Greet, Economy, etc.)
- **LAX**: 5 different lots (Official, Economy, Valet, Long Term, Quick Park)
- **Other UK**: Gatwick, Manchester, Birmingham

### Pricing
- Multi-currency support (USD and GBP)
- Different pricing tiers (Premium, Economy, Valet, etc.)
- Discounted prices for premium services

### Sample Bookings
- 10 realistic customer bookings
- Various vehicle types and special requests
- Different booking durations and statuses

### Reviews
- 20 customer reviews with ratings 3-5 stars
- Mix of verified and unverified reviews
- Realistic comments and feedback

## 🔧 Customization

### Adding More Data
To add more sample data, you can:

1. **Modify existing scripts**: Edit the data arrays in any script
2. **Create new scripts**: Follow the pattern of existing scripts
3. **Update the master script**: Add new scripts to the `scripts` array in `insert-all-sample-data.js`

### Database Schema
The scripts use the schema defined in `shared/schema.ts`. Make sure any new data follows the correct table structure.

## ⚠️ Important Notes

1. **Order Matters**: Scripts must be run in the correct order due to foreign key relationships
2. **Database Connection**: Ensure your database is running and accessible
3. **Existing Data**: Scripts will fail if data with the same IDs already exists
4. **Environment**: Make sure your environment variables (DATABASE_URL) are set correctly

## 🐛 Troubleshooting

### Common Issues

1. **Connection Error**: Check your database connection and environment variables
2. **Foreign Key Error**: Ensure scripts are run in the correct order
3. **Duplicate Key Error**: Clear existing data or use different IDs
4. **Schema Mismatch**: Verify the schema matches your database structure

### Resetting Data
To start fresh, you can:
1. Drop and recreate your database
2. Run migrations again
3. Run the sample data scripts

## 📝 Data Relationships

The sample data includes realistic relationships:
- Each parking lot belongs to a supplier and airport
- Pricing is linked to parking lots with currency/region support
- Bookings reference users and parking lots
- Reviews are linked to users, lots, and bookings
- Supplier bookings manage the operational side

This provides a complete dataset for testing all application features including search, booking, reviews, and supplier management. 