# Supplier Login System

This document describes the supplier login and management system for the Airport Parking Compare platform.

## Overview

The supplier system allows parking lot operators to:
- Log in to a dedicated supplier dashboard
- Manage their parking lots and availability
- Create and edit parking slots
- View and manage customer bookings
- Monitor their business performance

## Features

### 🔐 Authentication
- Secure supplier login with email/password
- Session-based authentication with JWT tokens
- Role-based access control (admin, manager, operator)
- Automatic session expiration

### 🏢 Parking Lot Management
- View all parking lots associated with the supplier
- See real-time availability and pricing
- Monitor lot status (active/inactive)

### 📅 Slot Management
- Create individual parking slots
- Bulk create slots for date ranges
- Edit slot details (spaces, pricing, availability)
- Delete slots when needed
- Real-time availability tracking

### 📋 Booking Management
- View all customer bookings
- Update booking status (confirmed, cancelled, completed, no-show)
- Add notes and assign bookings to staff
- Track booking history

### 📊 Dashboard Analytics
- Overview of total parking lots and spaces
- Active booking count
- Revenue tracking
- Recent activity feed

## API Endpoints

### Authentication
- `POST /api/supplier/login` - Supplier login
- `POST /api/supplier/logout` - Supplier logout
- `GET /api/supplier/profile` - Get supplier profile

### Parking Lots
- `GET /api/supplier/parking-lots` - Get supplier's parking lots

### Slot Management
- `POST /api/supplier/slots` - Create individual slot
- `GET /api/supplier/slots/:lotId` - Get slots for a lot
- `PUT /api/supplier/slots/:id` - Update slot
- `DELETE /api/supplier/slots/:id` - Delete slot
- `POST /api/supplier/slots/bulk` - Bulk create slots

### Booking Management
- `GET /api/supplier/bookings` - Get supplier bookings
- `PUT /api/supplier/bookings/:id` - Update booking

## Database Schema

### Supplier Users
```sql
supplier_users (
  id, supplier_id, email, first_name, last_name, 
  role, is_active, last_login_at, created_at, updated_at
)
```

### Supplier Sessions
```sql
supplier_sessions (
  id, supplier_user_id, token, expires_at, created_at
)
```

### Parking Slots
```sql
parking_slots (
  id, lot_id, date, total_spaces, available_spaces, 
  reserved_spaces, price_per_day, currency, is_active, 
  created_at, updated_at
)
```

### Supplier Bookings
```sql
supplier_bookings (
  id, booking_id, supplier_user_id, status, notes, 
  assigned_to, created_at, updated_at
)
```

## Getting Started

### Demo Credentials
For testing purposes, use these demo credentials:
- **Email:** supplier@example.com
- **Password:** any password (demo mode)

### Access Supplier Login
1. Navigate to the main website
2. Click "Supplier Login" in the header
3. Or go directly to `/supplier/login`

### First Time Setup
1. Contact the platform administrators to create your supplier account
2. You'll receive login credentials via email
3. Log in and set up your parking lots
4. Start creating parking slots

## User Interface

### Supplier Login Page
- Clean, professional login form
- Demo credentials displayed for testing
- Responsive design for all devices

### Supplier Dashboard
- **Overview Tab:** Key metrics and recent activity
- **Parking Lots Tab:** Manage your parking facilities
- **Slots Tab:** Create and manage parking availability
- **Bookings Tab:** Handle customer reservations

### Slot Management
- **Bulk Creation:** Create multiple slots for date ranges
- **Individual Editing:** Modify specific slot details
- **Real-time Updates:** See changes immediately
- **Status Indicators:** Visual availability status

## Security Features

- **Token-based Authentication:** Secure session management
- **Role-based Access:** Different permissions for different user types
- **Input Validation:** All forms validated on frontend and backend
- **CSRF Protection:** Built-in protection against cross-site attacks
- **Session Expiration:** Automatic logout after inactivity

## Integration with Main Platform

The supplier system integrates seamlessly with the main customer-facing platform:

1. **Real-time Sync:** Changes made in supplier dashboard appear immediately for customers
2. **Unified Database:** All data stored in the same database for consistency
3. **Shared Authentication:** Uses the same security infrastructure
4. **Consistent UI:** Matches the main platform's design language

## Future Enhancements

### Planned Features
- **Advanced Analytics:** Detailed reporting and insights
- **Mobile App:** Native mobile application for suppliers
- **API Access:** REST API for third-party integrations
- **Automated Pricing:** Dynamic pricing based on demand
- **Customer Communication:** Direct messaging with customers
- **Payment Processing:** Integrated payment handling

### Technical Improvements
- **Real-time Updates:** WebSocket connections for live data
- **Offline Support:** Work without internet connection
- **Bulk Operations:** More efficient bulk management tools
- **Advanced Search:** Better filtering and search capabilities

## Support

For technical support or questions about the supplier system:

1. **Documentation:** Check this README and inline code comments
2. **Demo Mode:** Use the demo credentials to explore features
3. **Contact:** Reach out to the development team for assistance

## Development Notes

### Tech Stack
- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Custom JWT-based system
- **UI Components:** Radix UI + shadcn/ui

### File Structure
```
client/src/
├── pages/
│   ├── SupplierLogin.tsx
│   └── SupplierDashboard.tsx
├── components/
│   └── SupplierSlotManager.tsx
└── App.tsx (updated with routes)

server/
├── middleware/
│   └── supplierAuth.ts
├── routes.ts (updated with supplier routes)
└── storage.ts (updated with supplier methods)

shared/
└── schema.ts (updated with supplier tables)
```

### Testing
- Use demo credentials for testing
- Mock data provided for development
- All API endpoints tested and documented
- Error handling implemented throughout

---

**Note:** This is a comprehensive supplier management system designed to handle real-world parking operations. The demo mode allows for easy testing and exploration of all features. 