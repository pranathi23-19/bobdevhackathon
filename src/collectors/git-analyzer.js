const simpleGit = require('simple-git');
const path = require('path');
const EventEmitter = require('events');
const config = require('../../config/default');
const logger = require('../utils/logger');

class GitAnalyzer extends EventEmitter {
  constructor() {
    super();
    this.repoPath = config.dataSources.git.repoPath;
    this.branch = config.dataSources.git.branch;
    this.analysisDepth = config.dataSources.git.analysisDepth;
    this.git = simpleGit(this.repoPath);
  }

  /**
   * Initialize git analyzer
   */
  async initialize() {
    try {
      logger.info('Initializing Git analyzer...');
      const isRepo = await this.git.checkIsRepo();
      
      if (!isRepo) {
        throw new Error(`${this.repoPath} is not a git repository`);
      }

      logger.info('Git analyzer initialized successfully');
      this.emit('initialized');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Git analyzer:', error);
      throw error;
    }
  }

  /**
   * Analyze recent commits
   */
  async analyzeRecentCommits(limit = null) {
    try {
      const commitLimit = limit || this.analysisDepth;
      const log = await this.git.log({ maxCount: commitLimit });
      
      const analysis = {
        totalCommits: log.total,
        commits: [],
        authors: {},
        commitFrequency: {},
        filesChanged: {},
        commitPatterns: {
          rushed: 0,
          wellTested: 0,
          hotfixes: 0,
          features: 0,
        },
        timeDistribution: {},
        averageCommitSize: 0,
      };

      for (const commit of log.all) {
        const commitAnalysis = await this.analyzeCommit(commit);
        analysis.commits.push(commitAnalysis);

        // Track authors
        const author = commit.author_email;
        analysis.authors[author] = (analysis.authors[author] || 0) + 1;

        // Track commit patterns
        if (commitAnalysis.isRushed) analysis.commitPatterns.rushed++;
        if (commitAnalysis.isHotfix) analysis.commitPatterns.hotfixes++;
        if (commitAnalysis.isFeature) analysis.commitPatterns.features++;
        if (commitAnalysis.hasTests) analysis.commitPatterns.wellTested++;

        // Time distribution
        const hour = new Date(commit.date).getHours();
        analysis.timeDistribution[hour] = (analysis.timeDistribution[hour] || 0) + 1;

        // Files changed
        commitAnalysis.files.forEach(file => {
          analysis.filesChanged[file] = (analysis.filesChanged[file] || 0) + 1;
        });
      }

      // Calculate commit frequency (commits per day)
      analysis.commitFrequency = this.calculateCommitFrequency(log.all);
      
      // Calculate average commit size
      analysis.averageCommitSize = analysis.commits.reduce((sum, c) => sum + c.filesCount, 0) / analysis.commits.length;

      this.emit('analysis-complete', analysis);
      return analysis;
    } catch (error) {
      logger.error('Error analyzing commits:', error);
      throw error;
    }
  }

  /**
   * Analyze individual commit
   */
  async analyzeCommit(commit) {
    try {
      const diff = await this.git.show([commit.hash, '--stat']);
      const files = this.extractFilesFromDiff(diff);
      
      return {
        hash: commit.hash,
        message: commit.message,
        author: commit.author_email,
        date: commit.date,
        filesCount: files.length,
        files,
        isRushed: this.isRushedCommit(commit, files),
        isHotfix: this.isHotfixCommit(commit.message),
        isFeature: this.isFeatureCommit(commit.message),
        hasTests: this.hasTestFiles(files),
        complexity: this.estimateComplexity(files),
      };
    } catch (error) {
      logger.error(`Error analyzing commit ${commit.hash}:`, error);
      return {
        hash: commit.hash,
        message: commit.message,
        author: commit.author_email,
        date: commit.date,
        filesCount: 0,
        files: [],
        isRushed: false,
        isHotfix: false,
        isFeature: false,
        hasTests: false,
        complexity: 0,
      };
    }
  }

  /**
   * Extract files from git diff output
   */
  extractFilesFromDiff(diff) {
    const lines = diff.split('\n');
    const files = [];
    
    for (const line of lines) {
      const match = line.match(/^\s*(.+?)\s*\|\s*\d+/);
      if (match) {
        files.push(match[1].trim());
      }
    }
    
    return files;
  }

  /**
   * Check if commit is rushed (multiple files, short time window)
   */
  isRushedCommit(commit, files) {
    // Rushed if:
    // - More than 10 files changed
    // - Commit message is very short (< 20 chars)
    // - Committed during odd hours (late night/early morning)
    const hour = new Date(commit.date).getHours();
    const isOddHour = hour < 6 || hour > 22;
    const shortMessage = commit.message.length < 20;
    const manyFiles = files.length > 10;
    
    return (manyFiles && shortMessage) || (manyFiles && isOddHour);
  }

  /**
   * Check if commit is a hotfix
   */
  isHotfixCommit(message) {
    const hotfixPatterns = [
      /hotfix/i,
      /urgent/i,
      /critical/i,
      /emergency/i,
      /quick\s*fix/i,
      /patch/i,
    ];
    
    return hotfixPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Check if commit is a feature
   */
  isFeatureCommit(message) {
    const featurePatterns = [
      /feature/i,
      /feat:/i,
      /add/i,
      /implement/i,
      /new/i,
    ];
    
    return featurePatterns.some(pattern => pattern.test(message));
  }

  /**
   * Check if commit includes test files
   */
  hasTestFiles(files) {
    const testPatterns = [
      /\.test\./,
      /\.spec\./,
      /__tests__/,
      /test\//,
      /tests\//,
    ];
    
    return files.some(file => testPatterns.some(pattern => pattern.test(file)));
  }

  /**
   * Estimate complexity based on files changed
   */
  estimateComplexity(files) {
    let complexity = 0;
    
    // Higher complexity for certain file types
    const complexityWeights = {
      '.js': 1,
      '.ts': 1,
      '.jsx': 1.2,
      '.tsx': 1.2,
      '.py': 1,
      '.java': 1.3,
      '.cpp': 1.5,
      '.c': 1.5,
      '.go': 1.2,
      '.rs': 1.4,
      '.sql': 1.1,
      '.json': 0.3,
      '.md': 0.2,
      '.txt': 0.1,
    };
    
    files.forEach(file => {
      const ext = path.extname(file);
      complexity += complexityWeights[ext] || 0.5;
    });
    
    return complexity;
  }

  /**
   * Calculate commit frequency
   */
  calculateCommitFrequency(commits) {
    if (commits.length === 0) return {};
    
    const frequency = {};
    const now = new Date();
    
    commits.forEach(commit => {
      const commitDate = new Date(commit.date);
      const daysAgo = Math.floor((now - commitDate) / (1000 * 60 * 60 * 24));
      
      if (daysAgo <= 7) {
        frequency.last7Days = (frequency.last7Days || 0) + 1;
      }
      if (daysAgo <= 30) {
        frequency.last30Days = (frequency.last30Days || 0) + 1;
      }
      if (daysAgo <= 1) {
        frequency.last24Hours = (frequency.last24Hours || 0) + 1;
      }
    });
    
    return frequency;
  }

  /**
   * Analyze code churn (additions/deletions)
   */
  async analyzeCodeChurn(since = '1 week ago') {
    try {
      const diff = await this.git.diff(['--shortstat', `--since="${since}"`]);
      const match = diff.match(/(\d+)\s+files?\s+changed(?:,\s+(\d+)\s+insertions?\(\+\))?(?:,\s+(\d+)\s+deletions?\(-\))?/);
      
      if (match) {
        return {
          filesChanged: parseInt(match[1], 10) || 0,
          insertions: parseInt(match[2], 10) || 0,
          deletions: parseInt(match[3], 10) || 0,
          churnRate: (parseInt(match[2], 10) || 0) + (parseInt(match[3], 10) || 0),
        };
      }
      
      return { filesChanged: 0, insertions: 0, deletions: 0, churnRate: 0 };
    } catch (error) {
      logger.error('Error analyzing code churn:', error);
      return { filesChanged: 0, insertions: 0, deletions: 0, churnRate: 0 };
    }
  }

  /**
   * Get developer activity metrics
   */
  async getDeveloperActivity(days = 30) {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);
      
      const log = await this.git.log({
        '--since': since.toISOString(),
      });
      
      const activity = {
        totalCommits: log.total,
        activeAuthors: new Set(),
        commitsByAuthor: {},
        averageCommitsPerDay: 0,
      };
      
      log.all.forEach(commit => {
        const author = commit.author_email;
        activity.activeAuthors.add(author);
        activity.commitsByAuthor[author] = (activity.commitsByAuthor[author] || 0) + 1;
      });
      
      activity.activeAuthors = activity.activeAuthors.size;
      activity.averageCommitsPerDay = activity.totalCommits / days;
      
      return activity;
    } catch (error) {
      logger.error('Error getting developer activity:', error);
      return { totalCommits: 0, activeAuthors: 0, commitsByAuthor: {}, averageCommitsPerDay: 0 };
    }
  }

  /**
   * Identify fragile modules (frequently changed files)
   */
  async identifyFragileModules(threshold = 5) {
    try {
      const analysis = await this.analyzeRecentCommits();
      const fragileModules = [];
      
      Object.entries(analysis.filesChanged).forEach(([file, changeCount]) => {
        if (changeCount >= threshold) {
          fragileModules.push({
            file,
            changeCount,
            riskScore: Math.min(changeCount / threshold * 100, 100),
          });
        }
      });
      
      return fragileModules.sort((a, b) => b.changeCount - a.changeCount);
    } catch (error) {
      logger.error('Error identifying fragile modules:', error);
      return [];
    }
  }
}

module.exports = GitAnalyzer;

// Made with Bob
