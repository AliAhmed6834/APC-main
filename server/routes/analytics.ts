import express from 'express';
import { storage } from '../storage.js';
import { authenticateToken } from '../middleware/auth.js';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();

// Rate limiting for analytics endpoints
const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many analytics requests, please try again later.'
});

// Apply rate limiting to all analytics routes
router.use(analyticsLimiter);

// Customer Analytics Routes
router.get('/customers/overview', authenticateToken, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const userId = req.user?.id;

    // Get customer metrics
    const metrics = await storage.getCustomerMetrics(userId, timeRange as string);
    
    // Get customer segments
    const segments = await storage.getCustomerSegments(userId, timeRange as string);
    
    // Get booking trends
    const trends = await storage.getCustomerTrends(userId, timeRange as string);
    
    // Get geographic data
    const geography = await storage.getCustomerGeography(userId, timeRange as string);

    res.json({
      success: true,
      data: {
        metrics,
        segments,
        trends,
        geography
      }
    });
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer analytics'
    });
  }
});

router.get('/customers/segments', authenticateToken, async (req, res) => {
  try {
    const { timeRange = '30d', segmentType = 'all' } = req.query;
    const userId = req.user?.id;

    const segments = await storage.getCustomerSegments(userId, timeRange as string, segmentType as string);
    
    res.json({
      success: true,
      data: segments
    });
  } catch (error) {
    console.error('Error fetching customer segments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer segments'
    });
  }
});

router.get('/customers/trends', authenticateToken, async (req, res) => {
  try {
    const { timeRange = '30d', metric = 'bookings' } = req.query;
    const userId = req.user?.id;

    const trends = await storage.getCustomerTrends(userId, timeRange as string, metric as string);
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Error fetching customer trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer trends'
    });
  }
});

router.get('/customers/geography', authenticateToken, async (req, res) => {
  try {
    const { timeRange = '30d', region = 'all' } = req.query;
    const userId = req.user?.id;

    const geography = await storage.getCustomerGeography(userId, timeRange as string, region as string);
    
    res.json({
      success: true,
      data: geography
    });
  } catch (error) {
    console.error('Error fetching customer geography:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer geography'
    });
  }
});

// Supplier Analytics Routes
router.get('/suppliers/overview', authenticateToken, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const userId = req.user?.id;

    // Get supplier metrics
    const metrics = await storage.getSupplierMetrics(userId, timeRange as string);
    
    // Get supplier performance
    const performance = await storage.getSupplierPerformance(userId, timeRange as string);
    
    // Get revenue trends
    const trends = await storage.getSupplierTrends(userId, timeRange as string);
    
    // Get geographic performance
    const geography = await storage.getSupplierGeography(userId, timeRange as string);
    
    // Get operational metrics
    const operations = await storage.getSupplierOperations(userId, timeRange as string);

    res.json({
      success: true,
      data: {
        metrics,
        performance,
        trends,
        geography,
        operations
      }
    });
  } catch (error) {
    console.error('Error fetching supplier analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supplier analytics'
    });
  }
});

router.get('/suppliers/performance', authenticateToken, async (req, res) => {
  try {
    const { timeRange = '30d', sortBy = 'revenue', limit = 50 } = req.query;
    const userId = req.user?.id;

    const performance = await storage.getSupplierPerformance(
      userId, 
      timeRange as string, 
      sortBy as string, 
      parseInt(limit as string)
    );
    
    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Error fetching supplier performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supplier performance'
    });
  }
});

router.get('/suppliers/trends', authenticateToken, async (req, res) => {
  try {
    const { timeRange = '30d', metric = 'revenue' } = req.query;
    const userId = req.user?.id;

    const trends = await storage.getSupplierTrends(userId, timeRange as string, metric as string);
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Error fetching supplier trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supplier trends'
    });
  }
});

router.get('/suppliers/geography', authenticateToken, async (req, res) => {
  try {
    const { timeRange = '30d', region = 'all' } = req.query;
    const userId = req.user?.id;

    const geography = await storage.getSupplierGeography(userId, timeRange as string, region as string);
    
    res.json({
      success: true,
      data: geography
    });
  } catch (error) {
    console.error('Error fetching supplier geography:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supplier geography'
    });
  }
});

router.get('/suppliers/operations', authenticateToken, async (req, res) => {
  try {
    const { timeRange = '30d', category = 'all' } = req.query;
    const userId = req.user?.id;

    const operations = await storage.getSupplierOperations(userId, timeRange as string, category as string);
    
    res.json({
      success: true,
      data: operations
    });
  } catch (error) {
    console.error('Error fetching supplier operations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supplier operations'
    });
  }
});

// Business Intelligence Routes
router.get('/business/overview', authenticateToken, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const userId = req.user?.id;

    // Get business overview metrics
    const overview = await storage.getBusinessOverview(userId, timeRange as string);
    
    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Error fetching business overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch business overview'
    });
  }
});

router.get('/business/revenue', authenticateToken, async (req, res) => {
  try {
    const { timeRange = '30d', breakdown = 'daily' } = req.query;
    const userId = req.user?.id;

    const revenue = await storage.getBusinessRevenue(userId, timeRange as string, breakdown as string);
    
    res.json({
      success: true,
      data: revenue
    });
  } catch (error) {
    console.error('Error fetching business revenue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch business revenue'
    });
  }
});

router.get('/business/bookings', authenticateToken, async (req, res) => {
  try {
    const { timeRange = '30d', breakdown = 'daily' } = req.query;
    const userId = req.user?.id;

    const bookings = await storage.getBusinessBookings(userId, timeRange as string, breakdown as string);
    
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching business bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch business bookings'
    });
  }
});

// Search Analytics Routes
router.get('/search/overview', authenticateToken, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const userId = req.user?.id;

    const searchAnalytics = await storage.getSearchAnalytics(userId, timeRange as string);
    
    res.json({
      success: true,
      data: searchAnalytics
    });
  } catch (error) {
    console.error('Error fetching search analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch search analytics'
    });
  }
});

router.get('/search/popular', authenticateToken, async (req, res) => {
  try {
    const { timeRange = '30d', limit = 20 } = req.query;
    const userId = req.user?.id;

    const popularSearches = await storage.getPopularSearches(
      userId, 
      timeRange as string, 
      parseInt(limit as string)
    );
    
    res.json({
      success: true,
      data: popularSearches
    });
  } catch (error) {
    console.error('Error fetching popular searches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular searches'
    });
  }
});

router.get('/search/conversion', authenticateToken, async (req, res) => {
  try {
    const { timeRange = '30d', searchType = 'all' } = req.query;
    const userId = req.user?.id;

    const conversionRates = await storage.getSearchConversionRates(
      userId, 
      timeRange as string, 
      searchType as string
    );
    
    res.json({
      success: true,
      data: conversionRates
    });
  } catch (error) {
    console.error('Error fetching search conversion rates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch search conversion rates'
    });
  }
});

// Export Analytics Data
router.post('/export', authenticateToken, async (req, res) => {
  try {
    const { 
      type, 
      timeRange = '30d', 
      format = 'csv',
      filters = {} 
    } = req.body;
    const userId = req.user?.id;

    // Validate export type
    const validTypes = ['customers', 'suppliers', 'business', 'search', 'all'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid export type'
      });
    }

    // Generate export data
    const exportData = await storage.generateAnalyticsExport(
      userId,
      type,
      timeRange,
      format,
      filters
    );

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-${type}-${timeRange}.${format}"`);
    
    res.send(exportData);
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export analytics data'
    });
  }
});

// Analytics Dashboard Configuration
router.get('/dashboard/config', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const dashboardConfig = await storage.getAnalyticsDashboardConfig(userId);
    
    res.json({
      success: true,
      data: dashboardConfig
    });
  } catch (error) {
    console.error('Error fetching dashboard config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard configuration'
    });
  }
});

router.post('/dashboard/config', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { config } = req.body;
    
    await storage.updateAnalyticsDashboardConfig(userId, config);
    
    res.json({
      success: true,
      message: 'Dashboard configuration updated successfully'
    });
  } catch (error) {
    console.error('Error updating dashboard config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update dashboard configuration'
    });
  }
});

// Real-time Analytics (WebSocket endpoint for future implementation)
router.get('/realtime', authenticateToken, (req, res) => {
  // This endpoint will be used for WebSocket connections in the future
  res.json({
    success: true,
    message: 'Real-time analytics endpoint - WebSocket implementation coming soon'
  });
});

// Analytics Health Check
router.get('/health', async (req, res) => {
  try {
    // Check if analytics data is accessible
    const healthCheck = await storage.analyticsHealthCheck();
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      data: healthCheck
    });
  } catch (error) {
    console.error('Analytics health check failed:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Analytics service unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
