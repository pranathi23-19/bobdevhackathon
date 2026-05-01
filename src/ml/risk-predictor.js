const EventEmitter = require('events');
const config = require('../../config/default');
const logger = require('../utils/logger');

// Try to load brain.js, but handle GPU/WebGL errors gracefully
let brain;
try {
  brain = require('brain.js');
} catch (error) {
  logger.warn('Failed to load brain.js with GPU support, using CPU-only fallback');
  // Set environment variable to disable GPU before requiring
  process.env.BRAIN_GPU = 'false';
  brain = require('brain.js');
}

class RiskPredictor extends EventEmitter {
  constructor() {
    super();
    this.network = null;
    this.threshold = config.ml.threshold;
    this.trainingEpochs = config.ml.trainingEpochs;
    this.learningRate = config.ml.learningRate;
    this.isTraining = false;
    this.isTrained = false;
  }

  /**
   * Initialize the neural network
   */
  initialize() {
    logger.info('Initializing risk prediction neural network...');
    
    // Use CPU mode to avoid GPU/WebGL dependencies
    this.network = new brain.NeuralNetwork({
      hiddenLayers: [10, 8, 6],
      activation: 'sigmoid',
      learningRate: this.learningRate,
      gpu: false, // Disable GPU to avoid native module compilation issues
    });

    logger.info('Neural network initialized (CPU mode)');
    this.emit('initialized');
  }

  /**
   * Train the model with historical data
   */
  async train(trainingData) {
    try {
      if (this.isTraining) {
        throw new Error('Training already in progress');
      }

      this.isTraining = true;
      logger.info(`Training model with ${trainingData.length} samples...`);

      const normalizedData = this.normalizeTrainingData(trainingData);
      
      const result = this.network.train(normalizedData, {
        iterations: this.trainingEpochs,
        errorThresh: 0.005,
        log: (stats) => {
          if (stats.iterations % 100 === 0) {
            logger.debug(`Training iteration ${stats.iterations}, error: ${stats.error}`);
          }
        },
        logPeriod: 100,
      });

      this.isTrained = true;
      this.isTraining = false;

      logger.info(`Training complete. Final error: ${result.error}, Iterations: ${result.iterations}`);
      this.emit('trained', result);

      return result;
    } catch (error) {
      this.isTraining = false;
      logger.error('Error training model:', error);
      throw error;
    }
  }

  /**
   * Normalize training data
   */
  normalizeTrainingData(data) {
    return data.map(sample => ({
      input: this.normalizeFeatures(sample.features),
      output: { failure: sample.failed ? 1 : 0 },
    }));
  }

  /**
   * Normalize feature values to 0-1 range
   */
  normalizeFeatures(features) {
    return {
      // Code quality metrics (0-1)
      codeComplexity: Math.min(features.codeComplexity / 100, 1),
      testCoverage: features.testCoverage / 100,
      codeSmells: Math.min(features.codeSmells / 50, 1),
      duplication: Math.min(features.duplication / 20, 1),
      
      // Log metrics (0-1)
      errorRate: Math.min(features.errorRate / 100, 1),
      warningRate: Math.min(features.warningRate / 100, 1),
      criticalErrors: Math.min(features.criticalErrors / 10, 1),
      
      // Developer activity (0-1)
      commitFrequency: Math.min(features.commitFrequency / 50, 1),
      rushedCommits: Math.min(features.rushedCommits / 20, 1),
      hotfixes: Math.min(features.hotfixes / 10, 1),
      codeChurn: Math.min(features.codeChurn / 1000, 1),
      
      // Team metrics (0-1)
      activeAuthors: Math.min(features.activeAuthors / 20, 1),
      avgCommitSize: Math.min(features.avgCommitSize / 50, 1),
    };
  }

  /**
   * Predict failure probability for given features
   */
  predict(features) {
    if (!this.isTrained) {
      throw new Error('Model must be trained before making predictions');
    }

    const normalizedFeatures = this.normalizeFeatures(features);
    const output = this.network.run(normalizedFeatures);
    
    const failureProbability = output.failure * 100;
    const riskLevel = this.calculateRiskLevel(failureProbability);
    const confidence = this.calculateConfidence(output.failure);

    const prediction = {
      failureProbability: Math.round(failureProbability),
      riskLevel,
      confidence,
      factors: this.identifyRiskFactors(features, normalizedFeatures),
      timestamp: new Date(),
    };

    this.emit('prediction', prediction);
    return prediction;
  }

  /**
   * Calculate risk level based on probability
   */
  calculateRiskLevel(probability) {
    if (probability >= config.risk.thresholds.high) return 'HIGH';
    if (probability >= config.risk.thresholds.medium) return 'MEDIUM';
    if (probability >= config.risk.thresholds.low) return 'LOW';
    return 'MINIMAL';
  }

  /**
   * Calculate prediction confidence
   */
  calculateConfidence(outputValue) {
    // Confidence is higher when output is closer to 0 or 1
    const distance = Math.abs(outputValue - 0.5);
    return Math.round(distance * 200); // Scale to 0-100
  }

  /**
   * Identify key risk factors contributing to the prediction
   */
  identifyRiskFactors(features, normalizedFeatures) {
    const factors = [];
    const weights = config.risk.weights;

    // Code quality factors
    if (normalizedFeatures.codeComplexity > 0.7) {
      factors.push({
        category: 'Code Quality',
        impact: Math.round(normalizedFeatures.codeComplexity * weights.codeQuality * 100),
        reason: `High code complexity (${features.codeComplexity})`,
        severity: 'high',
      });
    }

    if (normalizedFeatures.testCoverage < 0.6) {
      factors.push({
        category: 'Code Quality',
        impact: Math.round((1 - normalizedFeatures.testCoverage) * weights.codeQuality * 100),
        reason: `Low test coverage (${features.testCoverage}%)`,
        severity: 'high',
      });
    }

    if (normalizedFeatures.codeSmells > 0.5) {
      factors.push({
        category: 'Code Quality',
        impact: Math.round(normalizedFeatures.codeSmells * weights.codeQuality * 100),
        reason: `${features.codeSmells} code smells detected`,
        severity: 'medium',
      });
    }

    // System stability factors
    if (normalizedFeatures.errorRate > 0.5) {
      factors.push({
        category: 'System Stability',
        impact: Math.round(normalizedFeatures.errorRate * weights.systemLogs * 100),
        reason: `High error rate (${features.errorRate.toFixed(1)}%)`,
        severity: 'critical',
      });
    }

    if (normalizedFeatures.criticalErrors > 0.3) {
      factors.push({
        category: 'System Stability',
        impact: Math.round(normalizedFeatures.criticalErrors * weights.systemLogs * 100),
        reason: `${features.criticalErrors} critical errors in logs`,
        severity: 'critical',
      });
    }

    // Developer activity factors
    if (normalizedFeatures.rushedCommits > 0.6) {
      factors.push({
        category: 'Developer Activity',
        impact: Math.round(normalizedFeatures.rushedCommits * weights.developerActivity * 100),
        reason: `${features.rushedCommits} rushed commits detected`,
        severity: 'high',
      });
    }

    if (normalizedFeatures.hotfixes > 0.5) {
      factors.push({
        category: 'Developer Activity',
        impact: Math.round(normalizedFeatures.hotfixes * weights.developerActivity * 100),
        reason: `${features.hotfixes} hotfixes in recent history`,
        severity: 'medium',
      });
    }

    if (normalizedFeatures.codeChurn > 0.7) {
      factors.push({
        category: 'Developer Activity',
        impact: Math.round(normalizedFeatures.codeChurn * weights.developerActivity * 100),
        reason: `High code churn (${features.codeChurn} lines changed)`,
        severity: 'medium',
      });
    }

    // Sort by impact (highest first)
    return factors.sort((a, b) => b.impact - a.impact);
  }

  /**
   * Generate recommendations based on risk factors
   */
  generateRecommendations(prediction) {
    const recommendations = [];

    prediction.factors.forEach(factor => {
      switch (factor.category) {
        case 'Code Quality':
          if (factor.reason.includes('complexity')) {
            recommendations.push({
              priority: 'high',
              action: 'Refactor high-complexity modules',
              details: 'Break down complex functions into smaller, testable units',
            });
          }
          if (factor.reason.includes('coverage')) {
            recommendations.push({
              priority: 'high',
              action: 'Increase test coverage',
              details: 'Add unit and integration tests for critical paths',
            });
          }
          if (factor.reason.includes('smells')) {
            recommendations.push({
              priority: 'medium',
              action: 'Address code smells',
              details: 'Review and fix identified code quality issues',
            });
          }
          break;

        case 'System Stability':
          if (factor.reason.includes('error rate')) {
            recommendations.push({
              priority: 'critical',
              action: 'Investigate and fix errors',
              details: 'Review error logs and address root causes immediately',
            });
          }
          if (factor.reason.includes('critical errors')) {
            recommendations.push({
              priority: 'critical',
              action: 'Address critical errors',
              details: 'Fix critical errors before proceeding with release',
            });
          }
          break;

        case 'Developer Activity':
          if (factor.reason.includes('rushed')) {
            recommendations.push({
              priority: 'high',
              action: 'Conduct thorough code review',
              details: 'Review rushed commits for potential issues',
            });
          }
          if (factor.reason.includes('hotfixes')) {
            recommendations.push({
              priority: 'medium',
              action: 'Analyze hotfix patterns',
              details: 'Identify and address recurring issues causing hotfixes',
            });
          }
          if (factor.reason.includes('churn')) {
            recommendations.push({
              priority: 'medium',
              action: 'Review recent changes',
              details: 'Ensure large changes are properly tested and documented',
            });
          }
          break;
      }
    });

    // Add general recommendations based on risk level
    if (prediction.riskLevel === 'HIGH' || prediction.riskLevel === 'CRITICAL') {
      recommendations.unshift({
        priority: 'critical',
        action: 'Delay release',
        details: 'Consider delaying release until critical issues are resolved',
      });
    }

    return recommendations;
  }

  /**
   * Save trained model to file
   */
  saveModel(filePath) {
    if (!this.isTrained) {
      throw new Error('Cannot save untrained model');
    }

    const modelData = this.network.toJSON();
    require('fs').writeFileSync(filePath, JSON.stringify(modelData, null, 2));
    logger.info(`Model saved to ${filePath}`);
  }

  /**
   * Load trained model from file
   */
  loadModel(filePath) {
    try {
      const modelData = JSON.parse(require('fs').readFileSync(filePath, 'utf-8'));
      this.network.fromJSON(modelData);
      this.isTrained = true;
      logger.info(`Model loaded from ${filePath}`);
      this.emit('loaded');
    } catch (error) {
      logger.error('Error loading model:', error);
      throw error;
    }
  }

  /**
   * Get model statistics
   */
  getStats() {
    return {
      isTrained: this.isTrained,
      isTraining: this.isTraining,
      threshold: this.threshold,
      trainingEpochs: this.trainingEpochs,
      learningRate: this.learningRate,
    };
  }
}

module.exports = RiskPredictor;

// Made with Bob
