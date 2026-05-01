const EventEmitter = require('events');
const LogCollector = require('../collectors/log-collector');
const GitAnalyzer = require('../collectors/git-analyzer');
const CodeMetrics = require('../collectors/code-metrics');
const RiskPredictor = require('../ml/risk-predictor');
const config = require('../../config/default');
const logger = require('../utils/logger');

class RiskAnalyzer extends EventEmitter {
  constructor() {
    super();
    this.logCollector = new LogCollector();
    this.gitAnalyzer = new GitAnalyzer();
    this.codeMetrics = new CodeMetrics();
    this.riskPredictor = new RiskPredictor();
    this.isInitialized = false;
    this.currentAnalysis = null;
  }

  /**
   * Initialize all components
   */
  async initialize() {
    try {
      logger.info('Initializing Risk Analyzer...');

      // Initialize ML model
      this.riskPredictor.initialize();

      // Initialize Git analyzer
      await this.gitAnalyzer.initialize();

      // Start log collector
      await this.logCollector.start();

      this.isInitialized = true;
      logger.info('Risk Analyzer initialized successfully');
      this.emit('initialized');

      return true;
    } catch (error) {
      logger.error('Failed to initialize Risk Analyzer:', error);
      throw error;
    }
  }

  /**
   * Perform comprehensive risk analysis
   */
  async analyzeRisk(options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      logger.info('Starting comprehensive risk analysis...');
      const startTime = Date.now();

      // Collect data from all sources
      const [logMetrics, gitAnalysis, codeAnalysis] = await Promise.all([
        this.collectLogMetrics(),
        this.collectGitMetrics(),
        this.collectCodeMetrics(options.projectPath),
      ]);

      // Extract features for ML model
      const features = this.extractFeatures(logMetrics, gitAnalysis, codeAnalysis);

      // Get prediction from ML model
      const prediction = this.riskPredictor.predict(features);

      // Generate recommendations
      const recommendations = this.riskPredictor.generateRecommendations(prediction);

      // Identify fragile modules
      const fragileModules = await this.gitAnalyzer.identifyFragileModules();

      // Compile comprehensive analysis
      this.currentAnalysis = {
        timestamp: new Date(),
        duration: Date.now() - startTime,
        prediction,
        recommendations,
        fragileModules,
        metrics: {
          logs: logMetrics,
          git: gitAnalysis,
          code: codeAnalysis,
        },
        features,
        summary: this.generateSummary(prediction, recommendations, fragileModules),
      };

      logger.info(`Risk analysis complete in ${this.currentAnalysis.duration}ms`);
      this.emit('analysis-complete', this.currentAnalysis);

      return this.currentAnalysis;
    } catch (error) {
      logger.error('Error during risk analysis:', error);
      throw error;
    }
  }

  /**
   * Collect log metrics
   */
  async collectLogMetrics() {
    try {
      const metrics = await this.logCollector.getCurrentMetrics();
      return metrics || {
        total: 0,
        errors: 0,
        warnings: 0,
        errorRate: 0,
        warningRate: 0,
      };
    } catch (error) {
      logger.error('Error collecting log metrics:', error);
      return {
        total: 0,
        errors: 0,
        warnings: 0,
        errorRate: 0,
        warningRate: 0,
      };
    }
  }

  /**
   * Collect Git metrics
   */
  async collectGitMetrics() {
    try {
      const [commits, churn, activity] = await Promise.all([
        this.gitAnalyzer.analyzeRecentCommits(50),
        this.gitAnalyzer.analyzeCodeChurn('1 week ago'),
        this.gitAnalyzer.getDeveloperActivity(30),
      ]);

      return {
        commits,
        churn,
        activity,
      };
    } catch (error) {
      logger.error('Error collecting Git metrics:', error);
      return {
        commits: { totalCommits: 0, commitPatterns: {} },
        churn: { churnRate: 0 },
        activity: { totalCommits: 0, activeAuthors: 0 },
      };
    }
  }

  /**
   * Collect code metrics
   */
  async collectCodeMetrics(projectPath = './') {
    try {
      return await this.codeMetrics.analyzeProject(projectPath);
    } catch (error) {
      logger.error('Error collecting code metrics:', error);
      return {
        totalFiles: 0,
        averageComplexity: 0,
        coverage: { estimated: 0 },
        codeSmells: [],
      };
    }
  }

  /**
   * Extract features for ML model
   */
  extractFeatures(logMetrics, gitAnalysis, codeAnalysis) {
    return {
      // Code quality metrics
      codeComplexity: codeAnalysis.averageComplexity || 0,
      testCoverage: codeAnalysis.coverage?.estimated || 0,
      codeSmells: codeAnalysis.codeSmells?.length || 0,
      duplication: codeAnalysis.duplication?.duplicateBlocks || 0,

      // Log metrics
      errorRate: logMetrics.errorRate || 0,
      warningRate: logMetrics.warningRate || 0,
      criticalErrors: logMetrics.errors || 0,

      // Developer activity
      commitFrequency: gitAnalysis.commits?.commitFrequency?.last7Days || 0,
      rushedCommits: gitAnalysis.commits?.commitPatterns?.rushed || 0,
      hotfixes: gitAnalysis.commits?.commitPatterns?.hotfixes || 0,
      codeChurn: gitAnalysis.churn?.churnRate || 0,

      // Team metrics
      activeAuthors: gitAnalysis.activity?.activeAuthors || 0,
      avgCommitSize: gitAnalysis.commits?.averageCommitSize || 0,
    };
  }

  /**
   * Generate analysis summary
   */
  generateSummary(prediction, recommendations, fragileModules) {
    const criticalRecommendations = recommendations.filter(r => r.priority === 'critical');
    const highRiskModules = fragileModules.filter(m => m.riskScore > 70);

    return {
      overallRisk: prediction.riskLevel,
      failureProbability: prediction.failureProbability,
      confidence: prediction.confidence,
      criticalIssues: criticalRecommendations.length,
      highRiskModules: highRiskModules.length,
      topRiskFactors: prediction.factors.slice(0, 3),
      actionRequired: prediction.riskLevel === 'HIGH' || prediction.riskLevel === 'CRITICAL',
      message: this.generateSummaryMessage(prediction, criticalRecommendations.length),
    };
  }

  /**
   * Generate human-readable summary message
   */
  generateSummaryMessage(prediction, criticalIssues) {
    const prob = prediction.failureProbability;
    const level = prediction.riskLevel;

    if (level === 'CRITICAL' || level === 'HIGH') {
      return `⚠️ HIGH RISK: This release has a ${prob}% chance of failure. ${criticalIssues} critical issues require immediate attention.`;
    } else if (level === 'MEDIUM') {
      return `⚡ MEDIUM RISK: This release has a ${prob}% chance of failure. Review recommended actions before proceeding.`;
    } else if (level === 'LOW') {
      return `✓ LOW RISK: This release has a ${prob}% chance of failure. Minor improvements recommended.`;
    } else {
      return `✅ MINIMAL RISK: This release has a ${prob}% chance of failure. Proceed with confidence.`;
    }
  }

  /**
   * Analyze specific release
   */
  async analyzeRelease(releaseInfo) {
    try {
      logger.info(`Analyzing release: ${releaseInfo.version}`);

      const analysis = await this.analyzeRisk({
        projectPath: releaseInfo.projectPath || './',
      });

      return {
        release: releaseInfo.version,
        ...analysis,
      };
    } catch (error) {
      logger.error('Error analyzing release:', error);
      throw error;
    }
  }

  /**
   * Get real-time risk score
   */
  async getRealTimeRisk() {
    try {
      if (!this.currentAnalysis) {
        return await this.analyzeRisk();
      }

      // Check if analysis is stale (> 5 minutes)
      const age = Date.now() - new Date(this.currentAnalysis.timestamp).getTime();
      if (age > 5 * 60 * 1000) {
        return await this.analyzeRisk();
      }

      return this.currentAnalysis;
    } catch (error) {
      logger.error('Error getting real-time risk:', error);
      throw error;
    }
  }

  /**
   * Train model with historical data
   */
  async trainModel(historicalData) {
    try {
      logger.info('Training risk prediction model...');
      const result = await this.riskPredictor.train(historicalData);
      logger.info('Model training complete');
      return result;
    } catch (error) {
      logger.error('Error training model:', error);
      throw error;
    }
  }

  /**
   * Save trained model
   */
  saveModel(filePath) {
    try {
      this.riskPredictor.saveModel(filePath);
      logger.info(`Model saved to ${filePath}`);
    } catch (error) {
      logger.error('Error saving model:', error);
      throw error;
    }
  }

  /**
   * Load trained model
   */
  loadModel(filePath) {
    try {
      this.riskPredictor.loadModel(filePath);
      logger.info(`Model loaded from ${filePath}`);
    } catch (error) {
      logger.error('Error loading model:', error);
      throw error;
    }
  }

  /**
   * Get analyzer statistics
   */
  getStats() {
    return {
      isInitialized: this.isInitialized,
      lastAnalysis: this.currentAnalysis?.timestamp,
      modelStats: this.riskPredictor.getStats(),
    };
  }

  /**
   * Stop all collectors and cleanup
   */
  async stop() {
    try {
      await this.logCollector.stop();
      logger.info('Risk Analyzer stopped');
      this.emit('stopped');
    } catch (error) {
      logger.error('Error stopping Risk Analyzer:', error);
      throw error;
    }
  }
}

module.exports = RiskAnalyzer;

// Made with Bob
