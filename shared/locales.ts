import type { LocaleInfo, SupportedLocale } from './schema';

// Locale configuration for different regions
export const LOCALE_CONFIG: Record<SupportedLocale, LocaleInfo> = {
  'en-US': {
    locale: 'en-US',
    currency: 'USD',
    region: 'US',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 12,
    distanceUnit: 'miles',
    terminology: {
      parking_lot: 'parking lot',
      car_park: 'parking lot',
      postcode: 'ZIP code',
      licence_plate: 'license plate',
      lorry: 'truck',
      motorway: 'highway',
      petrol: 'gas',
      boot: 'trunk',
      bonnet: 'hood',
      lift: 'elevator',
      queue: 'line',
      book: 'reserve',
      booking: 'reservation',
      cancelled: 'canceled',
      colour: 'color',
      centre: 'center',
      favourite: 'favorite',
    }
  },
  'en-GB': {
    locale: 'en-GB',
    currency: 'GBP',
    region: 'GB',
    timezone: 'Europe/London',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 24,
    distanceUnit: 'km',
    terminology: {
      parking_lot: 'car park',
      car_park: 'car park',
      postcode: 'postcode',
      licence_plate: 'number plate',
      lorry: 'lorry',
      motorway: 'motorway',
      petrol: 'petrol',
      boot: 'boot',
      bonnet: 'bonnet',
      lift: 'lift',
      queue: 'queue',
      book: 'book',
      booking: 'booking',
      cancelled: 'cancelled',
      colour: 'colour',
      centre: 'centre',
      favourite: 'favourite',
    }
  }
};

// UK Regulatory Compliance Configuration
export const UK_REGULATORY_CONFIG = {
  // Data Protection (GDPR)
  gdpr: {
    dataRetentionDays: 2555, // 7 years
    consentRequired: true,
    rightToErasure: true,
    dataPortability: true,
    privacyNoticeRequired: true,
  },
  // Financial Services
  financial: {
    pciCompliance: true,
    fraudPrevention: true,
    refundTimeframe: 14, // days
    disputeResolution: 'Financial Ombudsman Service',
  },
  // Consumer Rights
  consumer: {
    coolingOffPeriod: 14, // days
    cancellationRights: true,
    priceTransparency: true,
    termsClarity: true,
  },
  // Accessibility
  accessibility: {
    wcagCompliance: 'AA',
    disabledParkingRequired: true,
    assistanceAvailable: true,
    multiLanguageSupport: true,
  },
  // Environmental
  environmental: {
    evChargingRequired: true,
    carbonOffsetting: true,
    sustainableMaterials: true,
    wasteManagement: true,
  }
};

// UK Airport Codes and Information
export const UK_AIRPORTS = {
  'LHR': {
    name: 'London Heathrow Airport',
    city: 'London',
    region: 'Greater London',
    postcode: 'TW6 1EW',
    coordinates: [51.4700, -0.4543],
    terminals: ['T2', 'T3', 'T4', 'T5'],
    parkingZones: ['Short Stay', 'Long Stay', 'Business', 'Premium'],
    regulatoryZone: 'London',
    congestionCharge: true,
    ulezZone: true,
  },
  'LGW': {
    name: 'London Gatwick Airport',
    city: 'London',
    region: 'West Sussex',
    postcode: 'RH6 0NP',
    coordinates: [51.1537, -0.1821],
    terminals: ['North', 'South'],
    parkingZones: ['Short Stay', 'Long Stay', 'Premium', 'Valet'],
    regulatoryZone: 'London',
    congestionCharge: false,
    ulezZone: false,
  },
  'STN': {
    name: 'London Stansted Airport',
    city: 'London',
    region: 'Essex',
    postcode: 'CM24 1RW',
    coordinates: [51.8860, 0.2389],
    terminals: ['Main Terminal'],
    parkingZones: ['Short Stay', 'Long Stay', 'Premium', 'Meet & Greet'],
    regulatoryZone: 'London',
    congestionCharge: false,
    ulezZone: false,
  },
  'LTN': {
    name: 'London Luton Airport',
    city: 'London',
    region: 'Bedfordshire',
    postcode: 'LU2 9QT',
    coordinates: [51.8747, -0.3683],
    terminals: ['Main Terminal'],
    parkingZones: ['Short Stay', 'Long Stay', 'Premium', 'Valet'],
    regulatoryZone: 'London',
    congestionCharge: false,
    ulezZone: false,
  },
  'LCY': {
    name: 'London City Airport',
    city: 'London',
    region: 'Greater London',
    postcode: 'E16 2PX',
    coordinates: [51.5053, 0.0553],
    terminals: ['Main Terminal'],
    parkingZones: ['Short Stay', 'Long Stay', 'Premium'],
    regulatoryZone: 'London',
    congestionCharge: true,
    ulezZone: true,
  },
  'MAN': {
    name: 'Manchester Airport',
    city: 'Manchester',
    region: 'Greater Manchester',
    postcode: 'M90 1QX',
    coordinates: [53.3537, -2.2750],
    terminals: ['T1', 'T2', 'T3'],
    parkingZones: ['Short Stay', 'Long Stay', 'Premium', 'Valet'],
    regulatoryZone: 'Manchester',
    congestionCharge: false,
    ulezZone: false,
  },
  'BHX': {
    name: 'Birmingham Airport',
    city: 'Birmingham',
    region: 'West Midlands',
    postcode: 'B26 3QJ',
    coordinates: [52.4539, -1.7480],
    terminals: ['Main Terminal'],
    parkingZones: ['Short Stay', 'Long Stay', 'Premium', 'Meet & Greet'],
    regulatoryZone: 'Birmingham',
    congestionCharge: false,
    ulezZone: false,
  },
  'EDI': {
    name: 'Edinburgh Airport',
    city: 'Edinburgh',
    region: 'Scotland',
    postcode: 'EH12 9DN',
    coordinates: [55.9500, -3.3725],
    terminals: ['Main Terminal'],
    parkingZones: ['Short Stay', 'Long Stay', 'Premium', 'Valet'],
    regulatoryZone: 'Scotland',
    congestionCharge: false,
    ulezZone: false,
  },
  'BRS': {
    name: 'Bristol Airport',
    city: 'Bristol',
    region: 'Somerset',
    postcode: 'BS48 3DY',
    coordinates: [51.3829, -2.7179],
    terminals: ['Main Terminal'],
    parkingZones: ['Short Stay', 'Long Stay', 'Premium'],
    regulatoryZone: 'Bristol',
    congestionCharge: false,
    ulezZone: false,
  },
  'NCL': {
    name: 'Newcastle Airport',
    city: 'Newcastle',
    region: 'Tyne and Wear',
    postcode: 'NE13 8BZ',
    coordinates: [55.0375, -1.6917],
    terminals: ['Main Terminal'],
    parkingZones: ['Short Stay', 'Long Stay', 'Premium'],
    regulatoryZone: 'Newcastle',
    congestionCharge: false,
    ulezZone: false,
  }
};

// Default messages for React Intl
export const DEFAULT_MESSAGES = {
  'en-US': {
    'app.name': 'Airport Parking Compare',
    'app.tagline': 'Find and book the best airport parking deals',
    
    // Search and results
    'search.airport.placeholder': 'Enter airport code (e.g., LAX)',
    'search.dates.start': 'Drop-off Date',
    'search.dates.end': 'Pick-up Date',
    'search.button': 'Search Parking',
    'results.found': '{count, plural, =0 {No parking lots} =1 {1 parking lot} other {# parking lots}} found',
    'results.sort.price': 'Price (Low to High)',
    'results.sort.distance': 'Distance',
    'results.sort.rating': 'Rating',
    
    // Pricing and currency
    'price.per.day': '{price}/day',
    'price.total': 'Total: {price}',
    'price.includes.tax': 'Includes tax',
    'price.plus.tax': 'Plus {tax}% tax',
    
    // Distance and units
    'distance.from.terminal': '{distance} miles from terminal',
    'shuttle.every': 'Shuttle every {minutes} minutes',
    
    // Booking
    'booking.title': 'Complete Your Reservation',
    'booking.vehicle.info': 'Vehicle Information',
    'booking.vehicle.make': 'Make',
    'booking.vehicle.model': 'Model',
    'booking.vehicle.color': 'Color',
    'booking.vehicle.license': 'License Plate',
    'booking.confirm': 'Confirm Reservation',
    
    // Features and amenities
    'features.covered': 'Covered Parking',
    'features.ev.charging': 'EV Charging',
    'features.car.wash': 'Car Wash',
    'features.security': 'Security Patrol',
    'features.cctv': 'CCTV Monitoring',
    'features.shuttle': 'Shuttle Included',
    
    // Status and notifications
    'status.confirmed': 'Confirmed',
    'status.cancelled': 'Canceled',
    'status.completed': 'Completed',
    'notification.booking.confirmed': 'Your reservation has been confirmed',
    'notification.booking.cancelled': 'Your reservation has been canceled',
  },
  'en-GB': {
    'app.name': 'Airport Parking Compare',
    'app.tagline': 'Find and book the best airport car park deals',
    
    // Search and results
    'search.airport.placeholder': 'Enter airport code (e.g., LHR)',
    'search.dates.start': 'Drop-off Date',
    'search.dates.end': 'Collection Date',
    'search.button': 'Search Car Parks',
    'results.found': '{count, plural, =0 {No car parks} =1 {1 car park} other {# car parks}} found',
    'results.sort.price': 'Price (Low to High)',
    'results.sort.distance': 'Distance',
    'results.sort.rating': 'Rating',
    
    // Pricing and currency
    'price.per.day': '£{price}/day',
    'price.total': 'Total: £{price}',
    'price.includes.vat': 'Includes VAT',
    'price.plus.vat': 'Plus {tax}% VAT',
    
    // Distance and units
    'distance.from.terminal': '{distance} km from terminal',
    'shuttle.every': 'Shuttle every {minutes} minutes',
    
    // Booking
    'booking.title': 'Complete Your Booking',
    'booking.vehicle.info': 'Vehicle Details',
    'booking.vehicle.make': 'Make',
    'booking.vehicle.model': 'Model',
    'booking.vehicle.colour': 'Colour',
    'booking.vehicle.license': 'Number Plate',
    'booking.confirm': 'Confirm Booking',
    
    // Features and amenities
    'features.covered': 'Covered Car Park',
    'features.ev.charging': 'EV Charging',
    'features.car.wash': 'Car Wash',
    'features.security': 'Security Patrol',
    'features.cctv': 'CCTV Monitoring',
    'features.shuttle': 'Shuttle Included',
    
    // Status and notifications
    'status.confirmed': 'Confirmed',
    'status.cancelled': 'Cancelled',
    'status.completed': 'Completed',
    'notification.booking.confirmed': 'Your booking has been confirmed',
    'notification.booking.cancelled': 'Your booking has been cancelled',
    
    // UK-specific regulatory messages
    'regulatory.gdpr.consent': 'By continuing, you consent to our use of cookies and data processing in accordance with GDPR',
    'regulatory.vat.included': 'All prices include VAT at 20%',
    'regulatory.consumer.rights': 'You have 14 days to cancel this booking under UK consumer law',
    'regulatory.accessibility': 'This service meets WCAG AA accessibility standards',
    'regulatory.ulez.warning': 'This location is within the Ultra Low Emission Zone. Additional charges may apply.',
    'regulatory.congestion.charge': 'This location is within the London Congestion Charge zone.',
  }
};

// Country detection from IP and browser
export const COUNTRY_LOCALE_MAP: Record<string, SupportedLocale> = {
  'US': 'en-US',
  'GB': 'en-GB',
  'UK': 'en-GB', // Alternative country code
};

// Currency symbols
export const CURRENCY_SYMBOLS: Record<string, string> = {
  'USD': '$',
  'GBP': '£',
  'EUR': '€',
};

// UK Regulatory Compliance Messages
export const UK_COMPLIANCE_MESSAGES = {
  gdpr: {
    consent: 'We use cookies and process your data in accordance with GDPR regulations',
    rights: 'You have the right to access, rectify, and erase your personal data',
    retention: 'We retain your data for 7 years as required by UK law',
  },
  financial: {
    security: 'All payments are processed securely with PCI DSS compliance',
    protection: 'Your financial information is protected under UK financial regulations',
    disputes: 'Disputes can be resolved through the Financial Ombudsman Service',
  },
  consumer: {
    rights: 'You have 14 days to cancel under UK consumer law',
    transparency: 'All prices include VAT and are fully transparent',
    terms: 'Terms and conditions are clearly displayed and easily accessible',
  },
  accessibility: {
    standards: 'This service meets WCAG AA accessibility standards',
    assistance: 'Assistance is available for disabled users',
    support: 'Multi-language support including Welsh and Gaelic',
  }
};