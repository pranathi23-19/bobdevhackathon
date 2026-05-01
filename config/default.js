require('dotenv').config();

module.exports = {
  app: {
    name: 'AI Organizational Risk Predictor',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    host: process.env.HOST || 'localhost',
  },

  api: {
    prefix: process.env.API_PREFIX || '/api/v1',
    rateLimit: parseInt(process.env.API_RATE_LIMIT, 10) || 100,
    timeout: parseInt(process.env.REQUEST_TIMEOUT, 10) || 30000,
  },

  dataSources: {
    logs: {
      source: process.env.LOG_SOURCE || 'file',
      filePath: process.env.LOG_FILE_PATH || './data/logs',
      watchInterval: parseInt(process.env.LOG_WATCH_INTERVAL, 10) || 5000,
    },
    git: {
      repoPath: process.env.GIT_REPO_PATH || './',
      branch: process.env.GIT_BRANCH || 'main',
      analysisDepth: parseInt(process.env.GIT_ANALYSIS_DEPTH, 10) || 100,
      authorEmail: process.env.GIT_AUTHOR_EMAIL || '',
    },
    codeMetrics: {
      complexityThreshold: parseInt(process.env.CODE_COMPLEXITY_THRESHOLD, 10) || 10,
      coverageThreshold: parseInt(process.env.CODE_COVERAGE_THRESHOLD, 10) || 80,
      duplicationThreshold: parseInt(process.env.CODE_DUPLICATION_THRESHOLD, 10) || 5,
    },
  },

  ml: {
    modelType: process.env.MODEL_TYPE || 'neural_network',
    threshold: parseFloat(process.env.MODEL_THRESHOLD) || 0.7,
    trainingEpochs: parseInt(process.env.MODEL_TRAINING_EPOCHS, 10) || 1000,
    learningRate: parseFloat(process.env.MODEL_LEARNING_RATE) || 0.01,
  },

  risk: {
    weights: {
      codeQuality: parseFloat(process.env.RISK_WEIGHT_CODE_QUALITY) || 0.40,
      systemLogs: parseFloat(process.env.RISK_WEIGHT_SYSTEM_LOGS) || 0.35,
      developerActivity: parseFloat(process.env.RISK_WEIGHT_DEVELOPER_ACTIVITY) || 0.25,
    },
    thresholds: {
      low: parseInt(process.env.RISK_THRESHOLD_LOW, 10) || 30,
      medium: parseInt(process.env.RISK_THRESHOLD_MEDIUM, 10) || 60,
      high: parseInt(process.env.RISK_THRESHOLD_HIGH, 10) || 80,
    },
  },

  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/risk-predictor',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: process.env.REDIS_PASSWORD || '',
      db: parseInt(process.env.REDIS_DB, 10) || 0,
    },
  },

  queue: {
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY, 10) || 5,
    maxRetries: parseInt(process.env.QUEUE_MAX_RETRIES, 10) || 3,
  },

  alerts: {
    enabled: process.env.ENABLE_ALERTS === 'true',
    webhookUrl: process.env.ALERT_WEBHOOK_URL || '',
    slack: {
      webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
    },
    email: {
      enabled: process.env.EMAIL_ALERTS === 'true',
      smtp: {
        host: process.env.EMAIL_SMTP_HOST || '',
        port: parseInt(process.env.EMAIL_SMTP_PORT, 10) || 587,
      },
      from: process.env.EMAIL_FROM || '',
    },
  },

  monitoring: {
    metrics: {
      enabled: process.env.ENABLE_METRICS === 'true',
      port: parseInt(process.env.METRICS_PORT, 10) || 9090,
    },
    healthCheck: {
      enabled: process.env.ENABLE_HEALTH_CHECK === 'true',
    },
  },

  security: {
    jwt: {
      secret: process.env.JWT_SECRET || 'change-this-secret',
      expiry: process.env.JWT_EXPIRY || '24h',
    },
    bcrypt: {
      rounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
    },
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    file: process.env.LOG_FILE || './logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES, 10) || 7,
  },

  features: {
    realTimeAnalysis: process.env.ENABLE_REAL_TIME_ANALYSIS === 'true',
    historicalTrends: process.env.ENABLE_HISTORICAL_TRENDS === 'true',
    teamAnalytics: process.env.ENABLE_TEAM_ANALYTICS === 'true',
    autoRemediation: process.env.ENABLE_AUTO_REMEDIATION === 'true',
  },

  integrations: {
    github: {
      token: process.env.GITHUB_TOKEN || '',
    },
    jira: {
      apiUrl: process.env.JIRA_API_URL || '',
      username: process.env.JIRA_USERNAME || '',
      apiToken: process.env.JIRA_API_TOKEN || '',
    },
  },

  performance: {
    maxConcurrentAnalyses: parseInt(process.env.MAX_CONCURRENT_ANALYSES, 10) || 10,
    cacheTTL: parseInt(process.env.CACHE_TTL, 10) || 3600,
  },

  development: {
    debug: process.env.DEBUG === 'true',
    mockData: process.env.MOCK_DATA === 'true',
    seedDatabase: process.env.SEED_DATABASE === 'true',
  },
};

// Made with Bob
