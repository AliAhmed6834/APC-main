import { Router } from 'express';
import PaymentService from '../services/paymentService';
import { storage } from '../storage';
import { authenticateUser } from '../middleware/auth';

const router = Router();
const paymentService = PaymentService.getInstance();

/**
 * @route   POST /api/payments/create-intent
 * @desc    Create a payment intent for a booking
 * @access  Private
 */
router.post('/create-intent', authenticateUser, async (req, res) => {
  try {
    const { bookingId, amount, currency = 'USD' } = req.body;
    const userId = req.user?.id;

    if (!bookingId || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: bookingId and amount' 
      });
    }

    // Verify the booking belongs to the user
    const booking = await storage.getBooking(bookingId);
    if (!booking || booking.userId !== userId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or access denied' 
      });
    }

    // Create payment intent
    const result = await paymentService.createPaymentIntent(bookingId, amount, currency);
    
    if (result.success) {
      res.json({
        success: true,
        paymentIntent: result.paymentIntent
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent'
    });
  }
});

/**
 * @route   POST /api/payments/confirm-stripe
 * @desc    Confirm a Stripe payment
 * @access  Private
 */
router.post('/confirm-stripe', authenticateUser, async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;
    const userId = req.user?.id;

    if (!paymentIntentId || !bookingId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: paymentIntentId and bookingId' 
      });
    }

    // Verify the booking belongs to the user
    const booking = await storage.getBooking(bookingId);
    if (!booking || booking.userId !== userId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or access denied' 
      });
    }

    // Process the payment
    const result = await paymentService.processStripePayment(paymentIntentId, bookingId);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        transactionId: result.transactionId
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error confirming Stripe payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
});

/**
 * @route   POST /api/payments/confirm-paypal
 * @desc    Confirm a PayPal payment
 * @access  Private
 */
router.post('/confirm-paypal', authenticateUser, async (req, res) => {
  try {
    const { orderId, bookingId } = req.body;
    const userId = req.user?.id;

    if (!orderId || !bookingId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: orderId and bookingId' 
      });
    }

    // Verify the booking belongs to the user
    const booking = await storage.getBooking(bookingId);
    if (!booking || booking.userId !== userId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or access denied' 
      });
    }

    // Process the payment
    const result = await paymentService.processPayPalPayment(orderId, bookingId);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        transactionId: result.transactionId
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error confirming PayPal payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
});

/**
 * @route   POST /api/payments/save-method
 * @desc    Save a payment method for a user
 * @access  Private
 */
router.post('/save-method', authenticateUser, async (req, res) => {
  try {
    const { paymentMethodData, gateway } = req.body;
    const userId = req.user?.id;

    if (!paymentMethodData || !gateway) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: paymentMethodData and gateway' 
      });
    }

    if (!['stripe', 'paypal'].includes(gateway)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid gateway. Supported: stripe, paypal' 
      });
    }

    // Save the payment method
    const paymentMethod = await paymentService.savePaymentMethod(
      userId, 
      paymentMethodData, 
      gateway
    );

    if (paymentMethod) {
      res.json({
        success: true,
        message: 'Payment method saved successfully',
        paymentMethod
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to save payment method'
      });
    }
  } catch (error) {
    console.error('❌ Error saving payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save payment method'
    });
  }
});

/**
 * @route   GET /api/payments/methods
 * @desc    Get user's payment methods
 * @access  Private
 */
router.get('/methods', authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const paymentMethods = await paymentService.getUserPaymentMethods(userId);

    res.json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    console.error('❌ Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods'
    });
  }
});

/**
 * @route   DELETE /api/payments/methods/:id
 * @desc    Delete a payment method
 * @access  Private
 */
router.delete('/methods/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Verify the payment method belongs to the user
    const paymentMethod = await storage.getPaymentMethod(id);
    if (!paymentMethod || paymentMethod.userId !== userId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment method not found or access denied' 
      });
    }

    // Delete the payment method
    await storage.deletePaymentMethod(id);

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment method'
    });
  }
});

/**
 * @route   POST /api/payments/refund
 * @desc    Process a refund
 * @access  Private
 */
router.post('/refund', authenticateUser, async (req, res) => {
  try {
    const { transactionId, amount, reason } = req.body;
    const userId = req.user?.id;

    if (!transactionId || !amount || !reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: transactionId, amount, and reason' 
      });
    }

    // Verify the transaction belongs to the user
    const transaction = await storage.getTransaction(transactionId);
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    const booking = await storage.getBooking(transaction.bookingId);
    if (!booking || booking.userId !== userId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Access denied to this transaction' 
      });
    }

    // Process the refund
    const result = await paymentService.processRefund(transactionId, amount, reason);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Refund processed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
});

/**
 * @route   GET /api/payments/transactions
 * @desc    Get user's transaction history
 * @access  Private
 */
router.get('/transactions', authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;

    // Get user's bookings
    const userBookings = await storage.getUserBookings(userId);
    const bookingIds = userBookings.map(booking => booking.id);

    // Get transactions for these bookings
    const transactions = await storage.getTransactionsByBookings(bookingIds, {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });

    res.json({
      success: true,
      transactions: transactions.data,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: transactions.total,
        pages: Math.ceil(transactions.total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

/**
 * @route   GET /api/payments/transactions/:id
 * @desc    Get a specific transaction
 * @access  Private
 */
router.get('/transactions/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get the transaction
    const transaction = await storage.getTransaction(id);
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    // Verify the transaction belongs to the user
    const booking = await storage.getBooking(transaction.bookingId);
    if (!booking || booking.userId !== userId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Access denied to this transaction' 
      });
    }

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('❌ Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction'
    });
  }
});

/**
 * @route   POST /api/payments/webhook/stripe
 * @desc    Handle Stripe webhook events
 * @access  Public (but verified by Stripe signature)
 */
router.post('/webhook/stripe', async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing webhook signature or secret' 
      });
    }

    // Verify webhook signature
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Webhook signature verification failed' 
      });
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('💰 Payment succeeded:', paymentIntent.id);
        
        // Update booking payment status
        if (paymentIntent.metadata?.booking_id) {
          await storage.updateBookingPaymentStatus(
            paymentIntent.metadata.booking_id,
            'completed'
          );
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('❌ Payment failed:', failedPayment.id);
        
        // Update booking payment status
        if (failedPayment.metadata?.booking_id) {
          await storage.updateBookingPaymentStatus(
            failedPayment.metadata.booking_id,
            'failed'
          );
        }
        break;

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Error handling Stripe webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle webhook'
    });
  }
});

/**
 * @route   GET /api/payments/gateway-config
 * @desc    Get payment gateway configuration
 * @access  Public
 */
router.get('/gateway-config', async (req, res) => {
  try {
    const { gateway } = req.query;
    
    if (!gateway || !['stripe', 'paypal'].includes(gateway as string)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid gateway parameter' 
      });
    }

    const config = await storage.getPaymentGatewayConfig(gateway as string);
    
    if (config) {
      res.json({
        success: true,
        config: {
          name: config.gatewayName,
          isActive: config.isActive,
          supportedCurrencies: config.supportedCurrencies,
          publicKey: gateway === 'stripe' ? process.env.STRIPE_PUBLISHABLE_KEY : undefined
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Gateway configuration not found'
      });
    }
  } catch (error) {
    console.error('❌ Error fetching gateway config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gateway configuration'
    });
  }
});

export default router;
