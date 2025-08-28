CREATE TABLE "airports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(3) NOT NULL,
	"name" varchar NOT NULL,
	"city" varchar NOT NULL,
	"state" varchar,
	"country" varchar NOT NULL,
	"country_code" varchar(2) DEFAULT 'US',
	"timezone" varchar DEFAULT 'America/New_York',
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "airports_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"lot_id" varchar,
	"booking_reference" varchar NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"total_days" integer NOT NULL,
	"price_per_day" numeric(8, 2) NOT NULL,
	"total_amount" numeric(8, 2) NOT NULL,
	"status" varchar DEFAULT 'confirmed' NOT NULL,
	"vehicle_info" jsonb,
	"special_requests" text,
	"is_cancellable" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "bookings_booking_reference_unique" UNIQUE("booking_reference")
);
--> statement-breakpoint
CREATE TABLE "exchange_rates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"base_currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"target_currency" varchar(3) NOT NULL,
	"rate" numeric(12, 6) NOT NULL,
	"provider" varchar DEFAULT 'openexchangerates' NOT NULL,
	"last_updated" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "locale_content" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_key" varchar NOT NULL,
	"locale" varchar(5) NOT NULL,
	"content" text NOT NULL,
	"content_type" varchar DEFAULT 'text' NOT NULL,
	"category" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parking_lots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" varchar,
	"airport_id" varchar,
	"name" varchar NOT NULL,
	"description" text,
	"address" text NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"distance_to_terminal" numeric(5, 2),
	"shuttle_frequency_minutes" integer,
	"is_shuttle_included" boolean DEFAULT true,
	"is_covered" boolean DEFAULT false,
	"has_ev_charging" boolean DEFAULT false,
	"has_car_wash" boolean DEFAULT false,
	"has_security_patrol" boolean DEFAULT false,
	"has_cctv" boolean DEFAULT false,
	"total_spaces" integer,
	"image_url" varchar,
	"rating" numeric(2, 1),
	"review_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parking_pricing" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lot_id" varchar,
	"price_type" varchar NOT NULL,
	"base_price" numeric(8, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"localized_price" numeric(8, 2) NOT NULL,
	"tax_rate" numeric(5, 4) DEFAULT '0',
	"region" varchar(2) DEFAULT 'US' NOT NULL,
	"discounted_price" numeric(8, 2),
	"valid_from" timestamp DEFAULT now(),
	"valid_to" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parking_slots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lot_id" varchar,
	"date" timestamp NOT NULL,
	"total_spaces" integer NOT NULL,
	"available_spaces" integer NOT NULL,
	"reserved_spaces" integer DEFAULT 0,
	"price_per_day" numeric(8, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parking_suppliers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"logo_url" varchar,
	"contact_email" varchar,
	"contact_phone" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"lot_id" varchar,
	"booking_id" varchar,
	"rating" integer NOT NULL,
	"title" varchar,
	"comment" text,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_bookings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" varchar,
	"supplier_user_id" varchar,
	"status" varchar DEFAULT 'confirmed' NOT NULL,
	"notes" text,
	"assigned_to" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "supplier_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_user_id" varchar,
	"token" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "supplier_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "supplier_users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" varchar,
	"email" varchar NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"role" varchar DEFAULT 'manager' NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "supplier_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"preferred_locale" varchar(5) DEFAULT 'en-US',
	"preferred_currency" varchar(3) DEFAULT 'USD',
	"detected_country" varchar(2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_lot_id_parking_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."parking_lots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parking_lots" ADD CONSTRAINT "parking_lots_supplier_id_parking_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."parking_suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parking_lots" ADD CONSTRAINT "parking_lots_airport_id_airports_id_fk" FOREIGN KEY ("airport_id") REFERENCES "public"."airports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parking_pricing" ADD CONSTRAINT "parking_pricing_lot_id_parking_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."parking_lots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parking_slots" ADD CONSTRAINT "parking_slots_lot_id_parking_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."parking_lots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_lot_id_parking_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."parking_lots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_bookings" ADD CONSTRAINT "supplier_bookings_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_bookings" ADD CONSTRAINT "supplier_bookings_supplier_user_id_supplier_users_id_fk" FOREIGN KEY ("supplier_user_id") REFERENCES "public"."supplier_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_bookings" ADD CONSTRAINT "supplier_bookings_assigned_to_supplier_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."supplier_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_sessions" ADD CONSTRAINT "supplier_sessions_supplier_user_id_supplier_users_id_fk" FOREIGN KEY ("supplier_user_id") REFERENCES "public"."supplier_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_users" ADD CONSTRAINT "supplier_users_supplier_id_parking_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."parking_suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");