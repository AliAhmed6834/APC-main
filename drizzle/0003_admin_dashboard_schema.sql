-- Migration: Admin Dashboard Schema Support
-- Description: Add missing tables and fields for AdminDashboard functionality
-- Date: 2025-01-28

-- Admin Users Table - Separate from regular users for admin access
CREATE TABLE "admin_users" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "email" varchar NOT NULL UNIQUE,
    "first_name" varchar NOT NULL,
    "last_name" varchar NOT NULL,
    "role" varchar NOT NULL DEFAULT 'admin', -- admin, super_admin, support
    "is_active" boolean DEFAULT true NOT NULL,
    "last_login_at" timestamp,
    "permissions" jsonb, -- Store admin permissions as JSON
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-- Admin Sessions Table - For admin authentication
CREATE TABLE "admin_sessions" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "admin_user_id" varchar REFERENCES "admin_users"("id"),
    "token" varchar NOT NULL UNIQUE,
    "expires_at" timestamp NOT NULL,
    "ip_address" varchar,
    "user_agent" text,
    "created_at" timestamp DEFAULT now()
);

-- Admin Activity Logs - Track admin actions for audit purposes
CREATE TABLE "admin_activity_logs" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "admin_user_id" varchar REFERENCES "admin_users"("id"),
    "action_type" varchar NOT NULL, -- create, update, delete, view, export
    "table_name" varchar NOT NULL, -- Which table was affected
    "record_id" varchar, -- ID of the record that was affected
    "old_values" jsonb, -- Previous values before change
    "new_values" jsonb, -- New values after change
    "ip_address" varchar,
    "user_agent" text,
    "metadata" jsonb, -- Additional context about the action
    "created_at" timestamp DEFAULT now()
);

-- Customer Analytics Table - Store customer metrics for admin dashboard
CREATE TABLE "customer_analytics" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "customer_id" varchar REFERENCES "users"("id"),
    "total_bookings" integer DEFAULT 0 NOT NULL,
    "total_spent" numeric(10, 2) DEFAULT '0' NOT NULL,
    "last_booking_date" timestamp,
    "average_booking_value" numeric(8, 2),
    "favorite_airport" varchar(3),
    "booking_frequency" integer DEFAULT 0, -- Bookings per month
    "customer_satisfaction_score" numeric(3, 2), -- 0-10 scale
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-- Supplier Analytics Table - Store supplier metrics for admin dashboard
CREATE TABLE "supplier_analytics" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "supplier_id" varchar REFERENCES "parking_suppliers"("id"),
    "total_parking_lots" integer DEFAULT 0 NOT NULL,
    "total_bookings" integer DEFAULT 0 NOT NULL,
    "total_revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
    "average_rating" numeric(2, 1) DEFAULT 0,
    "total_reviews" integer DEFAULT 0,
    "occupancy_rate" numeric(5, 2), -- Percentage
    "customer_satisfaction_score" numeric(3, 2), -- 0-10 scale
    "response_time_hours" numeric(5, 2), -- Average response time
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-- Airport Analytics Table - Store airport metrics for admin dashboard
CREATE TABLE "airport_analytics" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "airport_id" varchar REFERENCES "airports"("id"),
    "total_parking_lots" integer DEFAULT 0 NOT NULL,
    "total_bookings" integer DEFAULT 0 NOT NULL,
    "total_revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
    "average_rating" numeric(2, 1) DEFAULT 0,
    "popular_amenities" jsonb, -- Most requested amenities
    "peak_booking_times" jsonb, -- Peak booking hours/days
    "seasonal_trends" jsonb, -- Seasonal booking patterns
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-- Payment Analytics Table - Store payment metrics for admin dashboard
CREATE TABLE "payment_analytics" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "payment_date" timestamp NOT NULL,
    "total_transactions" integer DEFAULT 0 NOT NULL,
    "total_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
    "successful_payments" integer DEFAULT 0 NOT NULL,
    "failed_payments" integer DEFAULT 0 NOT NULL,
    "refunded_payments" integer DEFAULT 0 NOT NULL,
    "payment_method_breakdown" jsonb, -- Breakdown by payment method
    "gateway_breakdown" jsonb, -- Breakdown by payment gateway
    "currency_breakdown" jsonb, -- Breakdown by currency
    "average_transaction_value" numeric(8, 2),
    "created_at" timestamp DEFAULT now()
);

-- Booking Analytics Table - Store booking metrics for admin dashboard
CREATE TABLE "booking_analytics" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "booking_date" timestamp NOT NULL,
    "total_bookings" integer DEFAULT 0 NOT NULL,
    "confirmed_bookings" integer DEFAULT 0 NOT NULL,
    "cancelled_bookings" integer DEFAULT 0 NOT NULL,
    "completed_bookings" integer DEFAULT 0 NOT NULL,
    "no_show_bookings" integer DEFAULT 0 NOT NULL,
    "total_revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
    "average_booking_duration" numeric(5, 2), -- Average days
    "airport_breakdown" jsonb, -- Bookings by airport
    "supplier_breakdown" jsonb, -- Bookings by supplier
    "seasonal_patterns" jsonb, -- Seasonal booking trends
    "created_at" timestamp DEFAULT now()
);

-- System Settings Table - Store admin-configurable system settings
CREATE TABLE "system_settings" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "setting_key" varchar NOT NULL UNIQUE,
    "setting_value" text NOT NULL,
    "setting_type" varchar NOT NULL DEFAULT 'string', -- string, number, boolean, json
    "category" varchar NOT NULL, -- general, payment, email, sms, security
    "description" text,
    "is_public" boolean DEFAULT false, -- Whether this setting can be exposed to frontend
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-- Admin Notifications Table - Store admin notifications and alerts
CREATE TABLE "admin_notifications" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "admin_user_id" varchar REFERENCES "admin_users"("id"),
    "title" varchar NOT NULL,
    "message" text NOT NULL,
    "type" varchar NOT NULL DEFAULT 'info', -- info, warning, error, success
    "priority" varchar NOT NULL DEFAULT 'normal', -- low, normal, high, urgent
    "is_read" boolean DEFAULT false NOT NULL,
    "action_required" boolean DEFAULT false NOT NULL,
    "action_url" varchar, -- URL to navigate to for action
    "expires_at" timestamp,
    "created_at" timestamp DEFAULT now()
);

-- Admin Reports Table - Store generated admin reports
CREATE TABLE "admin_reports" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "admin_user_id" varchar REFERENCES "admin_users"("id"),
    "report_name" varchar NOT NULL,
    "report_type" varchar NOT NULL, -- analytics, financial, operational, custom
    "report_format" varchar NOT NULL DEFAULT 'json', -- json, csv, pdf, excel
    "report_data" jsonb NOT NULL, -- The actual report data
    "filters_applied" jsonb, -- Filters that were applied to generate the report
    "file_path" varchar, -- Path to stored report file if exported
    "expires_at" timestamp, -- When the report data expires
    "created_at" timestamp DEFAULT now()
);

-- Add missing fields to existing tables for admin functionality

-- Add admin-specific fields to users table
ALTER TABLE "users" ADD COLUMN "is_admin" boolean DEFAULT false;
ALTER TABLE "users" ADD COLUMN "admin_role" varchar;
ALTER TABLE "users" ADD COLUMN "last_activity" timestamp;
ALTER TABLE "users" ADD COLUMN "account_status" varchar DEFAULT 'active'; -- active, suspended, banned

-- Add admin-specific fields to parking_suppliers table
ALTER TABLE "parking_suppliers" ADD COLUMN "admin_notes" text;
ALTER TABLE "parking_suppliers" ADD COLUMN "verification_status" varchar DEFAULT 'pending'; -- pending, verified, rejected
ALTER TABLE "parking_suppliers" ADD COLUMN "verification_date" timestamp;
ALTER TABLE "parking_suppliers" ADD COLUMN "verification_by" varchar REFERENCES "admin_users"("id");

-- Add admin-specific fields to airports table
ALTER TABLE "airports" ADD COLUMN "admin_notes" text;
ALTER TABLE "airports" ADD COLUMN "priority_level" varchar DEFAULT 'normal'; -- low, normal, high, critical
ALTER TABLE "airports" ADD COLUMN "maintenance_mode" boolean DEFAULT false;

-- Add admin-specific fields to bookings table
ALTER TABLE "bookings" ADD COLUMN "admin_notes" text;
ALTER TABLE "bookings" ADD COLUMN "flagged_for_review" boolean DEFAULT false;
ALTER TABLE "bookings" ADD COLUMN "flag_reason" text;
ALTER TABLE "bookings" ADD COLUMN "flagged_by" varchar REFERENCES "admin_users"("id");
ALTER TABLE "bookings" ADD COLUMN "flagged_at" timestamp;

-- Create indexes for admin queries and performance
CREATE INDEX "idx_admin_users_email" ON "admin_users"("email");
CREATE INDEX "idx_admin_users_role" ON "admin_users"("role");
CREATE INDEX "idx_admin_sessions_admin_user_id" ON "admin_sessions"("admin_user_id");
CREATE INDEX "idx_admin_sessions_token" ON "admin_sessions"("token");
CREATE INDEX "idx_admin_activity_logs_admin_user_id" ON "admin_activity_logs"("admin_user_id");
CREATE INDEX "idx_admin_activity_logs_action_type" ON "admin_activity_logs"("action_type");
CREATE INDEX "idx_admin_activity_logs_table_name" ON "admin_activity_logs"("table_name");
CREATE INDEX "idx_customer_analytics_customer_id" ON "customer_analytics"("customer_id");
CREATE INDEX "idx_supplier_analytics_supplier_id" ON "supplier_analytics"("supplier_id");
CREATE INDEX "idx_airport_analytics_airport_id" ON "airport_analytics"("airport_id");
CREATE INDEX "idx_payment_analytics_payment_date" ON "payment_analytics"("payment_date");
CREATE INDEX "idx_booking_analytics_booking_date" ON "booking_analytics"("booking_date");
CREATE INDEX "idx_system_settings_setting_key" ON "system_settings"("setting_key");
CREATE INDEX "idx_system_settings_category" ON "system_settings"("category");
CREATE INDEX "idx_admin_notifications_admin_user_id" ON "admin_notifications"("admin_user_id");
CREATE INDEX "idx_admin_notifications_type" ON "admin_notifications"("type");
CREATE INDEX "idx_admin_notifications_is_read" ON "admin_notifications"("is_read");
CREATE INDEX "idx_admin_reports_admin_user_id" ON "admin_reports"("admin_user_id");
CREATE INDEX "idx_admin_reports_report_type" ON "admin_reports"("report_type");

-- Insert default admin user (password should be changed after first login)
INSERT INTO "admin_users" ("email", "first_name", "last_name", "role", "is_active") 
VALUES ('admin@airportparking.com', 'System', 'Administrator', 'super_admin', true);

-- Insert default system settings
INSERT INTO "system_settings" ("setting_key", "setting_value", "setting_type", "category", "description") VALUES
('platform_name', 'Airport Parking Supplier Platform', 'string', 'general', 'Name of the platform'),
('platform_version', '1.0.0', 'string', 'general', 'Current platform version'),
('maintenance_mode', 'false', 'boolean', 'general', 'Whether the platform is in maintenance mode'),
('max_file_upload_size', '10485760', 'number', 'general', 'Maximum file upload size in bytes'),
('session_timeout_minutes', '480', 'number', 'security', 'Session timeout in minutes'),
('max_login_attempts', '5', 'number', 'security', 'Maximum login attempts before lockout'),
('lockout_duration_minutes', '30', 'number', 'security', 'Account lockout duration in minutes'),
('default_currency', 'USD', 'string', 'payment', 'Default platform currency'),
('supported_currencies', '["USD", "GBP", "EUR"]', 'json', 'payment', 'Supported currencies'),
('stripe_enabled', 'false', 'boolean', 'payment', 'Whether Stripe payment gateway is enabled'),
('paypal_enabled', 'false', 'boolean', 'payment', 'Whether PayPal payment gateway is enabled'),
('smtp_enabled', 'false', 'boolean', 'email', 'Whether SMTP email is enabled'),
('sms_enabled', 'false', 'boolean', 'sms', 'Whether SMS notifications are enabled'),
('analytics_enabled', 'true', 'boolean', 'analytics', 'Whether analytics tracking is enabled'),
('review_moderation', 'false', 'boolean', 'content', 'Whether reviews require moderation before publishing');

-- Add comments to document the purpose of new tables
COMMENT ON TABLE "admin_users" IS 'Administrative users with elevated privileges for platform management';
COMMENT ON TABLE "admin_sessions" IS 'Active admin user sessions for authentication';
COMMENT ON TABLE "admin_activity_logs" IS 'Audit trail of all admin actions for compliance and security';
COMMENT ON TABLE "customer_analytics" IS 'Aggregated customer metrics for admin dashboard and reporting';
COMMENT ON TABLE "supplier_analytics" IS 'Aggregated supplier metrics for admin dashboard and reporting';
COMMENT ON TABLE "airport_analytics" IS 'Aggregated airport metrics for admin dashboard and reporting';
COMMENT ON TABLE "payment_analytics" IS 'Aggregated payment metrics for admin dashboard and reporting';
COMMENT ON TABLE "booking_analytics" IS 'Aggregated booking metrics for admin dashboard and reporting';
COMMENT ON TABLE "system_settings" IS 'Configurable system settings for platform administration';
COMMENT ON TABLE "admin_notifications" IS 'Notifications and alerts for administrative users';
COMMENT ON TABLE "admin_reports" IS 'Generated administrative reports and analytics data';

-- Migration completed successfully
-- This migration adds comprehensive support for the AdminDashboard functionality
-- including admin user management, analytics tables, system settings, and audit logging

