import React from 'react';
import { useLocale } from '@/contexts/LocaleContext';

interface PriceDisplayProps {
  amount: number;
  currency?: string;
  period?: string;
  className?: string;
  showPeriod?: boolean;
}

export default function PriceDisplay({ 
  amount, 
  currency, 
  period = 'day', 
  className = '',
  showPeriod = true 
}: PriceDisplayProps) {
  const { formatPrice, t, localeInfo } = useLocale();
  
  const displayCurrency = currency || localeInfo.currency;
  const formattedPrice = formatPrice(amount);
  const periodText = showPeriod ? `/${t(period)}` : '';

  return (
    <span className={className}>
      {formattedPrice}{periodText}
    </span>
  );
}

interface TaxInfoProps {
  region: string;
  amount: number;
  className?: string;
}

export function TaxInfo({ region, amount, className = '' }: TaxInfoProps) {
  const { formatPrice } = useLocale();
  
  if (region === 'GB') {
    return (
      <span className={`text-sm text-muted-foreground ${className}`}>
        Includes VAT
      </span>
    );
  } else if (region === 'US') {
    const tax = amount * 0.0875; // ~8.75% average US sales tax
    return (
      <span className={`text-sm text-muted-foreground ${className}`}>
        Plus {formatPrice(tax)} tax
      </span>
    );
  }
  
  return null;
}