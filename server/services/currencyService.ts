import { db } from '../db';
import { exchangeRates } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Exchange rate API configuration
const EXCHANGE_RATE_API_URL = 'https://api.exchangerate-api.com/v4/latest';
const CACHE_DURATION_HOURS = 6; // Refresh rates every 6 hours

export class CurrencyService {
  /**
   * Get current exchange rate between two currencies
   */
  static async getExchangeRate(from: string, to: string): Promise<number> {
    if (from === to) return 1;
    
    let cached: any[] = [];

    try {
      // Check cache first
      cached = await db
        .select()
        .from(exchangeRates)
        .where(
          and(
            eq(exchangeRates.baseCurrency, from),
            eq(exchangeRates.targetCurrency, to),
            eq(exchangeRates.isActive, true)
          )
        )
        .limit(1);

      if (cached.length > 0) {
        const rate = cached[0];
        const lastUpdated = rate.lastUpdated || new Date(0);
        const ageHours = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
        
        if (ageHours < CACHE_DURATION_HOURS) {
          return parseFloat(rate.rate);
        }
      }

      // Fetch fresh rate from API
      const freshRate = await this.fetchExchangeRate(from, to);
      
      // Update cache
      await this.updateExchangeRateCache(from, to, freshRate);
      
      return freshRate;
    } catch (error) {
      console.error('Failed to get exchange rate:', error);
      
      // Fallback to cached rate even if expired
      if (cached.length > 0) {
        console.warn(`Using expired exchange rate for ${from}->${to}`);
        return parseFloat(cached[0].rate);
      }
      
      // Last resort: return 1 (no conversion)
      console.error(`No exchange rate available for ${from}->${to}, using 1:1`);
      return 1;
    }
  }

  /**
   * Convert amount from one currency to another
   */
  static async convertCurrency(
    amount: number,
    from: string,
    to: string
  ): Promise<number> {
    const rate = await this.getExchangeRate(from, to);
    return Math.round(amount * rate * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get localized pricing for a parking lot
   */
  static async getLocalizedPricing(
    basePrice: number,
    baseCurrency: string,
    targetCurrency: string,
    region: string
  ): Promise<{
    price: number;
    currency: string;
    formatted: string;
    includesTax: boolean;
    taxRate?: number;
  }> {
    const convertedPrice = await this.convertCurrency(basePrice, baseCurrency, targetCurrency);
    
    // Apply regional tax handling
    const taxInfo = this.getTaxInfo(region);
    const finalPrice = taxInfo.includesTax 
      ? convertedPrice * (1 + taxInfo.rate) 
      : convertedPrice;

    return {
      price: Math.round(finalPrice * 100) / 100,
      currency: targetCurrency,
      formatted: this.formatCurrency(finalPrice, targetCurrency, region),
      includesTax: taxInfo.includesTax,
      taxRate: taxInfo.rate
    };
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number, currency: string, locale: string): string {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency;
      return `${symbol}${amount.toFixed(2)}`;
    }
  }

  /**
   * Fetch exchange rate from external API
   */
  private static async fetchExchangeRate(from: string, to: string): Promise<number> {
    // Note: In production, you'd use a paid service like Open Exchange Rates
    // with API key for better reliability and rate limits
    
    const response = await fetch(`${EXCHANGE_RATE_API_URL}/${from}`);
    
    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.rates || !data.rates[to]) {
      throw new Error(`Exchange rate not available for ${from} to ${to}`);
    }
    
    return data.rates[to];
  }

  /**
   * Update exchange rate cache in database
   */
  private static async updateExchangeRateCache(
    from: string,
    to: string,
    rate: number
  ): Promise<void> {
    try {
      // Deactivate old rates
      await db
        .update(exchangeRates)
        .set({ isActive: false })
        .where(
          and(
            eq(exchangeRates.baseCurrency, from),
            eq(exchangeRates.targetCurrency, to)
          )
        );

      // Insert new rate
      await db.insert(exchangeRates).values({
        baseCurrency: from,
        targetCurrency: to,
        rate: rate.toString(),
        provider: 'exchangerate-api',
        lastUpdated: new Date(),
        isActive: true
      });
    } catch (error) {
      console.error('Failed to update exchange rate cache:', error);
    }
  }

  /**
   * Get tax information for a region
   */
  private static getTaxInfo(region: string): { rate: number; includesTax: boolean } {
    switch (region) {
      case 'GB':
        return { rate: 0.20, includesTax: true }; // 20% VAT included in price
      case 'US':
        return { rate: 0.0875, includesTax: false }; // ~8.75% sales tax shown separately
      default:
        return { rate: 0, includesTax: true };
    }
  }

  /**
   * Initialize exchange rates for supported currencies
   */
  static async initializeRates(): Promise<void> {
    const supportedCurrencies = ['USD', 'GBP', 'EUR'];
    
    for (const baseCurrency of supportedCurrencies) {
      for (const targetCurrency of supportedCurrencies) {
        if (baseCurrency !== targetCurrency) {
          try {
            await this.getExchangeRate(baseCurrency, targetCurrency);
            console.log(`Initialized ${baseCurrency}->${targetCurrency} exchange rate`);
          } catch (error) {
            console.error(`Failed to initialize ${baseCurrency}->${targetCurrency}:`, error);
          }
        }
      }
    }
  }
}