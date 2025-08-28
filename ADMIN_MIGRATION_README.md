# Admin Dashboard Migration - 0003_admin_dashboard_schema

## Overview

This migration adds comprehensive support for the AdminDashboard functionality, including admin user management, analytics tables, system settings, and audit logging.

## What Was Added

### New Tables

#### 1. **Admin Users** (`admin_users`)
- Separate table for administrative users with elevated privileges
- Supports roles: `admin`, `super_admin`, `support`
- Includes permissions system via JSON field
- Tracks last login and activity

#### 2. **Admin Sessions** (`admin_sessions`)
- Manages admin authentication sessions
- Includes IP address and user agent tracking
- Token-based authentication with expiration

#### 3. **Admin Activity Logs** (`admin_activity_logs`)
- Comprehensive audit trail of all admin actions
- Tracks create, update, delete, view, export operations
- Stores old and new values for change tracking
- Includes metadata and context information

#### 4. **Analytics Tables**
- **Customer Analytics** (`customer_analytics`): Customer metrics and behavior
- **Supplier Analytics** (`supplier_analytics`): Supplier performance metrics
- **Airport Analytics** (`airport_analytics`): Airport-specific metrics
- **Payment Analytics** (`payment_analytics`): Payment processing metrics
- **Booking Analytics** (`booking_analytics`): Booking trends and patterns

#### 5. **System Management**
- **System Settings** (`system_settings`): Configurable platform settings
- **Admin Notifications** (`admin_notifications`): Admin alerts and notifications
- **Admin Reports** (`admin_reports`): Generated reports and analytics data

### Enhanced Existing Tables

#### Users Table
- Added `is_admin` boolean field
- Added `admin_role` field
- Added `last_activity` timestamp
- Added `account_status` field

#### Parking Suppliers Table
- Added `admin_notes` text field
- Added `verification_status` field
- Added `verification_date` and `verification_by` fields

#### Airports Table
- Added `admin_notes` text field
- Added `priority_level` field
- Added `maintenance_mode` boolean field

#### Bookings Table
- Added `admin_notes` text field
- Added `flagged_for_review` boolean field
- Added `flag_reason` and `flagged_by` fields

### Performance Indexes
- Created indexes for all admin queries
- Optimized for dashboard performance
- Supports filtering and sorting operations

## Default Data

### Admin User
- **Email**: `admin@airportparking.com`
- **Role**: `super_admin`
- **Status**: Active

⚠️ **Important**: Change the default password after first login!

### System Settings
Pre-configured with common platform settings:
- Platform name and version
- Security settings (session timeout, login attempts)
- Payment gateway configurations
- Email and SMS settings
- Analytics and content moderation settings

## How to Apply

### Option 1: Using the Migration Script
```bash
node run-admin-migration.js
```

### Option 2: Manual Drizzle Command
```bash
npx drizzle-kit push
```

### Option 3: Direct SQL Execution
```bash
psql -d your_database -f drizzle/0003_admin_dashboard_schema.sql
```

## Post-Migration Steps

### 1. Verify Tables Created
```sql
-- Check if all tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'admin_%' OR table_name LIKE '%_analytics';
```

### 2. Verify Default Data
```sql
-- Check admin user creation
SELECT * FROM admin_users WHERE email = 'admin@airportparking.com';

-- Check system settings
SELECT COUNT(*) FROM system_settings;
```

### 3. Update Admin Dashboard
The AdminDashboard component should now work with the new database structure. Make sure to:
- Update API endpoints to use new tables
- Implement proper admin authentication
- Use analytics tables for dashboard metrics

## Usage Examples

### Creating an Admin User
```typescript
import { adminUsers } from './shared/schema';

const newAdmin = await db.insert(adminUsers).values({
  email: 'support@company.com',
  firstName: 'Support',
  lastName: 'Agent',
  role: 'support',
  permissions: { canViewUsers: true, canEditBookings: false }
});
```

### Logging Admin Activity
```typescript
import { adminActivityLogs } from './shared/schema';

await db.insert(adminActivityLogs).values({
  adminUserId: adminId,
  actionType: 'update',
  tableName: 'users',
  recordId: userId,
  oldValues: { status: 'active' },
  newValues: { status: 'suspended' },
  metadata: { reason: 'Policy violation' }
});
```

### Getting Analytics Data
```typescript
import { customerAnalytics } from './shared/schema';

const customerMetrics = await db
  .select()
  .from(customerAnalytics)
  .where(eq(customerAnalytics.customerId, userId));
```

## Security Considerations

### Admin Authentication
- Implement proper password hashing for admin users
- Use secure session management
- Implement role-based access control (RBAC)

### Audit Logging
- All admin actions are automatically logged
- Sensitive data changes are tracked
- IP addresses and user agents are recorded

### Data Access
- Admin tables are separate from user tables
- Proper foreign key constraints maintain data integrity
- Indexes optimize query performance

## Troubleshooting

### Common Issues

1. **Migration Fails with Foreign Key Error**
   - Ensure all referenced tables exist
   - Check table creation order in migration

2. **Permission Denied Errors**
   - Verify database user has CREATE TABLE privileges
   - Check if tables already exist

3. **Index Creation Fails**
   - Ensure sufficient disk space
   - Check for conflicting index names

### Rollback
If you need to rollback this migration:
```sql
-- Drop new tables (in reverse order)
DROP TABLE IF EXISTS admin_reports;
DROP TABLE IF EXISTS admin_notifications;
DROP TABLE IF EXISTS system_settings;
-- ... continue with other tables

-- Remove added columns from existing tables
ALTER TABLE users DROP COLUMN IF EXISTS is_admin;
ALTER TABLE users DROP COLUMN IF EXISTS admin_role;
-- ... continue with other columns
```

## Support

For issues with this migration:
1. Check the migration logs
2. Verify database connectivity
3. Ensure Drizzle is properly configured
4. Review the schema file for syntax errors

## Next Steps

After applying this migration:
1. Implement admin authentication system
2. Create admin API endpoints
3. Update frontend to use new analytics data
4. Configure system settings for your environment
5. Set up admin user accounts for your team
