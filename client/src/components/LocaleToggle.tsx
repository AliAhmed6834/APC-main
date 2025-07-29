import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

export default function LocaleToggle() {
  const { locale, setLocale, localeInfo } = useLocale();

  const locales = [
    { 
      code: 'en-US', 
      label: 'United States', 
      flag: '🇺🇸',
      currency: 'USD',
      region: 'US'
    },
    { 
      code: 'en-GB', 
      label: 'United Kingdom', 
      flag: '🇬🇧',
      currency: 'GBP',
      region: 'GB'
    }
  ];

  const currentLocale = locales.find(l => l.code === locale) || locales[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLocale.flag} {currentLocale.region}
          </span>
          <span className="sm:hidden">
            {currentLocale.flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {locales.map((localeOption) => (
          <DropdownMenuItem
            key={localeOption.code}
            onClick={() => setLocale(localeOption.code as 'en-US' | 'en-GB')}
            className={`flex items-center justify-between ${
              locale === localeOption.code ? 'bg-accent' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{localeOption.flag}</span>
              <span>{localeOption.label}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {localeOption.currency}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}