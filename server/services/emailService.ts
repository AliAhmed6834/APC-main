import { storage } from '../storage';
import type { EmailTemplate, EmailLog, InsertEmailLog } from '@shared/schema';

export interface EmailData {
  to: string;
  templateKey: string;
  locale?: string;
  variables?: Record<string, any>;
  subject?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  private static instance: EmailService;
  private sendgrid: any;
  private defaultFrom: string;
  private isInitialized: boolean = false;

  private constructor() {
    this.defaultFrom = process.env.SENDGRID_FROM_EMAIL || 'noreply@airportparking.com';
    this.initializeSendGrid();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async initializeSendGrid() {
    try {
      if (process.env.SENDGRID_API_KEY) {
        const sgMail = await import('@sendgrid/mail');
        this.sendgrid = sgMail;
        this.sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
        this.isInitialized = true;
        console.log('✅ SendGrid initialized successfully');
      } else {
        console.log('⚠️ SendGrid API key not configured, email service will be disabled');
      }
    } catch (error) {
      console.error('❌ Error initializing SendGrid:', error);
    }
  }

  /**
   * Send an email using a template
   */
  async sendEmail(data: EmailData): Promise<EmailResult> {
    try {
      if (!this.isInitialized) {
        return { success: false, error: 'Email service not initialized' };
      }

      // Get email template
      const template = await storage.getEmailTemplate(data.templateKey, data.locale || 'en-US');
      if (!template) {
        return { success: false, error: `Email template '${data.templateKey}' not found` };
      }

      // Process template variables
      const processedSubject = this.processTemplate(template.subject, data.variables || {});
      const processedHtmlContent = this.processTemplate(template.htmlContent, data.variables || {});
      const processedTextContent = this.processTemplate(template.textContent, data.variables || {});

      // Prepare email message
      const msg = {
        to: data.to,
        from: this.defaultFrom,
        subject: data.subject || processedSubject,
        html: processedHtmlContent,
        text: processedTextContent,
        attachments: data.attachments || [],
        trackingSettings: {
          clickTracking: { enable: true, enableText: true },
          openTracking: { enable: true },
          subscriptionTracking: { enable: false }
        }
      };

      // Send email via SendGrid
      const response = await this.sendgrid.send(msg);
      
      // Log email
      const emailLog: InsertEmailLog = {
        userId: data.variables?.userId || null,
        templateId: template.id,
        recipient: data.to,
        subject: msg.subject,
        status: 'sent',
        gatewayResponse: {
          message_id: response[0]?.headers['x-message-id'],
          status_code: response[0]?.statusCode,
          sendgrid_response: response
        },
        deliveryStatus: 'delivered'
      };

      await storage.createEmailLog(emailLog);

      return {
        success: true,
        messageId: response[0]?.headers['x-message-id']
      };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      
      // Log failed email
      try {
        const template = await storage.getEmailTemplate(data.templateKey, data.locale || 'en-US');
        if (template) {
          const emailLog: InsertEmailLog = {
            userId: data.variables?.userId || null,
            templateId: template.id,
            recipient: data.to,
            subject: data.subject || 'Email Failed',
            status: 'failed',
            gatewayResponse: {
              error: error.message,
              stack: error.stack
            },
            deliveryStatus: 'failed'
          };
          await storage.createEmailLog(emailLog);
        }
      } catch (logError) {
        console.error('❌ Error logging failed email:', logError);
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(
    userId: string,
    userEmail: string,
    bookingData: {
      id: string;
      airportCode: string;
      startDate: string;
      endDate: string;
      totalAmount: number;
      currency: string;
      parkingLotName: string;
    }
  ): Promise<EmailResult> {
    const variables = {
      userId,
      booking_id: bookingData.id,
      airport: bookingData.airportCode,
      dates: `${bookingData.startDate} to ${bookingData.endDate}`,
      amount: `${bookingData.currency} ${bookingData.totalAmount}`,
      parking_lot: bookingData.parkingLotName,
      confirmation_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/booking/${bookingData.id}`
    };

    return this.sendEmail({
      to: userEmail,
      templateKey: 'booking_confirmation',
      variables
    });
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(userId: string, userEmail: string, userName: string): Promise<EmailResult> {
    const variables = {
      userId,
      user_name: userName,
      login_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
      support_email: process.env.SUPPORT_EMAIL || 'support@airportparking.com'
    };

    return this.sendEmail({
      to: userEmail,
      templateKey: 'welcome',
      variables
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(userId: string, userEmail: string, resetToken: string): Promise<EmailResult> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const variables = {
      userId,
      reset_link: resetUrl,
      expiry_hours: 24
    };

    return this.sendEmail({
      to: userEmail,
      templateKey: 'password_reset',
      variables
    });
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(
    userId: string,
    userEmail: string,
    paymentData: {
      transactionId: string;
      amount: number;
      currency: string;
      bookingId: string;
      paymentMethod: string;
    }
  ): Promise<EmailResult> {
    const variables = {
      userId,
      transaction_id: paymentData.transactionId,
      amount: `${paymentData.currency} ${paymentData.amount}`,
      payment_method: paymentData.paymentMethod,
      booking_id: paymentData.bookingId,
      receipt_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/receipt/${paymentData.transactionId}`
    };

    return this.sendEmail({
      to: userEmail,
      templateKey: 'payment_confirmation',
      variables
    });
  }

  /**
   * Send booking reminder email
   */
  async sendBookingReminder(
    userId: string,
    userEmail: string,
    bookingData: {
      id: string;
      airportCode: string;
      startDate: string;
      parkingLotName: string;
      confirmationNumber: string;
    }
  ): Promise<EmailResult> {
    const variables = {
      userId,
      booking_id: bookingData.id,
      airport: bookingData.airportCode,
      start_date: bookingData.startDate,
      parking_lot: bookingData.parkingLotName,
      confirmation_number: bookingData.confirmationNumber,
      booking_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/booking/${bookingData.id}`
    };

    return this.sendEmail({
      to: userEmail,
      templateKey: 'booking_reminder',
      variables
    });
  }

  /**
   * Send cancellation confirmation email
   */
  async sendCancellationEmail(
    userId: string,
    userEmail: string,
    bookingData: {
      id: string;
      airportCode: string;
      startDate: string;
      endDate: string;
      refundAmount: number;
      currency: string;
    }
  ): Promise<EmailResult> {
    const variables = {
      userId,
      booking_id: bookingData.id,
      airport: bookingData.airportCode,
      dates: `${bookingData.startDate} to ${bookingData.endDate}`,
      refund_amount: `${bookingData.currency} ${bookingData.refundAmount}`,
      support_email: process.env.SUPPORT_EMAIL || 'support@airportparking.com'
    };

    return this.sendEmail({
      to: userEmail,
      templateKey: 'booking_cancellation',
      variables
    });
  }

  /**
   * Send promotional email
   */
  async sendPromotionalEmail(
    userEmail: string,
    promoData: {
      subject: string;
      title: string;
      message: string;
      ctaText: string;
      ctaUrl: string;
      promoCode?: string;
    }
  ): Promise<EmailResult> {
    // Create dynamic promotional email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">${promoData.title}</h1>
        <p>${promoData.message}</p>
        ${promoData.promoCode ? `<p><strong>Use code: ${promoData.promoCode}</strong></p>` : ''}
        <a href="${promoData.ctaUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          ${promoData.ctaText}
        </a>
      </div>
    `;

    const textContent = `
      ${promoData.title}
      
      ${promoData.message}
      
      ${promoData.promoCode ? `Use code: ${promoData.promoCode}` : ''}
      
      ${promoData.ctaText}: ${promoData.ctaUrl}
    `;

    return this.sendEmail({
      to: userEmail,
      subject: promoData.subject,
      templateKey: 'promotional',
      variables: {
        title: promoData.title,
        message: promoData.message,
        cta_text: promoData.ctaText,
        cta_url: promoData.ctaUrl,
        promo_code: promoData.promoCode
      }
    });
  }

  /**
   * Process template variables
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
   * Get email delivery status
   */
  async getEmailDeliveryStatus(messageId: string): Promise<string> {
    try {
      if (!this.isInitialized) {
        return 'unknown';
      }

      // In production, you would query SendGrid's API for delivery status
      // For now, we'll return a default status
      return 'delivered';
    } catch (error) {
      console.error('❌ Error getting email delivery status:', error);
      return 'unknown';
    }
  }

  /**
   * Get email analytics
   */
  async getEmailAnalytics(startDate: Date, endDate: Date): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    openRate: number;
    clickRate: number;
  }> {
    try {
      // Query email logs for analytics
      const emailLogs = await storage.getEmailLogs(null, 1000); // Get all logs for now
      
      const periodLogs = emailLogs.filter(log => {
        const logDate = new Date(log.sentAt);
        return logDate >= startDate && logDate <= endDate;
      });

      const totalSent = periodLogs.length;
      const totalDelivered = periodLogs.filter(log => log.status === 'delivered').length;
      const totalFailed = periodLogs.filter(log => log.status === 'failed').length;
      const openedCount = periodLogs.filter(log => log.openedAt).length;
      const clickedCount = periodLogs.filter(log => log.clickedAt).length;

      return {
        totalSent,
        totalDelivered,
        totalFailed,
        openRate: totalDelivered > 0 ? (openedCount / totalDelivered) * 100 : 0,
        clickRate: totalDelivered > 0 ? (clickedCount / totalDelivered) * 100 : 0
      };
    } catch (error) {
      console.error('❌ Error getting email analytics:', error);
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        openRate: 0,
        clickRate: 0
      };
    }
  }

  /**
   * Test email service connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        return false;
      }

      // Send a test email to verify connectivity
      const testResult = await this.sendEmail({
        to: process.env.TEST_EMAIL || 'test@example.com',
        templateKey: 'welcome',
        variables: { userId: 'test', user_name: 'Test User' }
      });

      return testResult.success;
    } catch (error) {
      console.error('❌ Email service connection test failed:', error);
      return false;
    }
  }
}

export default EmailService;
