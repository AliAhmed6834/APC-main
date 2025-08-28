import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  ExternalLink,
  Download,
  FileText,
  Lock,
  Globe,
  CreditCard
} from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';
import { UK_COMPLIANCE_MESSAGES } from '@shared/locales';

interface UKComplianceBannerProps {
  className?: string;
  showDetails?: boolean;
  onToggleDetails?: (show: boolean) => void;
}

export function UKComplianceBanner({ 
  className = '', 
  showDetails = false,
  onToggleDetails 
}: UKComplianceBannerProps) {
  const { localeInfo } = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Only show for UK locale
  if (localeInfo.locale !== 'en-GB') {
    return null;
  }

  const handleToggleDetails = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggleDetails?.(newState);
  };

  const complianceItems = [
    {
      type: 'gdpr',
      title: 'GDPR Compliance',
      description: 'Your data is protected under UK and EU data protection laws',
      icon: Shield,
      status: 'compliant',
      details: UK_COMPLIANCE_MESSAGES.gdpr,
    },
    {
      type: 'financial',
      title: 'Financial Security',
      description: 'PCI DSS compliant payment processing with fraud protection',
      icon: CreditCard,
      status: 'compliant',
      details: UK_COMPLIANCE_MESSAGES.financial,
    },
    {
      type: 'consumer',
      title: 'Consumer Rights',
      description: '14-day cooling off period and clear cancellation terms',
      icon: FileText,
      status: 'compliant',
      details: UK_COMPLIANCE_MESSAGES.consumer,
    },
    {
      type: 'accessibility',
      title: 'Accessibility',
      description: 'WCAG AA compliant with multi-language support',
      icon: Globe,
      status: 'compliant',
      details: UK_COMPLIANCE_MESSAGES.accessibility,
    },
  ];

  return (
    <div className={`${className}`}>
      {/* Main Compliance Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle className="text-lg text-blue-900">
                  UK Regulatory Compliance
                </CardTitle>
                <p className="text-sm text-blue-700">
                  This service meets all UK regulatory requirements
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Compliant
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleDetails}
                className="text-blue-700 hover:text-blue-800 hover:bg-blue-100"
              >
                {isExpanded ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-1" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Expanded Compliance Details */}
        {isExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Compliance Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complianceItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={item.type} className="p-4 bg-white rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <IconComponent className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          <div className="space-y-2">
                            {Object.entries(item.details).map(([key, message]) => (
                              <div key={key} className="flex items-start space-x-2">
                                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-gray-600">{message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Badge className={item.status === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <h5 className="font-medium text-gray-900">VAT Information</h5>
                  </div>
                  <p className="text-sm text-gray-600">
                    All prices include VAT at 20%. VAT registration number: GB123456789
                  </p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lock className="w-4 h-4 text-green-500" />
                    <h5 className="font-medium text-gray-900">Data Protection</h5>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your personal data is processed in accordance with GDPR regulations
                  </p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <h5 className="font-medium text-gray-900">Legal Rights</h5>
                  </div>
                  <p className="text-sm text-gray-600">
                    You have 14 days to cancel under UK consumer law
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-blue-200">
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  <Download className="w-4 h-4 mr-2" />
                  Download Privacy Policy
                </Button>
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  <FileText className="w-4 h-4 mr-2" />
                  View Terms & Conditions
                </Button>
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Contact Data Protection Officer
                </Button>
              </div>

              {/* Compliance Notice */}
              <div className="p-4 bg-blue-100 rounded-lg border border-blue-300">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-blue-900 mb-1">Compliance Notice</h5>
                    <p className="text-sm text-blue-800">
                      This service operates under UK law and complies with all relevant regulations including GDPR, 
                      Consumer Rights Act 2015, and Payment Services Regulations. For more information about your rights 
                      and our compliance status, please contact our compliance team.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
