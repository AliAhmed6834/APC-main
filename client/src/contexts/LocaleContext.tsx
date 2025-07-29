import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { DEFAULT_MESSAGES, LOCALE_CONFIG } from '@shared/locales';
import type { SupportedLocale, LocaleInfo } from '@shared/schema';

interface LocaleContextType {
  locale: SupportedLocale;
  localeInfo: LocaleInfo;
  setLocale: (locale: SupportedLocale) => void;
  currency: string;
  region: string;
  formatPrice: (amount: number) => string;
  formatDistance: (distance: number) => string;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
  t: (key: string) => string; // Terminology helper
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
  initialLocale?: SupportedLocale;
}

export function LocaleProvider({ children, initialLocale }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(
    initialLocale || detectBrowserLocale()
  );

  const localeInfo = LOCALE_CONFIG[locale];
  const messages = DEFAULT_MESSAGES[locale];

  useEffect(() => {
    // Persist locale preference
    document.cookie = `locale=${locale}; path=/; max-age=${365 * 24 * 60 * 60}`;
    
    // Update document language
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    
    // Reload page to apply server-side locale changes
    window.location.search = `?locale=${newLocale}`;
  };

  const formatPrice = (amount: number): string => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: localeInfo.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      const symbol = localeInfo.currency === 'GBP' ? '£' : '$';
      return `${symbol}${amount.toFixed(2)}`;
    }
  };

  const formatDistance = (distance: number): string => {
    const unit = localeInfo.distanceUnit;
    const convertedDistance = unit === 'km' ? distance * 1.60934 : distance;
    return `${convertedDistance.toFixed(1)} ${unit}`;
  };

  const formatDate = (date: Date): string => {
    try {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    } catch (error) {
      // Fallback formatting
      if (locale === 'en-GB') {
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      } else {
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
      }
    }
  };

  const formatTime = (date: Date): string => {
    try {
      return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: localeInfo.timeFormat === 12
      }).format(date);
    } catch (error) {
      // Fallback formatting
      if (localeInfo.timeFormat === 24) {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } else {
        const hours = date.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${date.getMinutes().toString().padStart(2, '0')} ${ampm}`;
      }
    }
  };

  const t = (key: string): string => {
    return localeInfo.terminology[key] || key;
  };

  const contextValue: LocaleContextType = {
    locale,
    localeInfo,
    setLocale,
    currency: localeInfo.currency,
    region: localeInfo.region,
    formatPrice,
    formatDistance,
    formatDate,
    formatTime,
    t
  };

  return (
    <LocaleContext.Provider value={contextValue}>
      <IntlProvider
        locale={locale}
        messages={messages}
        defaultLocale="en-US"
      >
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

// Helper function to detect browser locale
function detectBrowserLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en-US';
  
  const browserLocale = navigator.language;
  
  // Check if browser locale matches our supported locales
  if (browserLocale.startsWith('en-GB')) return 'en-GB';
  if (browserLocale.startsWith('en')) return 'en-US';
  
  return 'en-US'; // Default fallback
}

// Helper hook for React Intl formatted messages
export function useFormatMessage() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useFormatMessage must be used within a LocaleProvider');
  }
  
  return (id: string, values?: Record<string, any>) => {
    // This would integrate with React Intl's formatMessage
    // For now, return the key as fallback
    return id;
  };
}