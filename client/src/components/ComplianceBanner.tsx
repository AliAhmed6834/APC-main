import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Shield, Cookie } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

interface ComplianceBannerProps {
  className?: string;
}

export default function ComplianceBanner({ className = '' }: ComplianceBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { region, locale } = useLocale();

  useEffect(() => {
    // Check if user has already dismissed the banner
    const dismissed = localStorage.getItem('compliance-banner-dismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    localStorage.setItem('compliance-banner-dismissed', 'true');
  };

  const handleAccept = () => {
    handleDismiss();
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  // Show GDPR banner for UK/EU users
  if (region === 'GB' || locale === 'en-GB') {
    return (
      <div className={`fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 z-50 ${className}`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5" />
            <div>
              <p className="text-sm">
                We use cookies to enhance your experience and analyze site usage. 
                By continuing to use our site, you consent to our use of cookies in accordance with our{' '}
                <a href="/privacy" className="underline hover:no-underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAccept}
              className="text-white border-white hover:bg-white hover:text-blue-600"
            >
              Accept
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="text-white hover:bg-white hover:text-blue-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show CCPA notice for US users (simplified version)
  if (region === 'US' || locale === 'en-US') {
    return (
      <div className={`fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50 ${className}`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Cookie className="w-5 h-5" />
            <div>
              <p className="text-sm">
                We collect and process your personal information as described in our{' '}
                <a href="/privacy" className="underline hover:no-underline">Privacy Policy</a>. 
                California residents have additional rights under the CCPA.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAccept}
              className="text-white border-white hover:bg-white hover:text-gray-800"
            >
              Accept
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="text-white hover:bg-white hover:text-gray-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 