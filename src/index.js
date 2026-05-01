const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const config = require('../config/default');
const logger = require('./utils/logger');
const RiskAnalyzer = require('./services/risk-analyzer');

// Initialize Express app
const app = express();
const riskAnalyzer = new RiskAnalyzer();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: logger.stream }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

// API Routes
const apiRouter = express.Router();

/**
 * GET /api/v1/analyze
 * Perform comprehensive risk analysis
 */
apiRouter.get('/analyze', async (req, res) => {
  try {
    const { projectPath } = req.query;
    const analysis = await riskAnalyzer.analyzeRisk({ projectPath });
    
    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    logger.error('Error in /analyze endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/analyze/release
 * Analyze specific release
 */
apiRouter.post('/analyze/release', async (req, res) => {
  try {
    const releaseInfo = req.body;
    
    if (!releaseInfo.version) {
      return res.status(400).json({
        success: false,
        error: 'Release version is required',
      });
    }

    const analysis = await riskAnalyzer.analyzeRelease(releaseInfo);
    
    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    logger.error('Error in /analyze/release endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/risk/realtime
 * Get real-time risk score
 */
apiRouter.get('/risk/realtime', async (req, res) => {
  try {
    const risk = await riskAnalyzer.getRealTimeRisk();
    
    res.json({
      success: true,
      data: risk,
    });
  } catch (error) {
    logger.error('Error in /risk/realtime endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/metrics/logs
 * Get log metrics
 */
apiRouter.get('/metrics/logs', async (req, res) => {
  try {
    const metrics = await riskAnalyzer.collectLogMetrics();
    
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('Error in /metrics/logs endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/metrics/git
 * Get Git metrics
 */
apiRouter.get('/metrics/git', async (req, res) => {
  try {
    const metrics = await riskAnalyzer.collectGitMetrics();
    
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('Error in /metrics/git endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/metrics/code
 * Get code metrics
 */
apiRouter.get('/metrics/code', async (req, res) => {
  try {
    const { projectPath } = req.query;
    const metrics = await riskAnalyzer.collectCodeMetrics(projectPath);
    
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('Error in /metrics/code endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/model/train
 * Train the ML model with historical data
 */
apiRouter.post('/model/train', async (req, res) => {
  try {
    const { trainingData } = req.body;
    
    if (!trainingData || !Array.isArray(trainingData)) {
      return res.status(400).json({
        success: false,
        error: 'Training data array is required',
      });
    }

    const result = await riskAnalyzer.trainModel(trainingData);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error in /model/train endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/stats
 * Get analyzer statistics
 */
apiRouter.get('/stats', (req, res) => {
  try {
    const stats = riskAnalyzer.getStats();
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error in /stats endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Mount API router
app.use(config.api.prefix, apiRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Initialize and start server
async function start() {
  try {
    logger.info('Starting AI Organizational Risk Predictor...');
    
    // Initialize risk analyzer
    await riskAnalyzer.initialize();
    
    // Start Express server
    const server = app.listen(config.app.port, config.app.host, () => {
      logger.info(`Server running on http://${config.app.host}:${config.app.port}`);
      logger.info(`API available at http://${config.app.host}:${config.app.port}${config.api.prefix}`);
      logger.info(`Environment: ${config.app.env}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await riskAnalyzer.stop();
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully...');
      server.close(async () => {
        await riskAnalyzer.stop();
        logger.info('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
if (require.main === module) {
  start();
}

module.exports = { app, riskAnalyzer };

// Made with Bob
