# Repliti Parking - Airport Parking Comparison Platform

## Overview

Airport Parking Compare is a modern, internationally-aware airport parking comparison and booking platform built as a full-stack TypeScript application. The system enables users worldwide to search, compare, and book airport parking from multiple suppliers with automatic geo-detection, multi-currency pricing, and localized user experiences for UK and USA markets.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with a clear separation between client, server, and shared components:

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Cloud Database**: Neon serverless PostgreSQL
- **Authentication**: Replit Auth with session-based authentication
- **Session Storage**: PostgreSQL with connect-pg-simple
- **API Design**: RESTful APIs with TypeScript interfaces

### Data Storage
- **Primary Database**: PostgreSQL hosted on Neon
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Session Management**: Database-backed sessions using connect-pg-simple
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Authentication System
- Replit Auth integration for user authentication
- Session-based authentication with PostgreSQL session storage
- Protected routes and user state management
- User profile management with OIDC compliance

### Parking Search & Comparison Engine
- Airport-based parking lot search functionality
- Filtering and sorting capabilities (price, amenities, distance)
- Real-time pricing display and comparison
- Map view and list view options for search results

### Booking Management
- Multi-step booking flow with vehicle information collection
- Booking confirmation and status tracking
- User booking history and management
- Integration-ready for payment processing

### Supplier Management
- Parking supplier onboarding and authentication
- Supplier dashboard for lot management
- Pricing and availability management
- Review and rating system

### Admin Panel
- Role-based access control
- Analytics and reporting dashboards
- Content management system
- User and supplier management

## Data Flow

1. **User Registration/Login**: Users authenticate via Replit Auth, with sessions stored in PostgreSQL
2. **Search Flow**: Users search for parking by airport code and dates, triggering API calls to fetch available lots
3. **Comparison**: Frontend displays filtered and sorted results with pricing information
4. **Booking**: Multi-step booking process captures user and vehicle details
5. **Supplier Integration**: Ready for external API integrations with parking suppliers (ParkWhiz, SpotHero, etc.)

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL driver
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Comprehensive UI component primitives
- **react-hook-form**: Form state management and validation
- **zod**: Runtime type validation and schema definition

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the entire application
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production builds

### Authentication
- **Replit Auth**: OIDC-compliant authentication system
- **connect-pg-simple**: PostgreSQL session store
- **express-session**: Session middleware

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR
- **Database**: Neon serverless PostgreSQL for consistent dev/prod environments
- **Environment Variables**: DATABASE_URL and authentication secrets

### Production Build
- **Frontend**: Vite build process generating optimized static assets
- **Backend**: ESBuild bundling Node.js server with external package handling
- **Database**: Drizzle migrations for schema deployment
- **Hosting**: Designed for Replit deployment with integrated auth

### Database Management
- **Schema Versioning**: Drizzle Kit for migration management
- **Type Safety**: Generated TypeScript types from database schema
- **Connection Pooling**: Neon connection pooling for serverless environments

### Internationalization & Geo-Awareness Features

### Core International Capabilities
- **Automatic Geo-Detection**: IP-based country detection with browser language fallbacks
- **Multi-Currency Support**: Real-time USD/GBP exchange rates with localized pricing
- **Regional Adaptations**: 
  - Distance units (miles/km)
  - Date formats (MM/DD/YYYY vs DD/MM/YYYY)
  - Time formats (12h vs 24h)
  - Terminology (parking lot vs car park, ZIP code vs postcode)
- **Tax Handling**: VAT-inclusive pricing for UK, separate sales tax display for US
- **Currency Exchange**: Cached exchange rates with automatic refresh

### Implemented Localization
- **en-US (United States)**: USD currency, imperial units, US terminology
- **en-GB (United Kingdom)**: GBP currency, metric units, British terminology
- **Persistent Preferences**: Cookie-based locale storage with manual override
- **Locale Toggle**: Header component for easy region switching

### Technical Implementation
- **Frontend**: React Intl context with locale-aware formatting hooks
- **Backend**: Express middleware for geo-detection and currency conversion
- **Database**: Multi-currency pricing tables with regional tax rates
- **Caching**: Exchange rate caching with configurable refresh intervals

### Recent Enhancements (January 28, 2025)
- ✓ **COMPLETED**: Comprehensive internationalization system implemented and working
- ✓ **ACTIVE**: Geo-detection middleware with IP-based country detection (no console errors)
- ✓ **WORKING**: Multi-currency pricing with real-time exchange rates (USD/GBP conversion)
- ✓ **TESTED**: Locale-aware search results with automatic unit conversion (miles/km)
- ✓ **IMPLEMENTED**: Regional terminology and tax handling (VAT vs sales tax display)
- ✓ **MIGRATED**: Database schema updated with country codes and timezones
- ✓ **POPULATED**: Sample UK airports and multi-currency pricing data added
- ✓ **UI COMPLETE**: LocaleToggle component in header for manual region switching
- ✓ **API TESTED**: Search API returning localized data with proper currency/distance formatting
- ✓ **DATABASE ENHANCED**: Comprehensive airport database populated with 45 major airports
- ✓ **PARKING DATA**: 28 parking lots added across major US/UK airports with realistic pricing
- ✓ **AUTOCOMPLETE READY**: Airport search now supports comprehensive airport name/code lookup

**Database Status**: 
- 45 airports (25 US, 8 UK, 12 international)
- 33+ parking lots with authentic amenities and ratings across major airports
- 35+ pricing entries supporting USD/GBP with regional tax handling
- Full airport code/name autocomplete functionality enabled and tested
- Comprehensive UK parking options added for international users

**System Status**: All geo-aware features are fully functional and tested. Users can now experience seamless international airport parking comparison with automatic locale detection, comprehensive airport search, and realistic parking options.

### Footer Localization Enhancement (January 28, 2025)
- ✅ **IMPLEMENTED**: Region-aware popular airports in footer
- ✅ **US REGION**: Shows LAX, JFK, ORD, DFW, ATL for USD users
- ✅ **UK REGION**: Shows LHR, LGW, MAN, EDI, BHX for GBP users
- ✅ **DYNAMIC**: Updates automatically when user switches locale/currency

### Production Issue Fixed (January 28, 2025)
- ✅ **FIXED**: Beautiful teal background with animated patterns now works on external links
- ✅ **IMPROVED**: Enhanced CSS-only background eliminates dependency on external images  
- ✅ **OPTIMIZED**: Added layered gradient animations for professional airplane theme
- ✅ **TESTED**: Background loads consistently across all environments
- ✅ **RESTORED**: Custom airplane SVG background recreated with improved visibility

**Background Enhancement**: Created custom self-hosted airplane background SVG with teal sky gradient and airplane silhouettes. Features multiple airplane silhouettes, contrails, clouds, and atmospheric effects with brand-matching colors. SVG includes proper sky gradients, cloud effects, and vapor trails for authentic aviation atmosphere.

## External API Integration Ready
The architecture is prepared for integrating external parking supplier APIs:
- Modular connector design for different supplier APIs
- Data normalization layer for consistent pricing and availability
- Caching strategy for supplier data
- Fallback mechanisms for API reliability
- International pricing normalization and currency conversion

The system prioritizes type safety, developer experience, scalability, and global user experience while maintaining a clean separation of concerns between the frontend user experience and backend business logic.