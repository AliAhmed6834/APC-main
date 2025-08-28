export const productionConfig = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0',
    cors: {
      origin: process.env.FRONTEND_URL || 'https://airportparking.com',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false
    }
  },

  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'airport_parking_supplier',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'asd',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum number of connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  },

  // Payment Gateway Configuration
  payment: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      apiVersion: '2024-12-18.acacia'
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      mode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox'
    },
    supportedCurrencies: ['USD', 'GBP', 'EUR', 'CAD', 'AUD'],
    defaultCurrency: 'USD'
  },

  // Email Service Configuration
  email: {
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@airportparking.com',
      fromName: process.env.SENDGRID_FROM_NAME || 'Airport Parking Service'
    },
    templates: {
      welcome: 'd-1234567890abcdef',
      bookingConfirmation: 'd-1234567890abcdef',
      paymentConfirmation: 'd-1234567890abcdef',
      passwordReset: 'd-1234567890abcdef',
      bookingReminder: 'd-1234567890abcdef',
      bookingCancellation: 'd-1234567890abcdef'
    },
    retryAttempts: 3,
    retryDelay: 5000 // 5 seconds
  },

  // SMS Service Configuration
  sms: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER
    },
    retryAttempts: 2,
    retryDelay: 3000 // 3 seconds
  },

  // Authentication Configuration
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      expiresIn: '24h',
      refreshExpiresIn: '7d'
    },
    session: {
      secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    },
    replit: {
      clientId: process.env.REPLIT_CLIENT_ID,
      clientSecret: process.env.REPLIT_CLIENT_SECRET,
      redirectUri: process.env.REPLIT_REDIRECT_URI
    }
  },

  // Security Configuration
  security: {
    bcrypt: {
      saltRounds: 12
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'", "https://js.stripe.com", "https://www.paypal.com"],
          frameSrc: ["'self'", "https://js.stripe.com", "https://www.paypal.com"]
        }
      }
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'json' : 'dev',
    transports: ['console', 'file'],
    file: {
      filename: 'logs/app.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }
  },

  // Monitoring Configuration
  monitoring: {
    healthCheck: {
      enabled: true,
      interval: 30000, // 30 seconds
      timeout: 5000 // 5 seconds
    },
    metrics: {
      enabled: true,
      port: process.env.METRICS_PORT || 9090
    }
  },

  // Cache Configuration
  cache: {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: 'airport_parking:'
    },
    memory: {
      max: 100, // Maximum number of items in memory cache
      ttl: 60000 // Time to live in milliseconds (1 minute)
    }
  },

  // File Upload Configuration
  fileUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    uploadDir: 'uploads/',
    tempDir: 'temp/'
  },

  // External API Configuration
  externalApis: {
    googleMaps: {
      apiKey: process.env.GOOGLE_MAPS_API_KEY
    },
    weather: {
      apiKey: process.env.WEATHER_API_KEY,
      baseUrl: 'https://api.openweathermap.org/data/2.5'
    },
    currency: {
      apiKey: process.env.CURRENCY_API_KEY,
      baseUrl: 'https://api.exchangerate-api.com/v4'
    }
  },

  // Feature Flags
  features: {
    advancedSearch: true,
    mapIntegration: true,
    realTimePricing: true,
    loyaltyProgram: true,
    groupBookings: true,
    recurringBookings: true,
    supplierAnalytics: true,
    userAnalytics: true
  },

  // Business Logic Configuration
  business: {
    booking: {
      maxAdvanceBookingDays: 365, // 1 year
      minAdvanceBookingHours: 1, // 1 hour
      cancellationWindowHours: 24, // 24 hours before start
      refundPercentage: 0.9, // 90% refund
      maxGroupSize: 10
    },
    pricing: {
      currencyUpdateInterval: 3600000, // 1 hour
      priceUpdateInterval: 300000, // 5 minutes
      dynamicPricing: true
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: false,
      reminderHours: [24, 2], // 24 hours and 2 hours before
      autoReminders: true
    }
  },

  // Environment-specific overrides
  development: {
    logging: {
      level: 'debug',
      format: 'dev'
    },
    security: {
      helmet: {
        contentSecurityPolicy: false
      }
    },
    features: {
      realTimePricing: false,
      supplierAnalytics: false
    }
  },

  staging: {
    logging: {
      level: 'info',
      format: 'json'
    },
    features: {
      realTimePricing: true,
      supplierAnalytics: true
    }
  },

  production: {
    logging: {
      level: 'warn',
      format: 'json'
    },
    security: {
      helmet: {
        contentSecurityPolicy: true
      }
    },
    features: {
      realTimePricing: true,
      supplierAnalytics: true,
      loyaltyProgram: true
    }
  }
};

export default productionConfig;
