-- Sample Data for Stage 1.5 Database Schema Enhancements
-- Run this after applying the migration to populate tables with test data

-- Insert sample email templates (only if they don't exist)
INSERT INTO email_templates (template_key, locale, subject, html_content, text_content, category, version, is_active) 
SELECT 'booking_confirmation', 'en-US', 'Your Parking Booking Confirmation', 
 '<h1>Booking Confirmed!</h1><p>Your parking at {airport} is confirmed for {dates}.</p>', 
 'Booking Confirmed! Your parking at {airport} is confirmed for {dates}.', 'booking', 1, true
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE template_key = 'booking_confirmation' AND locale = 'en-US');

INSERT INTO email_templates (template_key, locale, subject, html_content, text_content, category, version, is_active) 
SELECT 'welcome', 'en-US', 'Welcome to Airport Parking!', 
 '<h1>Welcome!</h1><p>Thank you for joining Airport Parking. Start booking your parking today!</p>', 
 'Welcome! Thank you for joining Airport Parking. Start booking your parking today!', 'marketing', 1, true
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE template_key = 'welcome' AND locale = 'en-US');

INSERT INTO email_templates (template_key, locale, subject, html_content, text_content, category, version, is_active) 
SELECT 'password_reset', 'en-US', 'Password Reset Request', 
 '<h1>Password Reset</h1><p>Click here to reset your password: {reset_link}</p>', 
 'Password Reset: Click here to reset your password: {reset_link}', 'authentication', 1, true
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE template_key = 'password_reset' AND locale = 'en-US');

-- Insert sample payment gateway configs (only if they don't exist)
INSERT INTO payment_gateway_configs (gateway_name, is_active, api_keys, webhook_urls, config_options, test_mode) 
SELECT 'stripe', true, '{"publishable_key": "pk_test_...", "secret_key": "sk_test_..."}'::jsonb, 
 '{"webhook_endpoint": "https://api.example.com/webhooks/stripe"}'::jsonb, 
 '{"payment_methods": ["card", "apple_pay", "google_pay"]}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM payment_gateway_configs WHERE gateway_name = 'stripe');

INSERT INTO payment_gateway_configs (gateway_name, is_active, api_keys, webhook_urls, config_options, test_mode) 
SELECT 'paypal', true, '{"client_id": "test_client_id", "client_secret": "test_client_secret"}'::jsonb, 
 '{"webhook_endpoint": "https://api.example.com/webhooks/paypal"}'::jsonb, 
 '{"payment_methods": ["paypal", "venmo"]}'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM payment_gateway_configs WHERE gateway_name = 'paypal');

-- Insert sample search filters (only if they don't exist)
INSERT INTO search_filters (filter_key, filter_name, filter_options, filter_categories, sort_order, is_active) 
SELECT 'price_range', 'Price Range', '{"min": 0, "max": 100, "steps": [0, 25, 50, 75, 100]}'::jsonb, '["pricing"]'::jsonb, 1, true
WHERE NOT EXISTS (SELECT 1 FROM search_filters WHERE filter_key = 'price_range');

INSERT INTO search_filters (filter_key, filter_name, filter_options, filter_categories, sort_order, is_active) 
SELECT 'amenities', 'Amenities', '["covered", "ev_charging", "car_wash", "security_patrol", "cctv", "shuttle"]'::jsonb, '["features"]'::jsonb, 2, true
WHERE NOT EXISTS (SELECT 1 FROM search_filters WHERE filter_key = 'amenities');

INSERT INTO search_filters (filter_key, filter_name, filter_options, filter_categories, sort_order, is_active) 
SELECT 'distance', 'Distance to Terminal', '{"min": 0, "max": 10, "steps": [0, 2, 5, 10]}'::jsonb, '["location"]'::jsonb, 3, true
WHERE NOT EXISTS (SELECT 1 FROM search_filters WHERE filter_key = 'distance');

INSERT INTO search_filters (filter_key, filter_name, filter_options, filter_categories, sort_order, is_active) 
SELECT 'rating', 'Rating', '{"min": 1, "max": 5, "steps": [1, 2, 3, 4, 5]}'::jsonb, '["quality"]'::jsonb, 4, true
WHERE NOT EXISTS (SELECT 1 FROM search_filters WHERE filter_key = 'rating');

-- Insert sample user preferences (for existing users, only if they don't exist)
INSERT INTO user_preferences (user_id, preference_key, preference_value, category) 
SELECT id, 'notification_email', 'true', 'communication' 
FROM users 
WHERE id NOT IN (SELECT user_id FROM user_preferences WHERE preference_key = 'notification_email')
LIMIT 5;

INSERT INTO user_preferences (user_id, preference_key, preference_value, category) 
SELECT id, 'notification_sms', 'false', 'communication' 
FROM users 
WHERE id NOT IN (SELECT user_id FROM user_preferences WHERE preference_key = 'notification_sms')
LIMIT 5;

INSERT INTO user_preferences (user_id, preference_key, preference_value, category) 
SELECT id, 'privacy_share_data', 'true', 'privacy' 
FROM users 
WHERE id NOT IN (SELECT user_id FROM user_preferences WHERE preference_key = 'privacy_share_data')
LIMIT 5;

-- Insert sample user loyalty records (for existing users, only if they don't exist)
INSERT INTO user_loyalty (user_id, points_balance, tier_level, points_earned, points_redeemed, tier_history) 
SELECT id, 150, 'silver', 200, 50, '[]'::jsonb
FROM users 
WHERE id NOT IN (SELECT user_id FROM user_loyalty)
LIMIT 3;

-- Insert sample supplier contracts (only if they don't exist)
INSERT INTO supplier_contracts (supplier_id, contract_type, commission_rate, start_date, payment_schedule, status, contract_terms) 
SELECT id, 'standard', 0.05, NOW(), 'monthly', 'active', '{"terms": "Standard contract terms"}'::jsonb
FROM parking_suppliers 
WHERE id NOT IN (SELECT supplier_id FROM supplier_contracts WHERE contract_type = 'standard')
LIMIT 3;

INSERT INTO supplier_contracts (supplier_id, contract_type, commission_rate, start_date, payment_schedule, status, contract_terms) 
SELECT id, 'premium', 0.03, NOW(), 'monthly', 'active', '{"terms": "Premium contract terms"}'::jsonb
FROM parking_suppliers 
WHERE id NOT IN (SELECT supplier_id FROM supplier_contracts WHERE contract_type = 'premium')
LIMIT 2;

-- Insert sample supplier performance metrics (only if they don't exist)
INSERT INTO supplier_performance (supplier_id, metric_date, metric_type, bookings_count, revenue, rating, occupancy_rate, customer_satisfaction) 
SELECT id, NOW(), 'daily', 15, 450.00, 4.5, 85.50, 8.5 
FROM parking_suppliers 
WHERE id NOT IN (SELECT supplier_id FROM supplier_performance WHERE metric_date::date = NOW()::date)
LIMIT 3;

-- Insert sample revenue analytics (only if they don't exist)
INSERT INTO revenue_analytics (date, total_bookings, total_revenue, avg_order_value, currency_breakdown, supplier_breakdown, region_breakdown) 
SELECT NOW(), 45, 1350.00, 30.00, '{"USD": 1350.00}'::jsonb, '{"supplier_1": 450.00, "supplier_2": 380.00, "supplier_3": 520.00}'::jsonb, '{"US": 1350.00}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM revenue_analytics WHERE date::date = NOW()::date);

-- Insert sample search analytics (only if they don't exist)
INSERT INTO search_analytics (user_id, airport_code, search_date, results_count, filters_used, sort_order, conversion_to_booking, search_duration) 
SELECT id, 'LAX', NOW(), 12, '{"price_range": [0, 50], "amenities": ["covered"]}'::jsonb, 'price', true, 2500 
FROM users 
WHERE id NOT IN (SELECT user_id FROM search_analytics WHERE airport_code = 'LAX' AND search_date::date = NOW()::date)
LIMIT 3;

-- Insert sample saved searches (only if they don't exist)
INSERT INTO saved_searches (user_id, search_name, search_criteria, notification_settings, is_active) 
SELECT id, 'LAX Weekly Trip', '{"airport_code": "LAX", "start_date": "2025-02-01", "end_date": "2025-02-07"}'::jsonb, 
 '{"price_drop_alerts": true, "new_options_alerts": false}'::jsonb, true 
FROM users 
WHERE id NOT IN (SELECT user_id FROM saved_searches WHERE search_name = 'LAX Weekly Trip')
LIMIT 3;

-- Insert sample user activity logs (only if they don't exist)
INSERT INTO user_activity_logs (user_id, activity_type, page_url, session_id, device_info, ip_address, user_agent, metadata) 
SELECT id, 'search', '/search?airport=LAX', 'session_123', '{"device": "desktop", "browser": "chrome", "os": "windows"}'::jsonb, 
 '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"search_type": "airport"}'::jsonb
FROM users 
WHERE id NOT IN (SELECT user_id FROM user_activity_logs WHERE activity_type = 'search' AND page_url = '/search?airport=LAX')
LIMIT 5;

-- Update existing bookings with payment status (for testing, only if not already set)
UPDATE bookings SET payment_status = 'completed' 
WHERE id IN (SELECT id FROM bookings WHERE payment_status IS NULL LIMIT 5);

UPDATE bookings SET payment_status = 'pending' 
WHERE id IN (SELECT id FROM bookings WHERE payment_status IS NULL LIMIT 5 OFFSET 5);

-- Insert sample booking status history (only if they don't exist)
INSERT INTO booking_status_history (booking_id, user_id, old_status, new_status, reason, metadata) 
SELECT b.id, b.user_id, NULL, b.status, 'Initial booking creation', '{"source": "migration"}'::jsonb
FROM bookings b 
WHERE b.id NOT IN (SELECT booking_id FROM booking_status_history)
LIMIT 10;

-- Insert sample payment methods (for users with completed bookings, only if they don't exist)
INSERT INTO payment_methods (user_id, payment_type, last_four, expiry_date, is_default, token_hash, metadata) 
SELECT DISTINCT b.user_id, 'credit_card', '1234', '12/25', true, 
 CONCAT('pm_', SUBSTRING(b.user_id, 1, 8)), '{"brand": "visa", "country": "US"}'::jsonb
FROM bookings b 
WHERE b.payment_status = 'completed' 
AND b.user_id NOT IN (SELECT user_id FROM payment_methods)
LIMIT 5;

-- Insert sample transactions (for completed bookings, only if they don't exist)
INSERT INTO transactions (booking_id, amount, currency, status, gateway_name, transaction_id, processed_at) 
SELECT b.id, b.total_amount, 'USD', 'completed', 'stripe', 
 CONCAT('txn_', SUBSTRING(b.id, 1, 8), '_', EXTRACT(EPOCH FROM NOW())::integer), NOW() 
FROM bookings b 
WHERE b.payment_status = 'completed' 
AND b.id NOT IN (SELECT booking_id FROM transactions)
LIMIT 5;

-- Update transactions with payment method IDs
UPDATE transactions t SET payment_method_id = pm.id 
FROM payment_methods pm, bookings b 
WHERE t.booking_id = b.id AND pm.user_id = b.user_id AND t.payment_method_id IS NULL;

-- Update bookings with transaction IDs
UPDATE bookings b SET transaction_id = t.id 
FROM transactions t WHERE b.id = t.booking_id AND b.transaction_id IS NULL;

-- Update bookings with payment method IDs
UPDATE bookings b SET payment_method_id = pm.id 
FROM payment_methods pm WHERE b.user_id = pm.user_id AND pm.is_default = true AND b.payment_method_id IS NULL;

COMMIT;
