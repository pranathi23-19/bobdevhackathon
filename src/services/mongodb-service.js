const { MongoClient } = require('mongodb');
const logger = require('../utils/logger');

/**
 * MongoDB Service for querying application logs
 */
class MongoDBService {
  constructor(config) {
    this.config = config;
    this.client = null;
    this.db = null;
    this.logsCollection = null;
    this.isEnabled = config.enabled || false;
    
    if (this.isEnabled) {
      this.initializeClient();
    }
  }

  /**
   * Initialize MongoDB client
   */
  async initializeClient() {
    try {
      this.client = new MongoClient(this.config.uri, this.config.options || {});
      await this.client.connect();
      
      this.db = this.client.db(this.config.database || 'risk-predictor');
      this.logsCollection = this.db.collection(this.config.collection || 'application-logs');
      
      // Create indexes for better query performance
      await this.createIndexes();
      
      logger.info('MongoDB client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize MongoDB client:', error);
      this.isEnabled = false;
      throw error;
    }
  }

  /**
   * Create indexes for optimized queries
   */
  async createIndexes() {
    try {
      await this.logsCollection.createIndex({ timestamp: -1 });
      await this.logsCollection.createIndex({ level: 1 });
      await this.logsCollection.createIndex({ service: 1 });
      await this.logsCollection.createIndex({ timestamp: -1, level: 1 });
      logger.info('MongoDB indexes created successfully');
    } catch (error) {
      logger.error('Error creating MongoDB indexes:', error);
    }
  }

  /**
   * Check if MongoDB is enabled and connected
   */
  async isConnected() {
    if (!this.isEnabled || !this.client) {
      return false;
    }

    try {
      await this.client.db().admin().ping();
      return true;
    } catch (error) {
      logger.error('MongoDB connection check failed:', error);
      return false;
    }
  }

  /**
   * Get recent error logs from MongoDB
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of log entries
   */
  async getRecentLogs(options = {}) {
    if (!this.isEnabled || !this.logsCollection) {
      throw new Error('MongoDB is not enabled or client not initialized');
    }

    const {
      size = 50,
      levels = ['ERROR', 'CRITICAL', 'WARN'],
      timeRange = 'now-1h',
      services = null
    } = options;

    try {
      // Calculate time range
      const timeRangeMs = this.parseTimeRange(timeRange);
      const startTime = new Date(Date.now() - timeRangeMs);

      // Build query
      const query = {
        level: { $in: levels },
        timestamp: { $gte: startTime }
      };

      // Add service filter if specified
      if (services && services.length > 0) {
        query.service = { $in: services };
      }

      logger.info('Executing MongoDB query:', JSON.stringify(query, null, 2));

      // Execute query
      const logs = await this.logsCollection
        .find(query)
        .sort({ timestamp: -1 })
        .limit(size)
        .project({
          _id: 0,
          timestamp: 1,
          level: 1,
          service: 1,
          message: 1,
          stack: 1,
          metadata: 1
        })
        .toArray();

      logger.info(`Retrieved ${logs.length} logs from MongoDB`);
      return logs;

    } catch (error) {
      logger.error('Error querying MongoDB:', error);
      throw error;
    }
  }

  /**
   * Parse time range string to milliseconds
   * @param {string} timeRange - Time range string (e.g., 'now-1h', 'now-30m')
   * @returns {number} Milliseconds
   */
  parseTimeRange(timeRange) {
    const match = timeRange.match(/now-(\d+)([mhd])/);
    if (!match) {
      return 3600000; // Default to 1 hour
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 3600000;
    }
  }

  /**
   * Get error statistics from MongoDB
   * @returns {Promise<Object>} Error statistics
   */
  async getErrorStats() {
    if (!this.isEnabled || !this.logsCollection) {
      throw new Error('MongoDB is not enabled or client not initialized');
    }

    try {
      const oneHourAgo = new Date(Date.now() - 3600000);

      // Aggregate by level
      const byLevel = await this.logsCollection.aggregate([
        { $match: { timestamp: { $gte: oneHourAgo } } },
        { $group: { _id: '$level', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray();

      // Aggregate by service
      const byService = await this.logsCollection.aggregate([
        { $match: { timestamp: { $gte: oneHourAgo } } },
        { $group: { _id: '$service', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray();

      // Timeline aggregation (5-minute intervals)
      const timeline = await this.logsCollection.aggregate([
        { $match: { timestamp: { $gte: oneHourAgo } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%dT%H:%M:00.000Z',
                date: {
                  $dateTrunc: {
                    date: '$timestamp',
                    unit: 'minute',
                    binSize: 5
                  }
                }
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();

      return {
        byLevel: byLevel.map(item => ({
          level: item._id,
          count: item.count
        })),
        byService: byService.map(item => ({
          service: item._id,
          count: item.count
        })),
        timeline: timeline.map(item => ({
          timestamp: item._id,
          count: item.count
        }))
      };

    } catch (error) {
      logger.error('Error getting stats from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Search logs by query string
   * @param {string} queryString - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Matching logs
   */
  async searchLogs(queryString, options = {}) {
    if (!this.isEnabled || !this.logsCollection) {
      throw new Error('MongoDB is not enabled or client not initialized');
    }

    const { size = 50, from = 0 } = options;

    try {
      // Use text search if available, otherwise use regex
      const query = {
        $or: [
          { message: { $regex: queryString, $options: 'i' } },
          { service: { $regex: queryString, $options: 'i' } }
        ]
      };

      const logs = await this.logsCollection
        .find(query)
        .sort({ timestamp: -1 })
        .skip(from)
        .limit(size)
        .project({ _id: 0 })
        .toArray();

      return logs;

    } catch (error) {
      logger.error('Error searching logs in MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get database health
   * @returns {Promise<Object>} Database health info
   */
  async getDatabaseHealth() {
    if (!this.isEnabled || !this.client) {
      throw new Error('MongoDB is not enabled or client not initialized');
    }

    try {
      const adminDb = this.client.db().admin();
      const serverStatus = await adminDb.serverStatus();
      
      return {
        status: serverStatus.ok === 1 ? 'healthy' : 'unhealthy',
        version: serverStatus.version,
        uptime: serverStatus.uptime,
        connections: {
          current: serverStatus.connections.current,
          available: serverStatus.connections.available
        },
        memory: {
          resident: serverStatus.mem.resident,
          virtual: serverStatus.mem.virtual
        }
      };
    } catch (error) {
      logger.error('Error getting database health:', error);
      throw error;
    }
  }

  /**
   * Get collection information
   * @returns {Promise<Object>} Collection info
   */
  async getCollectionInfo() {
    if (!this.isEnabled || !this.logsCollection) {
      throw new Error('MongoDB is not enabled or client not initialized');
    }

    try {
      const stats = await this.logsCollection.stats();
      
      return {
        collectionName: this.config.collection || 'application-logs',
        documentCount: stats.count,
        storageSize: stats.storageSize,
        storageSizeHuman: this.formatBytes(stats.storageSize),
        indexSize: stats.totalIndexSize,
        indexSizeHuman: this.formatBytes(stats.totalIndexSize)
      };
    } catch (error) {
      logger.error('Error getting collection info:', error);
      throw error;
    }
  }

  /**
   * Format bytes to human readable format
   * @param {number} bytes - Bytes to format
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Close MongoDB client connection
   */
  async close() {
    if (this.client) {
      await this.client.close();
      logger.info('MongoDB client connection closed');
    }
  }
}

module.exports = MongoDBService;

// Made with Bob