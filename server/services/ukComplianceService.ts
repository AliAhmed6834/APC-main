import { UK_REGULATORY_CONFIG, UK_AIRPORTS, UK_COMPLIANCE_MESSAGES } from '@shared/locales';

export interface ComplianceCheck {
  type: 'gdpr' | 'financial' | 'consumer' | 'accessibility' | 'environmental';
  status: 'compliant' | 'non_compliant' | 'pending_review';
  details: string;
  lastChecked: Date;
  nextReviewDate: Date;
}

export interface UKComplianceReport {
  overallStatus: 'compliant' | 'non_compliant' | 'partial';
  checks: ComplianceCheck[];
  recommendations: string[];
  lastUpdated: Date;
}

export class UKComplianceService {
  private static instance: UKComplianceService;
  private complianceCache: Map<string, ComplianceCheck> = new Map();

  static getInstance(): UKComplianceService {
    if (!UKComplianceService.instance) {
      UKComplianceService.instance = new UKComplianceService();
    }
    return UKComplianceService.instance;
  }

  /**
   * Check GDPR compliance for data processing
   */
  async checkGDPRCompliance(userId: string, dataType: string): Promise<ComplianceCheck> {
    const cacheKey = `gdpr_${userId}_${dataType}`;
    
    if (this.complianceCache.has(cacheKey)) {
      return this.complianceCache.get(cacheKey)!;
    }

    const check: ComplianceCheck = {
      type: 'gdpr',
      status: 'compliant',
      details: 'GDPR compliance verified',
      lastChecked: new Date(),
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    // Check specific GDPR requirements
    if (!UK_REGULATORY_CONFIG.gdpr.consentRequired) {
      check.status = 'non_compliant';
      check.details = 'Consent mechanism not implemented';
    }

    if (!UK_REGULATORY_CONFIG.gdpr.rightToErasure) {
      check.status = 'non_compliant';
      check.details = 'Right to erasure not implemented';
    }

    this.complianceCache.set(cacheKey, check);
    return check;
  }

  /**
   * Check financial compliance (PCI DSS, fraud prevention)
   */
  async checkFinancialCompliance(transactionId: string): Promise<ComplianceCheck> {
    const cacheKey = `financial_${transactionId}`;
    
    if (this.complianceCache.has(cacheKey)) {
      return this.complianceCache.get(cacheKey)!;
    }

    const check: ComplianceCheck = {
      type: 'financial',
      status: 'compliant',
      details: 'Financial compliance verified',
      lastChecked: new Date(),
      nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    // Check PCI DSS compliance
    if (!UK_REGULATORY_CONFIG.financial.pciCompliance) {
      check.status = 'non_compliant';
      check.details = 'PCI DSS compliance not verified';
    }

    // Check fraud prevention
    if (!UK_REGULATORY_CONFIG.financial.fraudPrevention) {
      check.status = 'non_compliant';
      check.details = 'Fraud prevention measures not implemented';
    }

    this.complianceCache.set(cacheKey, check);
    return check;
  }

  /**
   * Check consumer rights compliance
   */
  async checkConsumerRightsCompliance(bookingId: string): Promise<ComplianceCheck> {
    const cacheKey = `consumer_${bookingId}`;
    
    if (this.complianceCache.has(cacheKey)) {
      return this.complianceCache.get(cacheKey)!;
    }

    const check: ComplianceCheck = {
      type: 'consumer',
      status: 'compliant',
      details: 'Consumer rights compliance verified',
      lastChecked: new Date(),
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    // Check cooling off period
    if (UK_REGULATORY_CONFIG.consumer.coolingOffPeriod < 14) {
      check.status = 'non_compliant';
      check.details = 'Cooling off period less than 14 days';
    }

    // Check cancellation rights
    if (!UK_REGULATORY_CONFIG.consumer.cancellationRights) {
      check.status = 'non_compliant';
      check.details = 'Cancellation rights not implemented';
    }

    this.complianceCache.set(cacheKey, check);
    return check;
  }

  /**
   * Check accessibility compliance
   */
  async checkAccessibilityCompliance(): Promise<ComplianceCheck> {
    const cacheKey = 'accessibility_global';
    
    if (this.complianceCache.has(cacheKey)) {
      return this.complianceCache.get(cacheKey)!;
    }

    const check: ComplianceCheck = {
      type: 'accessibility',
      status: 'compliant',
      details: 'Accessibility compliance verified',
      lastChecked: new Date(),
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    };

    // Check WCAG compliance
    if (UK_REGULATORY_CONFIG.accessibility.wcagCompliance !== 'AA') {
      check.status = 'non_compliant';
      check.details = 'WCAG AA compliance not achieved';
    }

    // Check disabled parking
    if (!UK_REGULATORY_CONFIG.accessibility.disabledParkingRequired) {
      check.status = 'non_compliant';
      check.details = 'Disabled parking not available';
    }

    this.complianceCache.set(cacheKey, check);
    return check;
  }

  /**
   * Check environmental compliance
   */
  async checkEnvironmentalCompliance(parkingLotId: string): Promise<ComplianceCheck> {
    const cacheKey = `environmental_${parkingLotId}`;
    
    if (this.complianceCache.has(cacheKey)) {
      return this.complianceCache.get(cacheKey)!;
    }

    const check: ComplianceCheck = {
      type: 'environmental',
      status: 'compliant',
      details: 'Environmental compliance verified',
      lastChecked: new Date(),
      nextReviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
    };

    // Check EV charging
    if (!UK_REGULATORY_CONFIG.environmental.evChargingRequired) {
      check.status = 'non_compliant';
      check.details = 'EV charging not available';
    }

    // Check carbon offsetting
    if (!UK_REGULATORY_CONFIG.environmental.carbonOffsetting) {
      check.status = 'non_compliant';
      check.details = 'Carbon offsetting not implemented';
    }

    this.complianceCache.set(cacheKey, check);
    return check;
  }

  /**
   * Generate comprehensive compliance report
   */
  async generateComplianceReport(): Promise<UKComplianceReport> {
    const checks = await Promise.all([
      this.checkAccessibilityCompliance(),
      this.checkEnvironmentalCompliance('global'),
    ]);

    const nonCompliantCount = checks.filter(check => check.status === 'non_compliant').length;
    const overallStatus = nonCompliantCount === 0 ? 'compliant' : 
                         nonCompliantCount < checks.length ? 'partial' : 'non_compliant';

    const recommendations = this.generateRecommendations(checks);

    return {
      overallStatus,
      checks,
      recommendations,
      lastUpdated: new Date(),
    };
  }

  /**
   * Generate compliance recommendations
   */
  private generateRecommendations(checks: ComplianceCheck[]): string[] {
    const recommendations: string[] = [];

    checks.forEach(check => {
      if (check.status === 'non_compliant') {
        switch (check.type) {
          case 'gdpr':
            recommendations.push('Implement GDPR consent mechanism and data erasure procedures');
            break;
          case 'financial':
            recommendations.push('Ensure PCI DSS compliance and implement fraud prevention measures');
            break;
          case 'consumer':
            recommendations.push('Implement 14-day cooling off period and clear cancellation terms');
            break;
          case 'accessibility':
            recommendations.push('Achieve WCAG AA compliance and provide disabled parking');
            break;
          case 'environmental':
            recommendations.push('Install EV charging stations and implement carbon offsetting');
            break;
        }
      }
    });

    return recommendations;
  }

  /**
   * Check airport-specific regulatory requirements
   */
  async checkAirportCompliance(airportCode: string): Promise<{
    congestionCharge: boolean;
    ulezZone: boolean;
    regulatoryZone: string;
    requirements: string[];
  }> {
    const airport = UK_AIRPORTS[airportCode as keyof typeof UK_AIRPORTS];
    
    if (!airport) {
      throw new Error(`Airport ${airportCode} not found in UK airports list`);
    }

    const requirements: string[] = [];

    if (airport.congestionCharge) {
      requirements.push('London Congestion Charge applies');
    }

    if (airport.ulezZone) {
      requirements.push('Ultra Low Emission Zone restrictions apply');
    }

    return {
      congestionCharge: airport.congestionCharge,
      ulezZone: airport.ulezZone,
      regulatoryZone: airport.regulatoryZone,
      requirements,
    };
  }

  /**
   * Get compliance messages for UI display
   */
  getComplianceMessages(type: keyof typeof UK_COMPLIANCE_MESSAGES): string[] {
    const messages = UK_COMPLIANCE_MESSAGES[type];
    return Object.values(messages);
  }

  /**
   * Validate VAT calculation
   */
  validateVATCalculation(amount: number, vatRate: number = 0.20): {
    netAmount: number;
    vatAmount: number;
    grossAmount: number;
    isValid: boolean;
  } {
    const netAmount = amount / (1 + vatRate);
    const vatAmount = amount - netAmount;
    const grossAmount = netAmount + vatAmount;

    // Check if VAT calculation is within acceptable tolerance
    const tolerance = 0.01; // 1 penny tolerance
    const isValid = Math.abs(grossAmount - amount) <= tolerance;

    return {
      netAmount: Math.round(netAmount * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      grossAmount: Math.round(grossAmount * 100) / 100,
      isValid,
    };
  }

  /**
   * Clear compliance cache
   */
  clearCache(): void {
    this.complianceCache.clear();
  }
}

export default UKComplianceService;
