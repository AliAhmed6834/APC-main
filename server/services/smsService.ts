import { storage } from '../storage';
import type { SmsLog, InsertSmsLog } from '@shared/schema';

export interface SmsData {
  to: string;
  message: string;
  userId?: string;
  templateKey?: string;
  variables?: Record<string, any>;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class SmsService {
  private static instance: SmsService;
  private twilio: any;
  private isInitialized: boolean = false;

  private constructor() {
    this.initializeTwilio();
  }

  public static getInstance(): SmsService {
    if (!SmsService.instance) {
      SmsService.instance = new SmsService();
    }
    return SmsService.instance;
  }

  private async initializeTwilio() {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        const twilio = await import('twilio');
        this.twilio = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        this.isInitialized = true;
        console.log('✅ Twilio SMS service initialized successfully');
      } else {
        console.log('⚠️ Twilio credentials not configured, SMS service will be disabled');
      }
    } catch (error) {
      console.error('❌ Error initializing Twilio:', error);
    }
  }

  /**
   * Send an SMS message
   */
  async sendSms(data: SmsData): Promise<SmsResult> {
    try {
      if (!this.isInitialized) {
        return { success: false, error: 'SMS service not initialized' };
      }

      // Process message template if templateKey is provided
      let message = data.message;
      if (data.templateKey && data.variables) {
        message = this.processTemplate(data.message, data.variables);
      }

      // Send SMS via Twilio
      const response = await this.twilio.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: data.to
      });

      // Log SMS
      const smsLog: InsertSmsLog = {
        userId: data.userId || null,
        recipient: data.to,
        message: message,
        status: 'sent',
        gatewayResponse: {
          message_sid: response.sid,
          status: response.status,
          twilio_response: response
        },
        deliveryStatus: 'delivered'
      };

      await storage.createSmsLog(smsLog);

      return {
        success: true,
        messageId: response.sid
      };
    } catch (error) {
      console.error('❌ Error sending SMS:', error);
      
      // Log failed SMS
      try {
        const smsLog: InsertSmsLog = {
          userId: data.userId || null,
          recipient: data.to,
          message: data.message,
          status: 'failed',
          gatewayResponse: {
            error: error.message,
            stack: error.stack
          },
          deliveryStatus: 'failed'
        };
        await storage.createSmsLog(smsLog);
      } catch (logError) {
        console.error('❌ Error logging failed SMS:', logError);
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Send booking confirmation SMS
   */
  async sendBookingConfirmationSms(
    userId: string,
    phoneNumber: string,
    bookingData: {
      id: string;
      airportCode: string;
      startDate: string;
      endDate: string;
      confirmationNumber: string;
    }
  ): Promise<SmsResult> {
    const message = `Your parking at ${bookingData.airportCode} is confirmed for ${bookingData.startDate} to ${bookingData.endDate}. Confirmation: ${bookingData.confirmationNumber}. View details: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/booking/${bookingData.id}`;

    return this.sendSms({
      to: phoneNumber,
      message,
      userId
    });
  }

  /**
   * Send booking reminder SMS
   */
  async sendBookingReminderSms(
    userId: string,
    phoneNumber: string,
    bookingData: {
      id: string;
      airportCode: string;
      startDate: string;
      parkingLotName: string;
    }
  ): Promise<SmsResult> {
    const message = `Reminder: Your parking at ${bookingData.airportCode} (${bookingData.parkingLotName}) starts tomorrow, ${bookingData.startDate}. Safe travels!`;

    return this.sendSms({
      to: phoneNumber,
      message,
      userId
    });
  }

  /**
   * Send payment confirmation SMS
   */
  async sendPaymentConfirmationSms(
    userId: string,
    phoneNumber: string,
    paymentData: {
      amount: number;
      currency: string;
      transactionId: string;
    }
  ): Promise<SmsResult> {
    const message = `Payment confirmed: ${paymentData.currency} ${paymentData.amount}. Transaction ID: ${paymentData.transactionId}. Thank you for choosing our service!`;

    return this.sendSms({
      to: phoneNumber,
      message,
      userId
    });
  }

  /**
   * Send cancellation confirmation SMS
   */
  async sendCancellationSms(
    userId: string,
    phoneNumber: string,
    bookingData: {
      id: string;
      airportCode: string;
      refundAmount: number;
      currency: string;
    }
  ): Promise<SmsResult> {
    const message = `Your parking booking at ${bookingData.airportCode} has been cancelled. Refund of ${bookingData.currency} ${bookingData.refundAmount} will be processed within 5-7 business days.`;

    return this.sendSms({
      to: phoneNumber,
      message,
      userId
    });
  }

  /**
   * Send emergency notification SMS
   */
  async sendEmergencyNotificationSms(
    phoneNumber: string,
    message: string
  ): Promise<SmsResult> {
    return this.sendSms({
      to: phoneNumber,
      message: `🚨 EMERGENCY: ${message}`
    });
  }

  /**
   * Send promotional SMS
   */
  async sendPromotionalSms(
    phoneNumber: string,
    promoData: {
      message: string;
      promoCode?: string;
      ctaUrl?: string;
    }
  ): Promise<SmsResult> {
    let message = promoData.message;
    
    if (promoData.promoCode) {
      message += ` Use code: ${promoData.promoCode}`;
    }
    
    if (promoData.ctaUrl) {
      message += ` Learn more: ${promoData.ctaUrl}`;
    }

    return this.sendSms({
      to: phoneNumber,
      message
    });
  }

  /**
   * Process SMS template variables
   */
  private processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      processed = processed.replace(new RegExp(placeholder, 'g'), String(value));
    }
    
    return processed;
  }

  /**
   * Get SMS delivery status
   */
  async getSmsDeliveryStatus(messageId: string): Promise<string> {
    try {
      if (!this.isInitialized) {
        return 'unknown';
      }

      // Query Twilio for message status
      const message = await this.twilio.messages(messageId).fetch();
      return message.status;
    } catch (error) {
      console.error('❌ Error getting SMS delivery status:', error);
      return 'unknown';
    }
  }

  /**
   * Get SMS analytics
   */
  async getSmsAnalytics(startDate: Date, endDate: Date): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    deliveryRate: number;
  }> {
    try {
      // Query SMS logs for analytics
      const smsLogs = await storage.getSmsLogs(null, 1000); // Get all logs for now
      
      const periodLogs = smsLogs.filter(log => {
        const logDate = new Date(log.sentAt);
        return logDate >= startDate && logDate <= endDate;
      });

      const totalSent = periodLogs.length;
      const totalDelivered = periodLogs.filter(log => log.status === 'delivered').length;
      const totalFailed = periodLogs.filter(log => log.status === 'failed').length;

      return {
        totalSent,
        totalDelivered,
        totalFailed,
        deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0
      };
    } catch (error) {
      console.error('❌ Error getting SMS analytics:', error);
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        deliveryRate: 0
      };
    }
  }

  /**
   * Test SMS service connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        return false;
      }

      // Send a test SMS to verify connectivity
      const testResult = await this.sendSms({
        to: process.env.TEST_PHONE || '+1234567890',
        message: 'Test SMS from Airport Parking Service'
      });

      return testResult.success;
    } catch (error) {
      console.error('❌ SMS service connection test failed:', error);
      return false;
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation (E.164 format)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Format phone number to E.164
   */
  formatPhoneNumber(phoneNumber: string, countryCode: string = 'US'): string {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (!phoneNumber.startsWith('+')) {
      const countryCodes: Record<string, string> = {
        'US': '1',
        'GB': '44',
        'CA': '1',
        'AU': '61'
      };
      
      const code = countryCodes[countryCode] || '1';
      return `+${code}${digits}`;
    }
    
    return phoneNumber;
  }
}

export default SmsService;
