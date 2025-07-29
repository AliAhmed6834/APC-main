import { useQuery } from '@tanstack/react-query';
import { useLocale } from '@/contexts/LocaleContext';

interface GeoInfo {
  country: string;
  region: string;
  timezone: string;
  currency: string;
  detectedLocale: string;
}

/**
 * Hook to get geo-aware information and detect user location
 */
export function useGeoAware() {
  const { locale, currency, region } = useLocale();

  const { data: geoInfo, isLoading } = useQuery<GeoInfo>({
    queryKey: ['/api/geo/detect'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false,
  });

  return {
    geoInfo,
    isLoading,
    currentLocale: locale,
    currentCurrency: currency,
    currentRegion: region,
    isDetected: !!geoInfo,
  };
}

/**
 * Hook for currency conversion and formatting
 */
export function useCurrency() {
  const { formatPrice, currency } = useLocale();

  const convertAndFormat = async (
    amount: number,
    fromCurrency: string,
    toCurrency?: string
  ): Promise<string> => {
    const targetCurrency = toCurrency || currency;
    
    if (fromCurrency === targetCurrency) {
      return formatPrice(amount);
    }

    try {
      // In a real implementation, this would call the backend conversion API
      const response = await fetch(`/api/currency/convert?from=${fromCurrency}&to=${targetCurrency}&amount=${amount}`);
      const data = await response.json();
      return formatPrice(data.convertedAmount);
    } catch (error) {
      console.warn('Currency conversion failed, using original amount:', error);
      return formatPrice(amount);
    }
  };

  return {
    formatPrice,
    convertAndFormat,
    currency,
  };
}

/**
 * Hook for distance formatting based on locale
 */
export function useDistance() {
  const { formatDistance, localeInfo } = useLocale();

  return {
    formatDistance,
    unit: localeInfo.distanceUnit,
    convertDistance: (miles: number) => {
      if (localeInfo.distanceUnit === 'km') {
        return miles * 1.60934;
      }
      return miles;
    },
  };
}

/**
 * Hook for date/time formatting based on locale
 */
export function useDateTime() {
  const { formatDate, formatTime, localeInfo } = useLocale();

  const formatDateTime = (date: Date): string => {
    return `${formatDate(date)} ${formatTime(date)}`;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} minutes`;
    } else if (mins === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  return {
    formatDate,
    formatTime,
    formatDateTime,
    formatDuration,
    dateFormat: localeInfo.dateFormat,
    timeFormat: localeInfo.timeFormat,
  };
}