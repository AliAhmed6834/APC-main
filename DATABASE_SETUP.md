# Database Setup Guide

This guide will help you set up PostgreSQL for the Airport Parking Supplier System.

## Prerequisites

1. **PostgreSQL** installed on your system
2. **Node.js** and **npm** installed
3. **Git** to clone the repository

## Installation Steps

### 1. Install PostgreSQL

#### Windows:
- Download from: https://www.postgresql.org/download/windows/
- Install with default settings
- Remember the password you set for the `postgres` user

#### macOS:
```bash
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database

Connect to PostgreSQL and create the database:

```bash
# Connect as postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE airport_parking_supplier;

# Create a user (optional, you can use postgres user)
CREATE USER parking_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE airport_parking_supplier TO parking_user;

# Exit psql
\q
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=airport_parking_supplier
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Application Configuration
NODE_ENV=development
PORT=5000
SESSION_SECRET=your-session-secret-here
```

### 5. Set Up Database Tables

Run the database setup script:

```bash
npm run db:setup
```

This will:
- Create all necessary tables
- Insert sample data
- Set up indexes for performance

### 6. Generate and Run Migrations (Optional)

If you want to use Drizzle migrations:

```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate
```

### 7. Start the Application

```bash
npm run dev
```

## Database Schema

The system includes the following main tables:

### Core Tables
- `users` - Regular user accounts
- `sessions` - User sessions (required for Replit Auth)
- `airports` - Airport information
- `parking_suppliers` - Parking service providers
- `parking_lots` - Parking facilities
- `parking_pricing` - Pricing information
- `bookings` - Customer bookings
- `reviews` - Customer reviews

### Supplier System Tables
- `supplier_users` - Supplier staff accounts
- `supplier_sessions` - Supplier authentication sessions
- `parking_slots` - Available parking slots/inventory
- `supplier_bookings` - Supplier booking management

### Supporting Tables
- `exchange_rates` - Currency conversion rates
- `locale_content` - Localization content

## Sample Data

The setup script includes sample data:

- **Parking Supplier**: Premium Airport Parking Services
- **Supplier User**: supplier@example.com (admin role)
- **Airports**: JFK, LAX, LHR
- **Parking Lots**: Premium and Economy lots at JFK
- **Exchange Rates**: USD, GBP, EUR conversions

## Testing the Setup

1. **Start the application**: `npm run dev`
2. **Visit**: http://localhost:5000
3. **Go to Supplier Login**: http://localhost:5000/supplier/login
4. **Login with**: 
   - Email: `supplier@example.com`
   - Password: `test123` (or any password in demo mode)

## Troubleshooting

### Connection Issues
- Ensure PostgreSQL is running
- Check your database credentials in `.env`
- Verify the database exists

### Permission Issues
```sql
-- Grant permissions to your user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

### Port Already in Use
```bash
# Find and kill the process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## Cloud Database Setup

For production or cloud databases (Neon, Supabase, Railway):

1. Create a database in your cloud provider
2. Get the connection string
3. Set `DATABASE_URL` in your `.env` file:
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

## Database Management

### View Database with Drizzle Studio
```bash
npm run db:studio
```

### Reset Database
```bash
# Drop and recreate tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
npm run db:setup
```

### Backup Database
```bash
pg_dump -h localhost -U postgres airport_parking_supplier > backup.sql
```

### Restore Database
```bash
psql -h localhost -U postgres airport_parking_supplier < backup.sql
```

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your PostgreSQL installation
3. Ensure all environment variables are set correctly
4. Check that the database and tables exist 