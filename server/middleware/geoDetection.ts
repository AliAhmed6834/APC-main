import type { Request, Response, NextFunction } from "express";
// Note: MaxMind would be imported differently in production
// import maxmind from 'maxmind';
// import Negotiator from 'negotiator'; // Not used currently
import { COUNTRY_LOCALE_MAP, LOCALE_CONFIG } from '@shared/locales';
import type { SupportedLocale } from '@shared/schema';

// MaxMind database path (would be downloaded/configured in production)
const GEOIP_DATABASE_PATH = './GeoLite2-Country.mmdb';

// Extended Request interface to include locale information
declare global {
  namespace Express {
    interface Request {
      locale: SupportedLocale;
      region: string;
      currency: string;
      clientIP: string;
      detectedCountry?: string;
    }
  }
}

/**
 * Middleware to detect user's locale based on IP geolocation and browser preferences
 */
export async function geoDetectionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get client IP address
    const clientIP = getClientIP(req);
    req.clientIP = clientIP;

    // Try to get locale from cookie first (user preference)
    const cookieLocale = req.cookies?.locale as SupportedLocale;
    if (cookieLocale && LOCALE_CONFIG[cookieLocale]) {
      setLocaleContext(req, cookieLocale);
      return next();
    }

    // Detect country from IP geolocation with timeout protection
    const detectedCountry = await detectCountryFromIP(clientIP) || 'US';
    req.detectedCountry = detectedCountry;

    // Get browser language preferences
    const acceptLanguage = req.headers['accept-language'] || '';
    const browserLocales = parseBrowserLocales(acceptLanguage);

    // Determine best locale match
    const locale = determineLocale(detectedCountry, browserLocales);
    setLocaleContext(req, locale);

    next();
  } catch (error) {
    console.error('Geo-detection middleware error:', error);
    // Fallback to default US locale
    setLocaleContext(req, 'en-US');
    next();
  }
}

/**
 * Extract client IP address from request
 */
function getClientIP(req: Request): string {
  // Check various headers for real IP (useful behind proxies/CDN)
  const xForwardedFor = req.headers['x-forwarded-for'];
  const xRealIP = req.headers['x-real-ip'];
  const cfConnectingIP = req.headers['cf-connecting-ip']; // Cloudflare
  
  if (typeof xForwardedFor === 'string') {
    return xForwardedFor.split(',')[0].trim();
  }
  
  if (typeof xRealIP === 'string') {
    return xRealIP;
  }
  
  if (typeof cfConnectingIP === 'string') {
    return cfConnectingIP;
  }
  
  return req.socket.remoteAddress || '127.0.0.1';
}

/**
 * Detect country from IP address using MaxMind GeoIP2
 * Fallback to simple detection for development
 */
async function detectCountryFromIP(ip: string): Promise<string | undefined> {
  // Skip IP detection for local/development IPs
  if (ip === '127.0.0.1' || ip === '::1' || ip?.startsWith('192.168.') || ip?.startsWith('10.')) {
    return 'US'; // Default for local development
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Airport-Parking-Compare/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return 'US'; // Fallback silently
    }
    
    const data = await response.json();
    return data.countryCode || 'US';
  } catch (error) {
    // Silently fall back to US without logging to prevent console spam
    return 'US';
  }
}

/**
 * Parse browser Accept-Language header
 */
function parseBrowserLocales(acceptLanguage: string): string[] {
  if (!acceptLanguage) return [];
  
  return acceptLanguage
    .split(',')
    .map(lang => {
      const [locale] = lang.trim().split(';');
      return locale;
    })
    .filter(Boolean);
}

/**
 * Determine best locale based on country and browser preferences
 */
function determineLocale(
  detectedCountry?: string,
  browserLocales: string[] = []
): SupportedLocale {
  // First, try country-based detection
  if (detectedCountry && COUNTRY_LOCALE_MAP[detectedCountry]) {
    return COUNTRY_LOCALE_MAP[detectedCountry];
  }

  // Then try browser language matching
  const supportedLocales = Object.keys(LOCALE_CONFIG) as SupportedLocale[];
  
  try {
    // Simple locale matching without external dependency
    for (const browserLocale of browserLocales) {
      if (browserLocale.startsWith('en-GB') || browserLocale === 'en-gb') {
        return 'en-GB';
      }
      if (browserLocale.startsWith('en-US') || browserLocale === 'en-us' || browserLocale === 'en') {
        return 'en-US';
      }
    }
    return 'en-US'; // Default fallback
  } catch (error) {
    console.warn('Locale matching failed:', error);
    return 'en-US';
  }
}

/**
 * Set locale context on request object
 */
function setLocaleContext(req: Request, locale: SupportedLocale) {
  const config = LOCALE_CONFIG[locale];
  req.locale = locale;
  req.region = config.region;
  req.currency = config.currency;
}

/**
 * Middleware to handle manual locale switching
 */
export function localeOverrideMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestedLocale = req.query.locale as SupportedLocale;
  
  if (requestedLocale && LOCALE_CONFIG[requestedLocale]) {
    // Set cookie to persist user preference
    res.cookie('locale', requestedLocale, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      httpOnly: false, // Allow client-side access for UI
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    setLocaleContext(req, requestedLocale);
  }
  
  next();
}