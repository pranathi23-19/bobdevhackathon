const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const config = require('../config/default');
const logger = require('./utils/logger');
const RiskAnalyzer = require('./services/risk-analyzer');
const MongoDBService = require('./services/mongodb-service');

// Initialize Express app
const app = express();
const riskAnalyzer = new RiskAnalyzer();
const mongoDBService = new MongoDBService(config.integrations.mongodb);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for the dashboard
}));
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: logger.stream }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

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

/**
 * GET /api/v1/logs/report
 * Generate a detailed log report with analysis
 */
apiRouter.get('/logs/report', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      levels = 'ERROR,CRITICAL,WARN',
      services = null,
      format = 'json'
    } = req.query;
    
    if (mongoDBService.isEnabled && await mongoDBService.isConnected()) {
      // Parse parameters
      const levelArray = levels.split(',');
      const serviceArray = services ? services.split(',') : null;
      
      // Calculate time range
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(end.getTime() - 24 * 60 * 60 * 1000); // Default: last 24 hours
      
      // Fetch logs
      const logs = await mongoDBService.getRecentLogs({
        size: 1000,
        levels: levelArray,
        timeRange: `now-${Math.floor((end - start) / 1000)}s`,
        services: serviceArray
      });
      
      // Get statistics
      const stats = await mongoDBService.getErrorStats();
      
      // Generate report
      const report = {
        generatedAt: new Date().toISOString(),
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
          duration: `${Math.floor((end - start) / (1000 * 60 * 60))} hours`
        },
        summary: {
          totalLogs: logs.length,
          byLevel: stats.byLevel,
          byService: stats.byService,
          criticalIssues: logs.filter(l => l.level === 'CRITICAL').length,
          errors: logs.filter(l => l.level === 'ERROR').length,
          warnings: logs.filter(l => l.level === 'WARN').length
        },
        topErrors: logs
          .filter(l => l.level === 'ERROR' || l.level === 'CRITICAL')
          .slice(0, 10)
          .map(log => ({
            timestamp: log.timestamp,
            level: log.level,
            service: log.service,
            message: log.message,
            stack: log.stack
          })),
        timeline: stats.timeline,
        recommendations: generateRecommendations(logs, stats)
      };
      
      if (format === 'html') {
        // Generate HTML report
        const html = generateHTMLReport(report);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      } else {
        res.json({
          success: true,
          data: report
        });
      }
    } else {
      res.status(503).json({
        success: false,
        error: 'MongoDB is not enabled or not connected'
      });
    }
  } catch (error) {
    logger.error('Error in /logs/report endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/logs/export
 * Export logs to CSV or JSON file
 */
apiRouter.post('/logs/export', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      levels = ['ERROR', 'CRITICAL', 'WARN'],
      services = null,
      format = 'csv'
    } = req.body;
    
    if (mongoDBService.isEnabled && await mongoDBService.isConnected()) {
      // Calculate time range
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(end.getTime() - 24 * 60 * 60 * 1000);
      
      // Fetch logs
      const logs = await mongoDBService.getRecentLogs({
        size: 10000,
        levels: levels,
        timeRange: `now-${Math.floor((end - start) / 1000)}s`,
        services: services
      });
      
      if (format === 'csv') {
        // Generate CSV
        const csv = generateCSV(logs);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="logs-${Date.now()}.csv"`);
        res.send(csv);
      } else {
        // Return JSON
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="logs-${Date.now()}.json"`);
        res.json(logs);
      }
    } else {
      res.status(503).json({
        success: false,
        error: 'MongoDB is not enabled or not connected'
      });
    }
  } catch (error) {
    logger.error('Error in /logs/export endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to generate recommendations
function generateRecommendations(logs, stats) {
  const recommendations = [];
  
  // Check for high error rates
  const errorCount = logs.filter(l => l.level === 'ERROR').length;
  if (errorCount > 10) {
    recommendations.push({
      priority: 'high',
      category: 'error-rate',
      message: `High error rate detected: ${errorCount} errors in the analyzed period`,
      action: 'Investigate root causes and implement error handling improvements'
    });
  }
  
  // Check for critical issues
  const criticalCount = logs.filter(l => l.level === 'CRITICAL').length;
  if (criticalCount > 0) {
    recommendations.push({
      priority: 'critical',
      category: 'critical-issues',
      message: `${criticalCount} critical issues require immediate attention`,
      action: 'Review and resolve critical errors immediately'
    });
  }
  
  // Check for service-specific issues
  stats.byService.forEach(service => {
    if (service.count > 15) {
      recommendations.push({
        priority: 'medium',
        category: 'service-health',
        message: `Service "${service.service}" has ${service.count} logged issues`,
        action: `Review ${service.service} service health and performance`
      });
    }
  });
  
  return recommendations;
}

// Helper function to generate HTML report
function generateHTMLReport(report) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Log Analysis Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .stat-card { background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #4CAF50; }
    .stat-card h3 { margin: 0 0 10px 0; color: #666; font-size: 14px; }
    .stat-card .value { font-size: 32px; font-weight: bold; color: #333; }
    .error { border-left-color: #f44336; }
    .warning { border-left-color: #ff9800; }
    .critical { border-left-color: #d32f2f; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #4CAF50; color: white; }
    tr:hover { background: #f5f5f5; }
    .recommendation { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 10px 0; border-radius: 4px; }
    .recommendation.critical { background: #f8d7da; border-left-color: #dc3545; }
    .recommendation.high { background: #fff3cd; border-left-color: #ff9800; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Log Analysis Report</h1>
    <p><strong>Generated:</strong> ${report.generatedAt}</p>
    <p><strong>Period:</strong> ${report.period.start} to ${report.period.end} (${report.period.duration})</p>
    
    <h2>Summary</h2>
    <div class="summary">
      <div class="stat-card">
        <h3>Total Logs</h3>
        <div class="value">${report.summary.totalLogs}</div>
      </div>
      <div class="stat-card critical">
        <h3>Critical Issues</h3>
        <div class="value">${report.summary.criticalIssues}</div>
      </div>
      <div class="stat-card error">
        <h3>Errors</h3>
        <div class="value">${report.summary.errors}</div>
      </div>
      <div class="stat-card warning">
        <h3>Warnings</h3>
        <div class="value">${report.summary.warnings}</div>
      </div>
    </div>
    
    <h2>Top Errors</h2>
    <table>
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Level</th>
          <th>Service</th>
          <th>Message</th>
        </tr>
      </thead>
      <tbody>
        ${report.topErrors.map(log => `
          <tr>
            <td>${new Date(log.timestamp).toLocaleString()}</td>
            <td><span style="color: ${log.level === 'CRITICAL' ? '#d32f2f' : '#f44336'}">${log.level}</span></td>
            <td>${log.service}</td>
            <td>${log.message}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <h2>Recommendations</h2>
    ${report.recommendations.map(rec => `
      <div class="recommendation ${rec.priority}">
        <strong>${rec.priority.toUpperCase()}: ${rec.message}</strong>
        <p>${rec.action}</p>
      </div>
    `).join('')}
    
    <h2>Logs by Service</h2>
    <table>
      <thead>
        <tr>
          <th>Service</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        ${report.summary.byService.map(s => `
          <tr>
            <td>${s.service}</td>
            <td>${s.count}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>
  `;
}

// Helper function to generate CSV
function generateCSV(logs) {
  const headers = ['Timestamp', 'Level', 'Service', 'Message', 'Stack'];
  const rows = logs.map(log => [
    log.timestamp,
    log.level,
    log.service,
    `"${(log.message || '').replace(/"/g, '""')}"`,
    `"${(log.stack || '').replace(/"/g, '""')}"`
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * GET /api/v1/logs/recent
 * Get recent log entries - switches between MongoDB and mock data
 */
apiRouter.get('/logs/recent', async (req, res) => {
  try {
    let logs = [];
    
    // Check if MongoDB is enabled and connected
    if (mongoDBService.isEnabled && await mongoDBService.isConnected()) {
      logger.info('Fetching logs from MongoDB');
      
      // Get query parameters
      const {
        size = 50,
        levels = 'ERROR,CRITICAL,WARN',
        timeRange = 'now-1h',
        services = null
      } = req.query;
      
      // Parse levels and services
      const levelArray = levels.split(',');
      const serviceArray = services ? services.split(',') : null;
      
      // Fetch from MongoDB
      logs = await mongoDBService.getRecentLogs({
        size: parseInt(size),
        levels: levelArray,
        timeRange: timeRange,
        services: serviceArray
      });
      
      res.json({
        success: true,
        data: logs,
        source: 'mongodb'
      });
    } else {
      // Fall back to mock data
      logger.info('Fetching logs from mock data file');
      const logsPath = path.join(__dirname, '../data/logs/mock-logs.json');
      
      if (fs.existsSync(logsPath)) {
        logs = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
        res.json({
          success: true,
          data: logs,
          source: 'mock'
        });
      } else {
        res.json({
          success: true,
          data: [],
          source: 'mock'
        });
      }
    }
  } catch (error) {
    logger.error('Error in /logs/recent endpoint:', error);
    
    // If MongoDB fails, try falling back to mock data
    try {
      const logsPath = path.join(__dirname, '../data/logs/mock-logs.json');
      if (fs.existsSync(logsPath)) {
        const logs = JSON.parse(fs.readFileSync(logsPath, 'utf8'));
        res.json({
          success: true,
          data: logs,
          source: 'mock',
          warning: 'MongoDB failed, using mock data'
        });
      } else {
        throw error;
      }
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

/**
 * GET /api/v1/logs/stats
 * Get log statistics from MongoDB
 */
apiRouter.get('/logs/stats', async (req, res) => {
  try {
    if (mongoDBService.isEnabled && await mongoDBService.isConnected()) {
      const stats = await mongoDBService.getErrorStats();
      res.json({
        success: true,
        data: stats
      });
    } else {
      res.status(503).json({
        success: false,
        error: 'MongoDB is not enabled or not connected'
      });
    }
  } catch (error) {
    logger.error('Error in /logs/stats endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/mongodb/health
 * Get MongoDB database health
 */
apiRouter.get('/mongodb/health', async (req, res) => {
  try {
    if (mongoDBService.isEnabled) {
      const health = await mongoDBService.getDatabaseHealth();
      res.json({
        success: true,
        data: health
      });
    } else {
      res.json({
        success: false,
        error: 'MongoDB is not enabled'
      });
    }
  } catch (error) {
    logger.error('Error in /mongodb/health endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/mongodb/collection-info
 * Get MongoDB collection information
 */
apiRouter.get('/mongodb/collection-info', async (req, res) => {
  try {
    if (mongoDBService.isEnabled) {
      const info = await mongoDBService.getCollectionInfo();
      res.json({
        success: true,
        data: info
      });
    } else {
      res.json({
        success: false,
        error: 'MongoDB is not enabled'
      });
    }
  } catch (error) {
    logger.error('Error in /mongodb/collection-info endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
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

module.exports = { app, riskAnalyzer, mongoDBService };

// Made with Bob
