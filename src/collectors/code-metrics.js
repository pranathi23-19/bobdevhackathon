const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');
const EventEmitter = require('events');
const config = require('../../config/default');
const logger = require('../utils/logger');

const globAsync = glob;

class CodeMetrics extends EventEmitter {
  constructor() {
    super();
    this.complexityThreshold = config.dataSources.codeMetrics.complexityThreshold;
    this.coverageThreshold = config.dataSources.codeMetrics.coverageThreshold;
    this.duplicationThreshold = config.dataSources.codeMetrics.duplicationThreshold;
  }

  /**
   * Analyze code metrics for a project
   */
  async analyzeProject(projectPath = './') {
    try {
      logger.info('Analyzing code metrics...');
      
      const files = await this.getSourceFiles(projectPath);
      const metrics = {
        totalFiles: files.length,
        totalLines: 0,
        totalComplexity: 0,
        averageComplexity: 0,
        highComplexityFiles: [],
        codeSmells: [],
        duplication: {
          duplicateBlocks: 0,
          duplicateLines: 0,
        },
        coverage: {
          estimated: 0,
          hasTests: false,
        },
        fileMetrics: [],
      };

      for (const file of files) {
        const fileMetrics = await this.analyzeFile(file);
        metrics.fileMetrics.push(fileMetrics);
        metrics.totalLines += fileMetrics.lines;
        metrics.totalComplexity += fileMetrics.complexity;

        if (fileMetrics.complexity > this.complexityThreshold) {
          metrics.highComplexityFiles.push({
            file: fileMetrics.path,
            complexity: fileMetrics.complexity,
          });
        }

        metrics.codeSmells.push(...fileMetrics.codeSmells);
      }

      metrics.averageComplexity = metrics.totalFiles > 0 
        ? metrics.totalComplexity / metrics.totalFiles 
        : 0;

      // Estimate test coverage
      metrics.coverage = await this.estimateTestCoverage(projectPath);

      // Detect code duplication
      metrics.duplication = await this.detectDuplication(files);

      this.emit('metrics-calculated', metrics);
      return metrics;
    } catch (error) {
      logger.error('Error analyzing project:', error);
      throw error;
    }
  }

  /**
   * Get all source files in project
   */
  async getSourceFiles(projectPath) {
    const patterns = [
      '**/*.js',
      '**/*.ts',
      '**/*.jsx',
      '**/*.tsx',
      '**/*.py',
      '**/*.java',
      '**/*.go',
      '**/*.rs',
    ];

    const ignore = [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.git/**',
      '**/vendor/**',
      '**/target/**',
    ];

    const files = [];
    for (const pattern of patterns) {
      const matches = await globAsync(pattern, {
        cwd: projectPath,
        ignore,
        absolute: true,
      });
      files.push(...matches);
    }

    return [...new Set(files)]; // Remove duplicates
  }

  /**
   * Analyze individual file
   */
  async analyzeFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      return {
        path: filePath,
        lines: lines.length,
        codeLines: this.countCodeLines(lines),
        commentLines: this.countCommentLines(lines),
        blankLines: this.countBlankLines(lines),
        complexity: this.calculateComplexity(content),
        functions: this.countFunctions(content),
        classes: this.countClasses(content),
        codeSmells: this.detectCodeSmells(filePath, content),
      };
    } catch (error) {
      logger.error(`Error analyzing file ${filePath}:`, error);
      return {
        path: filePath,
        lines: 0,
        codeLines: 0,
        commentLines: 0,
        blankLines: 0,
        complexity: 0,
        functions: 0,
        classes: 0,
        codeSmells: [],
      };
    }
  }

  /**
   * Count code lines (non-comment, non-blank)
   */
  countCodeLines(lines) {
    return lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && 
             !trimmed.startsWith('//') && 
             !trimmed.startsWith('/*') && 
             !trimmed.startsWith('*') &&
             !trimmed.startsWith('#');
    }).length;
  }

  /**
   * Count comment lines
   */
  countCommentLines(lines) {
    return lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('//') || 
             trimmed.startsWith('/*') || 
             trimmed.startsWith('*') ||
             trimmed.startsWith('#');
    }).length;
  }

  /**
   * Count blank lines
   */
  countBlankLines(lines) {
    return lines.filter(line => line.trim().length === 0).length;
  }

  /**
   * Calculate cyclomatic complexity
   */
  calculateComplexity(content) {
    let complexity = 1; // Base complexity
    
    // Count decision points
    const patterns = [
      /\bif\b/g,
      /\belse\s+if\b/g,
      /\bwhile\b/g,
      /\bfor\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\b&&\b/g,
      /\b\|\|\b/g,
      /\?\s*.*\s*:/g, // Ternary operator
    ];

    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  /**
   * Count functions in file
   */
  countFunctions(content) {
    const patterns = [
      /function\s+\w+/g,
      /\w+\s*:\s*function/g,
      /\w+\s*=\s*function/g,
      /\w+\s*=\s*\([^)]*\)\s*=>/g,
      /async\s+function/g,
      /def\s+\w+/g, // Python
      /func\s+\w+/g, // Go
      /fn\s+\w+/g, // Rust
    ];

    let count = 0;
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        count += matches.length;
      }
    });

    return count;
  }

  /**
   * Count classes in file
   */
  countClasses(content) {
    const patterns = [
      /class\s+\w+/g,
      /interface\s+\w+/g,
      /struct\s+\w+/g,
    ];

    let count = 0;
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        count += matches.length;
      }
    });

    return count;
  }

  /**
   * Detect code smells
   */
  detectCodeSmells(filePath, content) {
    const smells = [];
    const lines = content.split('\n');

    // Long method (> 50 lines)
    const functionBlocks = this.extractFunctionBlocks(content);
    functionBlocks.forEach(block => {
      if (block.lines > 50) {
        smells.push({
          type: 'long_method',
          file: filePath,
          severity: 'medium',
          message: `Function has ${block.lines} lines (threshold: 50)`,
          line: block.startLine,
        });
      }
    });

    // Magic numbers
    lines.forEach((line, index) => {
      const magicNumbers = line.match(/\b\d{2,}\b/g);
      if (magicNumbers && !line.includes('//') && !line.includes('const')) {
        smells.push({
          type: 'magic_number',
          file: filePath,
          severity: 'low',
          message: `Magic number found: ${magicNumbers.join(', ')}`,
          line: index + 1,
        });
      }
    });

    // TODO/FIXME comments
    lines.forEach((line, index) => {
      if (/TODO|FIXME|HACK|XXX/i.test(line)) {
        smells.push({
          type: 'todo_comment',
          file: filePath,
          severity: 'low',
          message: 'TODO/FIXME comment found',
          line: index + 1,
        });
      }
    });

    // Deeply nested code (> 4 levels)
    lines.forEach((line, index) => {
      const indentation = line.match(/^\s*/)[0].length;
      if (indentation > 16) { // Assuming 4 spaces per level
        smells.push({
          type: 'deep_nesting',
          file: filePath,
          severity: 'medium',
          message: 'Deeply nested code detected',
          line: index + 1,
        });
      }
    });

    // Long parameter list (> 5 parameters)
    const longParamFunctions = content.match(/function\s+\w+\s*\([^)]{50,}\)/g);
    if (longParamFunctions) {
      smells.push({
        type: 'long_parameter_list',
        file: filePath,
        severity: 'medium',
        message: `${longParamFunctions.length} function(s) with long parameter lists`,
        line: 0,
      });
    }

    return smells;
  }

  /**
   * Extract function blocks for analysis
   */
  extractFunctionBlocks(content) {
    const blocks = [];
    const lines = content.split('\n');
    let inFunction = false;
    let braceCount = 0;
    let currentBlock = null;

    lines.forEach((line, index) => {
      if (/function\s+\w+|=>\s*{|def\s+\w+/.test(line)) {
        inFunction = true;
        currentBlock = { startLine: index + 1, lines: 0 };
      }

      if (inFunction) {
        currentBlock.lines++;
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;

        if (braceCount === 0 && currentBlock.lines > 1) {
          blocks.push(currentBlock);
          inFunction = false;
          currentBlock = null;
        }
      }
    });

    return blocks;
  }

  /**
   * Estimate test coverage
   */
  async estimateTestCoverage(projectPath) {
    try {
      const testFiles = await globAsync('**/*.{test,spec}.{js,ts,jsx,tsx,py}', {
        cwd: projectPath,
        ignore: ['**/node_modules/**', '**/dist/**'],
      });

      const sourceFiles = await this.getSourceFiles(projectPath);
      const testFileCount = testFiles.length;
      const sourceFileCount = sourceFiles.length;

      // Simple estimation: ratio of test files to source files
      const estimatedCoverage = sourceFileCount > 0 
        ? Math.min((testFileCount / sourceFileCount) * 100, 100) 
        : 0;

      return {
        estimated: Math.round(estimatedCoverage),
        hasTests: testFileCount > 0,
        testFiles: testFileCount,
        sourceFiles: sourceFileCount,
      };
    } catch (error) {
      logger.error('Error estimating test coverage:', error);
      return { estimated: 0, hasTests: false, testFiles: 0, sourceFiles: 0 };
    }
  }

  /**
   * Detect code duplication
   */
  async detectDuplication(files) {
    try {
      // Simple duplication detection based on similar line sequences
      const duplication = {
        duplicateBlocks: 0,
        duplicateLines: 0,
        duplicates: [],
      };

      // This is a simplified version - in production, use tools like jscpd
      const fileContents = await Promise.all(
        files.map(async file => ({
          path: file,
          content: await fs.readFile(file, 'utf-8'),
        }))
      );

      // Compare files for similar blocks (simplified)
      for (let i = 0; i < fileContents.length; i++) {
        for (let j = i + 1; j < fileContents.length; j++) {
          const similarity = this.calculateSimilarity(
            fileContents[i].content,
            fileContents[j].content
          );

          if (similarity > 0.7) {
            duplication.duplicateBlocks++;
            duplication.duplicates.push({
              file1: fileContents[i].path,
              file2: fileContents[j].path,
              similarity: Math.round(similarity * 100),
            });
          }
        }
      }

      return duplication;
    } catch (error) {
      logger.error('Error detecting duplication:', error);
      return { duplicateBlocks: 0, duplicateLines: 0, duplicates: [] };
    }
  }

  /**
   * Calculate similarity between two strings
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}

module.exports = CodeMetrics;

// Made with Bob
