import React from 'react';
import { Shield, Clock, Star, Users, CheckCircle, DollarSign } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

export default function TrustSection() {
  const { t, localeInfo } = useLocale();

  const trustBadges = [
    {
      icon: Shield,
      title: localeInfo.region === 'GB' ? 'Secure Booking' : 'Secure Booking',
      description: localeInfo.region === 'GB' ? 'SSL encrypted payments' : 'SSL encrypted payments',
    },
    {
      icon: Clock,
      title: localeInfo.region === 'GB' ? '24/7 Support' : '24/7 Support',
      description: localeInfo.region === 'GB' ? 'Round the clock assistance' : 'Round the clock assistance',
    },
    {
      icon: Star,
      title: localeInfo.region === 'GB' ? 'Best Prices' : 'Best Prices',
      description: localeInfo.region === 'GB' ? 'Guaranteed lowest rates' : 'Guaranteed lowest rates',
    },
    {
      icon: Users,
      title: localeInfo.region === 'GB' ? 'Trusted by Millions' : 'Trusted by Millions',
      description: localeInfo.region === 'GB' ? 'Over 2M happy customers' : 'Over 2M happy customers',
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Price Matching Guarantee */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-green-100 text-green-800 px-6 py-3 rounded-full mb-6">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-semibold">
              {localeInfo.region === 'GB' ? 'We Match Any Price!' : 'We Match Any Price!'}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {localeInfo.region === 'GB' 
              ? "Don't waste time going to every single car park website" 
              : "Don't waste time going to every single parking website"
            }
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {localeInfo.region === 'GB' 
              ? "We have every car park and with one click you can get every single price instantly. If you find a lower price elsewhere, we'll match it!"
              : "We have every parking lot and with one click you can get every single price instantly. If you find a lower price elsewhere, we'll match it!"
            }
          </p>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustBadges.map((badge, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full mb-4">
                <badge.icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{badge.title}</h3>
              <p className="text-gray-600">{badge.description}</p>
            </div>
          ))}
        </div>

        {/* Customer Support */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {localeInfo.region === 'GB' ? 'Need Help?' : 'Need Help?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {localeInfo.region === 'GB' 
                ? "Our dedicated support team is here to help with booking questions, changes, or anything you may need."
                : "Our dedicated support team is here to help with booking questions, changes, or anything you may need."
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-primary mr-2" />
                <span className="text-gray-700">
                  {localeInfo.region === 'GB' ? 'Mon-Fri 9am-5pm' : 'Mon-Fri 9am-5pm'}
                </span>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-primary mr-2" />
                <span className="text-gray-700">
                  {localeInfo.region === 'GB' ? '0203 603 9797' : '+1 (555) 123-4567'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
