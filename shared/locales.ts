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
    'price.includes.tax': 'Includes VAT',
    'price.plus.tax': 'Plus {tax}% VAT',
    
    // Distance and units
    'distance.from.terminal': '{distance} km from terminal',
    'shuttle.every': 'Shuttle every {minutes} minutes',
    
    // Booking
    'booking.title': 'Complete Your Booking',
    'booking.vehicle.info': 'Vehicle Details',
    'booking.vehicle.make': 'Make',
    'booking.vehicle.model': 'Model',
    'booking.vehicle.color': 'Colour',
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