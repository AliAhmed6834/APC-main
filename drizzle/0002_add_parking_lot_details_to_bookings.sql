-- Migration: Add parking_lot_details column to bookings table
-- This migration adds a JSONB column to store complete parking lot information
-- for customer dashboard display purposes

-- Add the new column
ALTER TABLE "bookings" 
ADD COLUMN "parking_lot_details" JSONB;

-- Add a comment to document the purpose
COMMENT ON COLUMN "bookings"."parking_lot_details" IS 'Stores complete parking lot information for customer dashboard display including name, address, airport details, amenities, etc.';

-- Update existing records to have a default value (optional)
-- UPDATE "bookings" SET "parking_lot_details" = '{}' WHERE "parking_lot_details" IS NULL;

-- Migration completed successfully
-- The new column will allow storing structured parking lot information
-- that can be used to display complete booking details on the customer dashboard
-- without requiring additional database joins
