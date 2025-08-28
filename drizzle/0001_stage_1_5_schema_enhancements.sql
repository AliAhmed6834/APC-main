-- Migration: Stage 1.5 Database Schema Enhancements
-- Description: Add missing tables for payment processing, communication, analytics, and advanced features
-- Date: 2025-01-28

-- Payment Methods Table
CREATE TABLE "payment_methods" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar REFERENCES "users"("id"),
	"payment_type" varchar NOT NULL,
	"last_four" varchar(4),
	"expiry_date" varchar(7),
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"token_hash" varchar NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Transactions Table
CREATE TABLE "transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" varchar REFERENCES "bookings"("id"),
	"payment_method_id" varchar REFERENCES "payment_methods"("id"),
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"transaction_id" varchar UNIQUE,
	"gateway_name" varchar NOT NULL,
	"gateway_response" jsonb,
	"error_message" text,
	"refund_amount" numeric(10, 2),
	"refund_reason" text,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Payment Gateway Configs
CREATE TABLE "payment_gateway_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gateway_name" varchar NOT NULL UNIQUE,
	"is_active" boolean DEFAULT true,
	"api_keys" jsonb NOT NULL,
	"webhook_urls" jsonb,
	"config_options" jsonb,
	"test_mode" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Email Templates
CREATE TABLE "email_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_key" varchar NOT NULL,
	"locale" varchar(5) DEFAULT 'en-US' NOT NULL,
	"subject" varchar NOT NULL,
	"html_content" text NOT NULL,
	"text_content" text NOT NULL,
	"content_type" varchar DEFAULT 'html' NOT NULL,
	"category" varchar NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true,
	"approved_by" varchar REFERENCES "users"("id"),
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Email Logs
CREATE TABLE "email_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar REFERENCES "users"("id"),
	"template_id" varchar REFERENCES "email_templates"("id"),
	"recipient" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"status" varchar DEFAULT 'sent' NOT NULL,
	"gateway_response" jsonb,
	"delivery_status" varchar,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"sent_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);

-- SMS Logs
CREATE TABLE "sms_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar REFERENCES "users"("id"),
	"phone_number" varchar NOT NULL,
	"message" text NOT NULL,
	"status" varchar DEFAULT 'sent' NOT NULL,
	"gateway_response" jsonb,
	"delivery_status" varchar,
	"sent_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);

-- User Activity Logs
CREATE TABLE "user_activity_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar REFERENCES "users"("id"),
	"activity_type" varchar NOT NULL,
	"page_url" varchar,
	"session_id" varchar,
	"device_info" jsonb,
	"ip_address" varchar,
	"user_agent" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);

-- Search Analytics
CREATE TABLE "search_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar REFERENCES "users"("id"),
	"airport_code" varchar(3),
	"search_date" timestamp NOT NULL,
	"results_count" integer NOT NULL,
	"filters_used" jsonb,
	"sort_order" varchar,
	"conversion_to_booking" boolean DEFAULT false,
	"search_duration" integer,
	"created_at" timestamp DEFAULT now()
);

-- Revenue Analytics
CREATE TABLE "revenue_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp NOT NULL,
	"total_bookings" integer DEFAULT 0 NOT NULL,
	"total_revenue" numeric(12, 2) DEFAULT '0' NOT NULL,
	"avg_order_value" numeric(8, 2),
	"currency_breakdown" jsonb,
	"supplier_breakdown" jsonb,
	"region_breakdown" jsonb,
	"created_at" timestamp DEFAULT now()
);

-- Supplier Performance
CREATE TABLE "supplier_performance" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" varchar REFERENCES "parking_suppliers"("id"),
	"metric_date" timestamp NOT NULL,
	"metric_type" varchar NOT NULL,
	"bookings_count" integer DEFAULT 0 NOT NULL,
	"revenue" numeric(10, 2) DEFAULT '0' NOT NULL,
	"rating" numeric(2, 1),
	"occupancy_rate" numeric(5, 2),
	"customer_satisfaction" numeric(3, 2),
	"created_at" timestamp DEFAULT now()
);

-- User Preferences
CREATE TABLE "user_preferences" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar REFERENCES "users"("id"),
	"preference_key" varchar NOT NULL,
	"preference_value" text NOT NULL,
	"category" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- User Loyalty
CREATE TABLE "user_loyalty" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar REFERENCES "users"("id") UNIQUE,
	"points_balance" integer DEFAULT 0 NOT NULL,
	"tier_level" varchar DEFAULT 'bronze' NOT NULL,
	"join_date" timestamp DEFAULT now(),
	"points_earned" integer DEFAULT 0 NOT NULL,
	"points_redeemed" integer DEFAULT 0 NOT NULL,
	"tier_history" jsonb,
	"last_activity" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Supplier Contracts
CREATE TABLE "supplier_contracts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" varchar REFERENCES "parking_suppliers"("id"),
	"contract_type" varchar NOT NULL,
	"commission_rate" numeric(5, 4) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"contract_terms" jsonb,
	"payment_schedule" varchar DEFAULT 'monthly' NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"approved_by" varchar REFERENCES "users"("id"),
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Supplier Metrics
CREATE TABLE "supplier_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" varchar REFERENCES "parking_suppliers"("id"),
	"metric_date" timestamp NOT NULL,
	"metric_type" varchar NOT NULL,
	"metric_value" numeric(10, 4) NOT NULL,
	"target_value" numeric(10, 4),
	"benchmark_value" numeric(10, 4),
	"created_at" timestamp DEFAULT now()
);

-- Booking Status History
CREATE TABLE "booking_status_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" varchar REFERENCES "bookings"("id"),
	"user_id" varchar REFERENCES "users"("id"),
	"old_status" varchar,
	"new_status" varchar NOT NULL,
	"reason" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);

-- Saved Searches
CREATE TABLE "saved_searches" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar REFERENCES "users"("id"),
	"search_name" varchar NOT NULL,
	"search_criteria" jsonb NOT NULL,
	"notification_settings" jsonb,
	"last_used" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Search Filters
CREATE TABLE "search_filters" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filter_key" varchar NOT NULL UNIQUE,
	"filter_name" varchar NOT NULL,
	"filter_options" jsonb NOT NULL,
	"filter_categories" jsonb,
	"sort_order" integer DEFAULT 0,
	"default_value" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Add payment-related fields to existing bookings table
ALTER TABLE "bookings" ADD COLUMN "payment_status" varchar DEFAULT 'pending';
ALTER TABLE "bookings" ADD COLUMN "payment_method_id" varchar REFERENCES "payment_methods"("id");
ALTER TABLE "bookings" ADD COLUMN "transaction_id" varchar REFERENCES "transactions"("id");
ALTER TABLE "bookings" ADD COLUMN "refund_amount" numeric(8, 2);
ALTER TABLE "bookings" ADD COLUMN "refund_reason" text;

-- Create indexes for better performance
CREATE INDEX "idx_payment_methods_user_id" ON "payment_methods"("user_id");
CREATE INDEX "idx_transactions_booking_id" ON "transactions"("booking_id");
CREATE INDEX "idx_transactions_status" ON "transactions"("status");
CREATE INDEX "idx_email_logs_user_id" ON "email_logs"("user_id");
CREATE INDEX "idx_email_logs_status" ON "email_logs"("status");
CREATE INDEX "idx_sms_logs_user_id" ON "sms_logs"("user_id");
CREATE INDEX "idx_user_activity_logs_user_id" ON "user_activity_logs"("user_id");
CREATE INDEX "idx_user_activity_logs_activity_type" ON "user_activity_logs"("activity_type");
CREATE INDEX "idx_search_analytics_user_id" ON "search_analytics"("user_id");
CREATE INDEX "idx_search_analytics_airport_code" ON "search_analytics"("airport_code");
CREATE INDEX "idx_revenue_analytics_date" ON "revenue_analytics"("date");
CREATE INDEX "idx_supplier_performance_supplier_id" ON "supplier_performance"("supplier_id");
CREATE INDEX "idx_supplier_performance_metric_date" ON "supplier_performance"("metric_date");
CREATE INDEX "idx_user_preferences_user_id" ON "user_preferences"("user_id");
CREATE INDEX "idx_supplier_contracts_supplier_id" ON "supplier_contracts"("supplier_id");
CREATE INDEX "idx_booking_status_history_booking_id" ON "booking_status_history"("booking_id");
CREATE INDEX "idx_saved_searches_user_id" ON "saved_searches"("user_id");
CREATE INDEX "idx_bookings_payment_status" ON "bookings"("payment_status");
