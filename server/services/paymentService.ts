import { storage } from '../storage';
import type { Transaction, InsertTransaction, PaymentMethod, InsertPaymentMethod } from '@shared/schema';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  client_secret?: string;
  payment_method_types: string[];
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  paymentIntent?: PaymentIntent;
}

export class PaymentService {
  private static instance: PaymentService;
  private stripe: any;
  private paypal: any;

  private constructor() {
    this.initializePaymentGateways();
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  private async initializePaymentGateways() {
    try {
      // Initialize Stripe
      if (process.env.STRIPE_SECRET_KEY) {
        const stripe = await import('stripe');
        this.stripe = new stripe.default(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2024-12-18.acacia',
        });
        console.log('✅ Stripe initialized successfully');
      }

      // Initialize PayPal
      if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
        const paypal = await import('@paypal/checkout-server-sdk');
        const environment = process.env.NODE_ENV === 'production' 
          ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
          : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
        
        this.paypal = new paypal.core.PayPalHttpClient(environment);
        console.log('✅ PayPal initialized successfully');
      }
    } catch (error) {
      console.error('❌ Error initializing payment gateways:', error);
    }
  }

  /**
   * Create a payment intent for a booking
   */
  async createPaymentIntent(bookingId: string, amount: number, currency: string = 'USD'): Promise<PaymentResult> {
    try {
      // Validate booking exists
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return { success: false, error: 'Booking not found' };
      }

      // Create Stripe payment intent
      if (this.stripe) {
        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          metadata: {
            booking_id: bookingId,
            user_id: booking.userId,
            airport_code: booking.airportCode || 'unknown'
          },
          automatic_payment_methods: {
            enabled: true,
          },
        });

        // Log the payment intent creation
        await this.logPaymentIntent(bookingId, paymentIntent.id, amount, currency, 'stripe');

        return {
          success: true,
          paymentIntent: {
            id: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
            status: paymentIntent.status,
            client_secret: paymentIntent.client_secret,
            payment_method_types: paymentIntent.payment_method_types,
            metadata: paymentIntent.metadata
          }
        };
      }

      return { success: false, error: 'Stripe not configured' };
    } catch (error) {
      console.error('❌ Error creating payment intent:', error);
      return { success: false, error: 'Failed to create payment intent' };
    }
  }

  /**
   * Process a payment using Stripe
   */
  async processStripePayment(paymentIntentId: string, bookingId: string): Promise<PaymentResult> {
    try {
      if (!this.stripe) {
        return { success: false, error: 'Stripe not configured' };
      }

      // Retrieve the payment intent
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        // Create transaction record
        const transaction: InsertTransaction = {
          bookingId,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          status: 'completed',
          gatewayName: 'stripe',
          transactionId: paymentIntent.id,
          gatewayResponse: {
            payment_intent_id: paymentIntent.id,
            charge_id: paymentIntent.latest_charge,
            status: paymentIntent.status,
            amount_received: paymentIntent.amount_received,
            payment_method: paymentIntent.payment_method
          },
          processedAt: new Date()
        };

        const createdTransaction = await storage.createTransaction(transaction);

        // Update booking payment status
        await storage.updateBookingPaymentStatus(bookingId, 'completed', createdTransaction.id);

        return {
          success: true,
          transactionId: createdTransaction.id
        };
      } else {
        return { success: false, error: `Payment not completed. Status: ${paymentIntent.status}` };
      }
    } catch (error) {
      console.error('❌ Error processing Stripe payment:', error);
      return { success: false, error: 'Failed to process payment' };
    }
  }

  /**
   * Process a payment using PayPal
   */
  async processPayPalPayment(orderId: string, bookingId: string): Promise<PaymentResult> {
    try {
      if (!this.paypal) {
        return { success: false, error: 'PayPal not configured' };
      }

      // Capture the PayPal order
      const request = new (await import('@paypal/checkout-server-sdk')).orders.OrdersCaptureRequest(orderId);
      const capture = await this.paypal.execute(request);

      if (capture.result.status === 'COMPLETED') {
        // Create transaction record
        const transaction: InsertTransaction = {
          bookingId,
          amount: parseFloat(capture.result.purchase_units[0].amount.value),
          currency: capture.result.purchase_units[0].amount.currency_code,
          status: 'completed',
          gatewayName: 'paypal',
          transactionId: capture.result.id,
          gatewayResponse: {
            order_id: capture.result.id,
            status: capture.result.status,
            capture_id: capture.result.purchase_units[0].payments.captures[0].id,
            amount: capture.result.purchase_units[0].amount
          },
          processedAt: new Date()
        };

        const createdTransaction = await storage.createTransaction(transaction);

        // Update booking payment status
        await storage.updateBookingPaymentStatus(bookingId, 'completed', createdTransaction.id);

        return {
          success: true,
          transactionId: createdTransaction.id
        };
      } else {
        return { success: false, error: `PayPal payment not completed. Status: ${capture.result.status}` };
      }
    } catch (error) {
      console.error('❌ Error processing PayPal payment:', error);
      return { success: false, error: 'Failed to process PayPal payment' };
    }
  }

  /**
   * Save a payment method for a user
   */
  async savePaymentMethod(userId: string, paymentMethodData: any, gateway: 'stripe' | 'paypal'): Promise<PaymentMethod | null> {
    try {
      const paymentMethod: InsertPaymentMethod = {
        userId,
        paymentType: paymentMethodData.type || 'card',
        lastFour: paymentMethodData.last4 || paymentMethodData.last_four,
        expiryDate: paymentMethodData.exp_month && paymentMethodData.exp_year 
          ? `${paymentMethodData.exp_month}/${paymentMethodData.exp_year}`
          : undefined,
        isDefault: paymentMethodData.isDefault || false,
        tokenHash: this.hashPaymentToken(paymentMethodData.id || paymentMethodData.token),
        metadata: {
          gateway,
          brand: paymentMethodData.brand || paymentMethodData.card_type,
          country: paymentMethodData.country,
          gateway_payment_method_id: paymentMethodData.id || paymentMethodData.token
        }
      };

      return await storage.createPaymentMethod(paymentMethod);
    } catch (error) {
      console.error('❌ Error saving payment method:', error);
      return null;
    }
  }

  /**
   * Process a refund
   */
  async processRefund(transactionId: string, amount: number, reason: string): Promise<PaymentResult> {
    try {
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return { success: false, error: 'Transaction not found' };
      }

      let refundResult;
      
      if (transaction.gatewayName === 'stripe' && this.stripe) {
        const refund = await this.stripe.refunds.create({
          payment_intent: transaction.transactionId,
          amount: Math.round(amount * 100),
          reason: 'requested_by_customer'
        });
        refundResult = { refund_id: refund.id, status: refund.status };
      } else if (transaction.gatewayName === 'paypal' && this.paypal) {
        // PayPal refund logic would go here
        refundResult = { status: 'pending', note: 'PayPal refund requires manual processing' };
      } else {
        return { success: false, error: 'Unsupported payment gateway for refund' };
      }

      // Update transaction with refund information
      await storage.updateTransactionStatus(transactionId, 'refunded', {
        refund_amount: amount,
        refund_reason: reason,
        refund_result: refundResult
      });

      // Update booking with refund information
      await storage.updateBookingPaymentStatus(transaction.bookingId, 'refunded');

      return { success: true };
    } catch (error) {
      console.error('❌ Error processing refund:', error);
      return { success: false, error: 'Failed to process refund' };
    }
  }

  /**
   * Get payment methods for a user
   */
  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      return await storage.getUserPaymentMethods(userId);
    } catch (error) {
      console.error('❌ Error fetching user payment methods:', error);
      return [];
    }
  }

  /**
   * Validate payment method
   */
  async validatePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      if (this.stripe) {
        const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);
        return paymentMethod.status === 'active';
      }
      return false;
    } catch (error) {
      console.error('❌ Error validating payment method:', error);
      return false;
    }
  }

  /**
   * Log payment intent creation
   */
  private async logPaymentIntent(bookingId: string, paymentIntentId: string, amount: number, currency: string, gateway: string) {
    try {
      // This would typically log to a payment audit log
      console.log(`💰 Payment Intent Created: ${paymentIntentId} for booking ${bookingId}, Amount: ${amount} ${currency}, Gateway: ${gateway}`);
    } catch (error) {
      console.error('❌ Error logging payment intent:', error);
    }
  }

  /**
   * Hash payment token for security
   */
  private hashPaymentToken(token: string): string {
    // In production, use a proper hashing library like bcrypt
    return Buffer.from(token).toString('base64');
  }

  /**
   * Get payment gateway configuration
   */
  async getPaymentGatewayConfig(gatewayName: string) {
    try {
      return await storage.getPaymentGatewayConfig(gatewayName);
    } catch (error) {
      console.error('❌ Error fetching payment gateway config:', error);
      return null;
    }
  }
}

export default PaymentService;
