import { Router } from 'express';
import { performanceMonitor } from './performance-monitor';

const router = Router();

// Get current performance metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await performanceMonitor.collectMetrics();
    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    res.status(500).json({ error: 'Failed to get performance metrics' });
  }
});

// Get performance summary with trends and recommendations
router.get('/summary', async (req, res) => {
  try {
    const summary = await performanceMonitor.getPerformanceSummary();
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error getting performance summary:', error);
    res.status(500).json({ error: 'Failed to get performance summary' });
  }
});

// Get metrics history
router.get('/history', async (req, res) => {
  try {
    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 20;
    const history = performanceMonitor.getMetricsHistory(limitNum);
    
    res.json({
      success: true,
      history,
      count: history.length
    });
  } catch (error) {
    console.error('Error getting metrics history:', error);
    res.status(500).json({ error: 'Failed to get metrics history' });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const health = await performanceMonitor.healthCheck();
    
    const statusCode = health.status === 'critical' ? 500 : 
                      health.status === 'warning' ? 200 : 200;
    
    res.status(statusCode).json({
      success: health.status !== 'critical',
      health
    });
  } catch (error) {
    console.error('Error performing health check:', error);
    res.status(500).json({ 
      success: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Clear metrics (for development)
router.post('/clear', async (req, res) => {
  try {
    performanceMonitor.clearMetrics();
    res.json({
      success: true,
      message: 'Performance metrics cleared'
    });
  } catch (error) {
    console.error('Error clearing metrics:', error);
    res.status(500).json({ error: 'Failed to clear metrics' });
  }
});

// Performance test endpoint
router.post('/test', async (req, res) => {
  try {
    const { testType } = req.body;
    
    performanceMonitor.startTiming('test');
    
    let result;
    switch (testType) {
      case 'bundle':
        // Test bundle generation
        performanceMonitor.startTiming('bundleGeneration');
        // Simulate bundle generation
        await new Promise(resolve => setTimeout(resolve, 100));
        const bundleTime = performanceMonitor.endTiming('bundleGeneration');
        result = { bundleGeneration: bundleTime };
        break;
        
      case 'review':
        // Test review generation
        performanceMonitor.startTiming('reviewGeneration');
        // Simulate review generation
        await new Promise(resolve => setTimeout(resolve, 200));
        const reviewTime = performanceMonitor.endTiming('reviewGeneration');
        result = { reviewGeneration: reviewTime };
        break;
        
      case 'state':
        // Test state transition
        performanceMonitor.startTiming('stateTransition');
        // Simulate state transition
        await new Promise(resolve => setTimeout(resolve, 50));
        const stateTime = performanceMonitor.endTiming('stateTransition');
        result = { stateTransition: stateTime };
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid test type' });
    }
    
    const totalTime = performanceMonitor.endTiming('test');
    
    res.json({
      success: true,
      testType,
      result,
      totalTime
    });
  } catch (error) {
    console.error('Error running performance test:', error);
    res.status(500).json({ error: 'Failed to run performance test' });
  }
});

export default router;
