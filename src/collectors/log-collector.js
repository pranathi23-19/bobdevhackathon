const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');
const EventEmitter = require('events');
const config = require('../../config/default');
const logger = require('../utils/logger');

class LogCollector extends EventEmitter {
  constructor() {
    super();
    this.logPath = config.dataSources.logs.filePath;
    this.watchInterval = config.dataSources.logs.watchInterval;
    this.watcher = null;
    this.logPatterns = {
      error: /ERROR|FATAL|CRITICAL/i,
      warning: /WARN|WARNING/i,
      info: /INFO/i,
      debug: /DEBUG/i,
    };
  }

  /**
   * Start collecting logs
   */
  async start() {
    try {
      logger.info('Starting log collector...');
      
      // Ensure log directory exists
      await this.ensureLogDirectory();
      
      // Start watching log files
      this.watcher = chokidar.watch(`${this.logPath}/**/*.log`, {
        persistent: true,
        ignoreInitial: false,
      });

      this.watcher
        .on('add', (filePath) => this.handleNewLog(filePath))
        .on('change', (filePath) => this.handleLogChange(filePath))
        .on('error', (error) => logger.error('Log watcher error:', error));

      logger.info('Log collector started successfully');
      this.emit('started');
    } catch (error) {
      logger.error('Failed to start log collector:', error);
      throw error;
    }
  }

  /**
   * Stop collecting logs
   */
  async stop() {
    if (this.watcher) {
      await this.watcher.close();
      logger.info('Log collector stopped');
      this.emit('stopped');
    }
  }

  /**
   * Ensure log directory exists
   */
  async ensureLogDirectory() {
    try {
      await fs.access(this.logPath);
    } catch {
      await fs.mkdir(this.logPath, { recursive: true });
      logger.info(`Created log directory: ${this.logPath}`);
    }
  }

  /**
   * Handle new log file
   */
  async handleNewLog(filePath) {
    logger.debug(`New log file detected: ${filePath}`);
    await this.processLogFile(filePath);
  }

  /**
   * Handle log file changes
   */
  async handleLogChange(filePath) {
    logger.debug(`Log file changed: ${filePath}`);
    await this.processLogFile(filePath);
  }

  /**
   * Process log file and extract metrics
   */
  async processLogFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      const metrics = this.analyzeLogLines(lines);
      
      this.emit('metrics', {
        filePath,
        timestamp: new Date(),
        metrics,
      });

      return metrics;
    } catch (error) {
      logger.error(`Error processing log file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Analyze log lines and extract metrics
   */
  analyzeLogLines(lines) {
    const metrics = {
      total: lines.length,
      errors: 0,
      warnings: 0,
      info: 0,
      debug: 0,
      errorRate: 0,
      warningRate: 0,
      recentErrors: [],
      errorPatterns: {},
      timeDistribution: {},
    };

    lines.forEach((line) => {
      // Count by severity
      if (this.logPatterns.error.test(line)) {
        metrics.errors++;
        metrics.recentErrors.push(this.extractErrorInfo(line));
      } else if (this.logPatterns.warning.test(line)) {
        metrics.warnings++;
      } else if (this.logPatterns.info.test(line)) {
        metrics.info++;
      } else if (this.logPatterns.debug.test(line)) {
        metrics.debug++;
      }

      // Extract error patterns
      const errorType = this.extractErrorType(line);
      if (errorType) {
        metrics.errorPatterns[errorType] = (metrics.errorPatterns[errorType] || 0) + 1;
      }

      // Time distribution
      const timestamp = this.extractTimestamp(line);
      if (timestamp) {
        const hour = new Date(timestamp).getHours();
        metrics.timeDistribution[hour] = (metrics.timeDistribution[hour] || 0) + 1;
      }
    });

    // Calculate rates
    metrics.errorRate = metrics.total > 0 ? (metrics.errors / metrics.total) * 100 : 0;
    metrics.warningRate = metrics.total > 0 ? (metrics.warnings / metrics.total) * 100 : 0;

    // Keep only recent errors (last 10)
    metrics.recentErrors = metrics.recentErrors.slice(-10);

    return metrics;
  }

  /**
   * Extract error information from log line
   */
  extractErrorInfo(line) {
    return {
      message: line.substring(0, 200),
      timestamp: this.extractTimestamp(line) || new Date(),
      type: this.extractErrorType(line),
    };
  }

  /**
   * Extract error type from log line
   */
  extractErrorType(line) {
    const patterns = [
      /(\w+Error):/,
      /(\w+Exception):/,
      /ERROR:\s*(\w+)/,
      /FATAL:\s*(\w+)/,
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) return match[1];
    }

    return 'UnknownError';
  }

  /**
   * Extract timestamp from log line
   */
  extractTimestamp(line) {
    // Common timestamp patterns
    const patterns = [
      /\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/,
      /\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}:\d{2}/,
      /\[\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\]/,
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const timestamp = new Date(match[0].replace(/[\[\]]/g, ''));
        if (!isNaN(timestamp.getTime())) {
          return timestamp;
        }
      }
    }

    return null;
  }

  /**
   * Get current log metrics
   */
  async getCurrentMetrics() {
    try {
      const files = await fs.readdir(this.logPath);
      const logFiles = files.filter(file => file.endsWith('.log'));
      
      const allMetrics = await Promise.all(
        logFiles.map(file => this.processLogFile(path.join(this.logPath, file)))
      );

      return this.aggregateMetrics(allMetrics.filter(m => m !== null));
    } catch (error) {
      logger.error('Error getting current metrics:', error);
      return null;
    }
  }

  /**
   * Aggregate metrics from multiple log files
   */
  aggregateMetrics(metricsArray) {
    if (metricsArray.length === 0) {
      return {
        total: 0,
        errors: 0,
        warnings: 0,
        errorRate: 0,
        warningRate: 0,
      };
    }

    const aggregated = metricsArray.reduce((acc, metrics) => ({
      total: acc.total + metrics.total,
      errors: acc.errors + metrics.errors,
      warnings: acc.warnings + metrics.warnings,
      info: acc.info + metrics.info,
      debug: acc.debug + metrics.debug,
    }), { total: 0, errors: 0, warnings: 0, info: 0, debug: 0 });

    aggregated.errorRate = aggregated.total > 0 
      ? (aggregated.errors / aggregated.total) * 100 
      : 0;
    aggregated.warningRate = aggregated.total > 0 
      ? (aggregated.warnings / aggregated.total) * 100 
      : 0;

    return aggregated;
  }
}

module.exports = LogCollector;

// Made with Bob
