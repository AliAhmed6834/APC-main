-- Database setup for Airport Parking Supplier System
-- Run this script to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database (run this separately if database doesn't exist)
-- CREATE DATABASE airport_parking_supplier;

-- Connect to the database and run the following:

-- Session storage table (mandatory for Replit Auth)
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- User storage table (mandatory for Replit Auth)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    preferred_locale VARCHAR(5) DEFAULT 'en-US',
    preferred_currency VARCHAR(3) DEFAULT 'USD',
    detected_country VARCHAR(2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Parking suppliers/providers
CREATE TABLE IF NOT EXISTS parking_suppliers (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description TEXT,
    logo_url VARCHAR,
    contact_email VARCHAR,
    contact_phone VARCHAR,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Airport information
CREATE TABLE IF NOT EXISTS airports (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    city VARCHAR NOT NULL,
    state VARCHAR,
    country VARCHAR NOT NULL,
    country_code VARCHAR(2) DEFAULT 'US',
    timezone VARCHAR DEFAULT 'America/New_York',
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Parking lots/facilities
CREATE TABLE IF NOT EXISTS parking_lots (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id VARCHAR REFERENCES parking_suppliers(id),
    airport_id VARCHAR REFERENCES airports(id),
    name VARCHAR NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    distance_to_terminal DECIMAL(5,2),
    shuttle_frequency_minutes INTEGER,
    is_shuttle_included BOOLEAN DEFAULT TRUE,
    is_covered BOOLEAN DEFAULT FALSE,
    has_ev_charging BOOLEAN DEFAULT FALSE,
    has_car_wash BOOLEAN DEFAULT FALSE,
    has_security_patrol BOOLEAN DEFAULT FALSE,
    has_cctv BOOLEAN DEFAULT FALSE,
    total_spaces INTEGER,
    image_url VARCHAR,
    rating DECIMAL(2,1),
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Pricing tiers for parking lots
CREATE TABLE IF NOT EXISTS parking_pricing (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id VARCHAR NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
    price_type VARCHAR NOT NULL DEFAULT 'daily',
    base_price DECIMAL(8,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    region VARCHAR(2) DEFAULT 'US',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR UNIQUE NOT NULL,
    lot_id VARCHAR REFERENCES parking_lots(id),
    user_id VARCHAR REFERENCES users(id),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    total_days INTEGER NOT NULL,
    total_price DECIMAL(8,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    vehicle_info JSONB,
    special_requests TEXT,
    is_cancellable BOOLEAN DEFAULT TRUE,
    status VARCHAR DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id VARCHAR NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Exchange rates
CREATE TABLE IF NOT EXISTS exchange_rates (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(10,6) NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(from_currency, to_currency)
);

-- Locale content
CREATE TABLE IF NOT EXISTS locale_content (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    locale VARCHAR(5) NOT NULL,
    key VARCHAR NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(locale, key)
);

-- Supplier users (separate from regular users)
CREATE TABLE IF NOT EXISTS supplier_users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id VARCHAR REFERENCES parking_suppliers(id),
    email VARCHAR NOT NULL UNIQUE,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    role VARCHAR NOT NULL DEFAULT 'manager',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Supplier authentication sessions
CREATE TABLE IF NOT EXISTS supplier_sessions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_user_id VARCHAR NOT NULL REFERENCES supplier_users(id) ON DELETE CASCADE,
    token VARCHAR NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Supplier parking slots/inventory
CREATE TABLE IF NOT EXISTS parking_slots (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id VARCHAR NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL,
    total_spaces INTEGER NOT NULL,
    available_spaces INTEGER NOT NULL,
    reserved_spaces INTEGER DEFAULT 0,
    price_per_day DECIMAL(8,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(lot_id, date)
);

-- Supplier booking management
CREATE TABLE IF NOT EXISTS supplier_bookings (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id VARCHAR REFERENCES bookings(id),
    supplier_user_id VARCHAR NOT NULL REFERENCES supplier_users(id),
    status VARCHAR NOT NULL DEFAULT 'confirmed',
    notes TEXT,
    assigned_to VARCHAR REFERENCES supplier_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parking_lots_supplier_id ON parking_lots(supplier_id);
CREATE INDEX IF NOT EXISTS idx_parking_lots_airport_id ON parking_lots(airport_id);
CREATE INDEX IF NOT EXISTS idx_parking_slots_lot_id ON parking_slots(lot_id);
CREATE INDEX IF NOT EXISTS idx_parking_slots_date ON parking_slots(date);
CREATE INDEX IF NOT EXISTS idx_supplier_users_supplier_id ON supplier_users(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_users_email ON supplier_users(email);
CREATE INDEX IF NOT EXISTS idx_supplier_sessions_token ON supplier_sessions(token);
CREATE INDEX IF NOT EXISTS idx_supplier_sessions_user_id ON supplier_sessions(supplier_user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_lot_id ON bookings(lot_id);
CREATE INDEX IF NOT EXISTS idx_reviews_lot_id ON reviews(lot_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Insert sample data for testing

-- Insert sample parking supplier
INSERT INTO parking_suppliers (id, name, description, contact_email, contact_phone) 
VALUES ('supplier_1', 'Premium Airport Parking Services', 'Leading airport parking provider with secure facilities', 'contact@premiumparking.com', '+1-555-0123')
ON CONFLICT DO NOTHING;

-- Insert sample supplier user
INSERT INTO supplier_users (id, supplier_id, email, first_name, last_name, role) 
VALUES ('supplier_user_1', 'supplier_1', 'supplier@example.com', 'John', 'Supplier', 'admin')
ON CONFLICT DO NOTHING;

-- Insert sample airports
INSERT INTO airports (id, code, name, city, state, country, country_code, timezone, latitude, longitude) VALUES
('airport_1', 'JFK', 'John F. Kennedy International Airport', 'New York', 'NY', 'United States', 'US', 'America/New_York', 40.6413, -73.7781),
('airport_2', 'LAX', 'Los Angeles International Airport', 'Los Angeles', 'CA', 'United States', 'US', 'America/Los_Angeles', 33.9416, -118.4085),
('airport_3', 'LHR', 'London Heathrow Airport', 'London', '', 'United Kingdom', 'GB', 'Europe/London', 51.4700, -0.4543)
ON CONFLICT DO NOTHING;

-- Insert sample parking lots
INSERT INTO parking_lots (id, supplier_id, airport_id, name, description, address, total_spaces, distance_to_terminal, shuttle_frequency_minutes, is_shuttle_included, is_covered, has_security_patrol, has_cctv) VALUES
('lot_1', 'supplier_1', 'airport_1', 'Premium Airport Parking', 'Secure parking with shuttle service', '123 Airport Road, Terminal 1', 200, 0.5, 15, TRUE, TRUE, TRUE, TRUE),
('lot_2', 'supplier_1', 'airport_1', 'Economy Parking Lot', 'Budget-friendly parking option', '456 Airport Boulevard, Terminal 2', 500, 2.0, 30, TRUE, FALSE, TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- Insert sample exchange rates
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
('USD', 'GBP', 0.79),
('USD', 'EUR', 0.92),
('GBP', 'USD', 1.27),
('GBP', 'EUR', 1.17),
('EUR', 'USD', 1.09),
('EUR', 'GBP', 0.86)
ON CONFLICT (from_currency, to_currency) DO UPDATE SET rate = EXCLUDED.rate, updated_at = NOW();

-- Insert sample locale content
INSERT INTO locale_content (locale, key, value) VALUES
('en-US', 'welcome_message', 'Welcome to Airport Parking'),
('en-US', 'search_placeholder', 'Search for parking near your airport'),
('en-GB', 'welcome_message', 'Welcome to Airport Parking'),
('en-GB', 'search_placeholder', 'Search for parking near your airport')
ON CONFLICT (locale, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user; 