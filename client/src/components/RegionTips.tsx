import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Clock, Shield, Car, MapPin } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

interface RegionTipsProps {
  className?: string;
}

export default function RegionTips({ className = '' }: RegionTipsProps) {
  const { region, locale } = useLocale();

  const ukTips = [
    {
      icon: Clock,
      title: "Book Early for Heathrow",
      description: "Heathrow parking fills up quickly, especially during holidays. Book at least 2 weeks in advance.",
      badge: "Popular"
    },
    {
      icon: Shield,
      title: "Official Car Parks",
      description: "Official airport car parks offer the most reliable shuttle service and security.",
      badge: "Recommended"
    },
    {
      icon: Car,
      title: "Meet & Greet Service",
      description: "Consider meet & greet for ultimate convenience - your car is collected at the terminal.",
      badge: "Premium"
    }
  ];

  const usTips = [
    {
      icon: Clock,
      title: "LAX Peak Times",
      description: "Avoid LAX parking during rush hours (7-9 AM, 4-7 PM). Book off-site for better rates.",
      badge: "Popular"
    },
    {
      icon: Shield,
      title: "JFK Express Parking",
      description: "JFK offers express parking with 24/7 shuttle service every 10 minutes.",
      badge: "Recommended"
    },
    {
      icon: MapPin,
      title: "Off-Site Savings",
      description: "Save up to 60% by choosing off-site parking with shuttle service to terminals.",
      badge: "Best Value"
    }
  ];

  const tips = region === 'GB' || locale === 'en-GB' ? ukTips : usTips;
  const regionName = region === 'GB' ? 'UK' : 'US';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
          {regionName} Parking Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
              <tip.icon className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-sm">{tip.title}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {tip.badge}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 