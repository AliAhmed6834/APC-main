import { Router } from 'express';
import EmailService from '../services/emailService';
import SmsService from '../services/smsService';
import { storage } from '../storage';
import { authenticateUser } from '../middleware/auth';

const router = Router();
const emailService = EmailService.getInstance();
const smsService = SmsService.getInstance();

/**
 * @route   POST /api/communication/send-email
 * @desc    Send an email using a template
 * @access  Private
 */
router.post('/send-email', authenticateUser, async (req, res) => {
  try {
    const { to, templateKey, locale, variables, subject, attachments } = req.body;
    const userId = req.user?.id;

    if (!to || !templateKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: to and templateKey' 
      });
    }

    // Add user ID to variables if not provided
    const emailVariables = { ...variables, userId };

    const result = await emailService.sendEmail({
      to,
      templateKey,
      locale,
      variables: emailVariables,
      subject,
      attachments
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email'
    });
  }
});

/**
 * @route   POST /api/communication/send-sms
 * @desc    Send an SMS message
 * @access  Private
 */
router.post('/send-sms', authenticateUser, async (req, res) => {
  try {
    const { to, message, templateKey, variables } = req.body;
    const userId = req.user?.id;

    if (!to || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: to and message' 
      });
    }

    // Validate phone number format
    if (!smsService.validatePhoneNumber(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Please use E.164 format (e.g., +1234567890)'
      });
    }

    const result = await smsService.sendSms({
      to,
      message,
      userId,
      templateKey,
      variables
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'SMS sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send SMS'
    });
  }
});

/**
 * @route   POST /api/communication/booking-confirmation
 * @desc    Send booking confirmation email and SMS
 * @access  Private
 */
router.post('/booking-confirmation', authenticateUser, async (req, res) => {
  try {
    const { 
      bookingId, 
      userEmail, 
      userPhone, 
      sendEmail = true, 
      sendSms = false 
    } = req.body;
    const userId = req.user?.id;

    if (!bookingId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required field: bookingId' 
      });
    }

    // Get booking details
    const booking = await storage.getBooking(bookingId);
    if (!booking || booking.userId !== userId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or access denied' 
      });
    }

    // Get parking lot details
    const parkingLot = await storage.getParkingLot(booking.parkingLotId);
    if (!parkingLot) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parking lot not found' 
      });
    }

    const bookingData = {
      id: booking.id,
      airportCode: booking.airportCode || 'Unknown',
      startDate: new Date(booking.startDate).toLocaleDateString(),
      endDate: new Date(booking.endDate).toLocaleDateString(),
      totalAmount: booking.totalAmount || 0,
      currency: booking.currency || 'USD',
      parkingLotName: parkingLot.name
    };

    const results = {
      email: null,
      sms: null
    };

    // Send email confirmation
    if (sendEmail && userEmail) {
      try {
        results.email = await emailService.sendBookingConfirmation(
          userId,
          userEmail,
          bookingData
        );
      } catch (error) {
        console.error('❌ Error sending booking confirmation email:', error);
        results.email = { success: false, error: error.message };
      }
    }

    // Send SMS confirmation
    if (sendSms && userPhone) {
      try {
        results.sms = await smsService.sendBookingConfirmationSms(
          userId,
          userPhone,
          {
            ...bookingData,
            confirmationNumber: booking.id.substring(0, 8).toUpperCase()
          }
        );
      } catch (error) {
        console.error('❌ Error sending booking confirmation SMS:', error);
        results.sms = { success: false, error: error.message };
      }
    }

    res.json({
      success: true,
      message: 'Communication sent',
      results
    });
  } catch (error) {
    console.error('❌ Error sending booking confirmation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send booking confirmation'
    });
  }
});

/**
 * @route   POST /api/communication/payment-confirmation
 * @desc    Send payment confirmation email and SMS
 * @access  Private
 */
router.post('/payment-confirmation', authenticateUser, async (req, res) => {
  try {
    const { 
      transactionId, 
      userEmail, 
      userPhone, 
      sendEmail = true, 
      sendSms = false 
    } = req.body;
    const userId = req.user?.id;

    if (!transactionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required field: transactionId' 
      });
    }

    // Get transaction details
    const transaction = await storage.getTransaction(transactionId);
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    // Get booking details
    const booking = await storage.getBooking(transaction.bookingId);
    if (!booking || booking.userId !== userId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Access denied to this transaction' 
      });
    }

    const paymentData = {
      transactionId: transaction.id,
      amount: transaction.amount,
      currency: transaction.currency,
      bookingId: transaction.bookingId,
      paymentMethod: transaction.gatewayName
    };

    const results = {
      email: null,
      sms: null
    };

    // Send email confirmation
    if (sendEmail && userEmail) {
      try {
        results.email = await emailService.sendPaymentConfirmation(
          userId,
          userEmail,
          paymentData
        );
      } catch (error) {
        console.error('❌ Error sending payment confirmation email:', error);
        results.email = { success: false, error: error.message };
      }
    }

    // Send SMS confirmation
    if (sendSms && userPhone) {
      try {
        results.sms = await smsService.sendPaymentConfirmationSms(
          userId,
          userPhone,
          paymentData
        );
      } catch (error) {
        console.error('❌ Error sending payment confirmation SMS:', error);
        results.sms = { success: false, error: error.message };
      }
    }

    res.json({
      success: true,
      message: 'Payment confirmation sent',
      results
    });
  } catch (error) {
    console.error('❌ Error sending payment confirmation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send payment confirmation'
    });
  }
});

/**
 * @route   POST /api/communication/booking-reminder
 * @desc    Send booking reminder email and SMS
 * @access  Private
 */
router.post('/booking-reminder', authenticateUser, async (req, res) => {
  try {
    const { 
      bookingId, 
      userEmail, 
      userPhone, 
      sendEmail = true, 
      sendSms = false 
    } = req.body;
    const userId = req.user?.id;

    if (!bookingId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required field: bookingId' 
      });
    }

    // Get booking details
    const booking = await storage.getBooking(bookingId);
    if (!booking || booking.userId !== userId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or access denied' 
      });
    }

    // Get parking lot details
    const parkingLot = await storage.getParkingLot(booking.parkingLotId);
    if (!parkingLot) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parking lot not found' 
      });
    }

    const bookingData = {
      id: booking.id,
      airportCode: booking.airportCode || 'Unknown',
      startDate: new Date(booking.startDate).toLocaleDateString(),
      parkingLotName: parkingLot.name,
      confirmationNumber: booking.id.substring(0, 8).toUpperCase()
    };

    const results = {
      email: null,
      sms: null
    };

    // Send email reminder
    if (sendEmail && userEmail) {
      try {
        results.email = await emailService.sendBookingReminder(
          userId,
          userEmail,
          bookingData
        );
      } catch (error) {
        console.error('❌ Error sending booking reminder email:', error);
        results.email = { success: false, error: error.message };
      }
    }

    // Send SMS reminder
    if (sendSms && userPhone) {
      try {
        results.sms = await smsService.sendBookingReminderSms(
          userId,
          userPhone,
          bookingData
        );
      } catch (error) {
        console.error('❌ Error sending booking reminder SMS:', error);
        results.sms = { success: false, error: error.message };
      }
    }

    res.json({
      success: true,
      message: 'Booking reminder sent',
      results
    });
  } catch (error) {
    console.error('❌ Error sending booking reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send booking reminder'
    });
  }
});

/**
 * @route   POST /api/communication/cancellation
 * @desc    Send cancellation confirmation email and SMS
 * @access  Private
 */
router.post('/cancellation', authenticateUser, async (req, res) => {
  try {
    const { 
      bookingId, 
      userEmail, 
      userPhone, 
      sendEmail = true, 
      sendSms = false 
    } = req.body;
    const userId = req.user?.id;

    if (!bookingId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required field: bookingId' 
      });
    }

    // Get booking details
    const booking = await storage.getBooking(bookingId);
    if (!booking || booking.userId !== userId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or access denied' 
      });
    }

    const bookingData = {
      id: booking.id,
      airportCode: booking.airportCode || 'Unknown',
      startDate: new Date(booking.startDate).toLocaleDateString(),
      endDate: new Date(booking.endDate).toLocaleDateString(),
      refundAmount: booking.totalAmount || 0,
      currency: booking.currency || 'USD'
    };

    const results = {
      email: null,
      sms: null
    };

    // Send email cancellation
    if (sendEmail && userEmail) {
      try {
        results.email = await emailService.sendCancellationEmail(
          userId,
          userEmail,
          bookingData
        );
      } catch (error) {
        console.error('❌ Error sending cancellation email:', error);
        results.email = { success: false, error: error.message };
      }
    }

    // Send SMS cancellation
    if (sendSms && userPhone) {
      try {
        results.sms = await smsService.sendCancellationSms(
          userId,
          userPhone,
          bookingData
        );
      } catch (error) {
        console.error('❌ Error sending cancellation SMS:', error);
        results.sms = { success: false, error: error.message };
      }
    }

    res.json({
      success: true,
      message: 'Cancellation confirmation sent',
      results
    });
  } catch (error) {
    console.error('❌ Error sending cancellation confirmation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send cancellation confirmation'
    });
  }
});

/**
 * @route   POST /api/communication/promotional
 * @desc    Send promotional email and SMS
 * @access  Private (Admin only in production)
 */
router.post('/promotional', authenticateUser, async (req, res) => {
  try {
    const { 
      userEmail, 
      userPhone, 
      promoData, 
      sendEmail = true, 
      sendSms = false 
    } = req.body;

    if (!promoData || (!userEmail && !userPhone)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: promoData and at least one contact method' 
      });
    }

    const results = {
      email: null,
      sms: null
    };

    // Send promotional email
    if (sendEmail && userEmail) {
      try {
        results.email = await emailService.sendPromotionalEmail(userEmail, promoData);
      } catch (error) {
        console.error('❌ Error sending promotional email:', error);
        results.email = { success: false, error: error.message };
      }
    }

    // Send promotional SMS
    if (sendSms && userPhone) {
      try {
        results.sms = await smsService.sendPromotionalSms(userPhone, promoData);
      } catch (error) {
        console.error('❌ Error sending promotional SMS:', error);
        results.sms = { success: false, error: error.message };
      }
    }

    res.json({
      success: true,
      message: 'Promotional communication sent',
      results
    });
  } catch (error) {
    console.error('❌ Error sending promotional communication:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send promotional communication'
    });
  }
});

/**
 * @route   GET /api/communication/email-logs
 * @desc    Get email logs for a user
 * @access  Private
 */
router.get('/email-logs', authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;

    const logs = await storage.getEmailLogs(userId, parseInt(limit as string), {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });

    res.json({
      success: true,
      logs: logs.data,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: logs.total,
        pages: Math.ceil(logs.total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching email logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email logs'
    });
  }
});

/**
 * @route   GET /api/communication/sms-logs
 * @desc    Get SMS logs for a user
 * @access  Private
 */
router.get('/sms-logs', authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;

    const logs = await storage.getSmsLogs(userId, parseInt(limit as string), {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });

    res.json({
      success: true,
      logs: logs.data,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: logs.total,
        pages: Math.ceil(logs.total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching SMS logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SMS logs'
    });
  }
});

/**
 * @route   GET /api/communication/analytics
 * @desc    Get communication analytics for a user
 * @access  Private
 */
router.get('/analytics', authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate ? new Date(endDate as string) : new Date();

    const [emailAnalytics, smsAnalytics] = await Promise.all([
      emailService.getEmailAnalytics(start, end),
      smsService.getSmsAnalytics(start, end)
    ]);

    res.json({
      success: true,
      analytics: {
        email: emailAnalytics,
        sms: smsAnalytics,
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching communication analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch communication analytics'
    });
  }
});

/**
 * @route   POST /api/communication/test
 * @desc    Test communication services
 * @access  Private (Admin only in production)
 */
router.post('/test', authenticateUser, async (req, res) => {
  try {
    const { testEmail, testPhone } = req.body;

    const results = {
      email: null,
      sms: null
    };

    // Test email service
    if (testEmail) {
      try {
        results.email = await emailService.testConnection();
      } catch (error) {
        console.error('❌ Email service test failed:', error);
        results.email = false;
      }
    }

    // Test SMS service
    if (testPhone) {
      try {
        results.sms = await smsService.testConnection();
      } catch (error) {
        console.error('❌ SMS service test failed:', error);
        results.sms = false;
      }
    }

    res.json({
      success: true,
      message: 'Communication services tested',
      results
    });
  } catch (error) {
    console.error('❌ Error testing communication services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test communication services'
    });
  }
});

export default router;
