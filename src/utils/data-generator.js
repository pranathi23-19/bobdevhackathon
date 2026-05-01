const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

/**
 * Generate sample training data for the ML model
 */
function generateTrainingData(count = 100) {
  const data = [];
  
  for (let i = 0; i < count; i++) {
    const failed = Math.random() > 0.7; // 30% failure rate
    
    // Generate features that correlate with failure
    const features = {
      codeComplexity: failed 
        ? 60 + Math.random() * 40  // High complexity (60-100)
        : 20 + Math.random() * 40, // Lower complexity (20-60)
      
      testCoverage: failed
        ? 30 + Math.random() * 40  // Low coverage (30-70)
        : 60 + Math.random() * 40, // High coverage (60-100)
      
      codeSmells: failed
        ? 20 + Math.random() * 30  // Many smells (20-50)
        : Math.random() * 20,      // Few smells (0-20)
      
      duplication: failed
        ? 10 + Math.random() * 15  // High duplication (10-25)
        : Math.random() * 10,      // Low duplication (0-10)
      
      errorRate: failed
        ? 15 + Math.random() * 35  // High error rate (15-50)
        : Math.random() * 15,      // Low error rate (0-15)
      
      warningRate: failed
        ? 20 + Math.random() * 30  // High warning rate (20-50)
        : Math.random() * 20,      // Low warning rate (0-20)
      
      criticalErrors: failed
        ? 3 + Math.random() * 7    // Many critical errors (3-10)
        : Math.random() * 3,       // Few critical errors (0-3)
      
      commitFrequency: failed
        ? 30 + Math.random() * 20  // High frequency (30-50)
        : 5 + Math.random() * 25,  // Normal frequency (5-30)
      
      rushedCommits: failed
        ? 10 + Math.random() * 15  // Many rushed (10-25)
        : Math.random() * 10,      // Few rushed (0-10)
      
      hotfixes: failed
        ? 5 + Math.random() * 10   // Many hotfixes (5-15)
        : Math.random() * 5,       // Few hotfixes (0-5)
      
      codeChurn: failed
        ? 500 + Math.random() * 500 // High churn (500-1000)
        : Math.random() * 500,      // Low churn (0-500)
      
      activeAuthors: 3 + Math.random() * 17, // 3-20 authors
      
      avgCommitSize: failed
        ? 30 + Math.random() * 30  // Large commits (30-60)
        : 5 + Math.random() * 25,  // Smaller commits (5-30)
    };
    
    data.push({ features, failed });
  }
  
  return data;
}

/**
 * Generate sample log files
 */
async function generateSampleLogs(outputDir = './data/logs') {
  try {
    await fs.mkdir(outputDir, { recursive: true });
    
    const logTypes = ['application', 'system', 'database'];
    const logLevels = ['INFO', 'WARN', 'ERROR', 'FATAL'];
    
    for (const type of logTypes) {
      const logFile = path.join(outputDir, `${type}.log`);
      const lines = [];
      
      // Generate 100 log entries
      for (let i = 0; i < 100; i++) {
        const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        const level = logLevels[Math.floor(Math.random() * logLevels.length)];
        const messages = {
          INFO: 'Application started successfully',
          WARN: 'High memory usage detected',
          ERROR: 'Database connection failed',
          FATAL: 'Critical system failure',
        };
        
        lines.push(`${timestamp.toISOString()} [${level}] ${messages[level]}`);
      }
      
      await fs.writeFile(logFile, lines.join('\n'));
      logger.info(`Generated ${logFile}`);
    }
    
    logger.info('Sample logs generated successfully');
  } catch (error) {
    logger.error('Error generating sample logs:', error);
    throw error;
  }
}

/**
 * Generate sample project structure
 */
async function generateSampleProject(outputDir = './data/sample-project') {
  try {
    await fs.mkdir(outputDir, { recursive: true });
    
    // Create sample source files
    const files = [
      {
        path: 'src/app.js',
        content: `
// Sample application file
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}

function processOrder(order) {
  if (!order) {
    throw new Error('Order is required');
  }
  
  const total = calculateTotal(order.items);
  
  if (total > 1000) {
    console.log('Large order detected');
  }
  
  return { orderId: order.id, total };
}

module.exports = { calculateTotal, processOrder };
        `.trim(),
      },
      {
        path: 'src/utils.js',
        content: `
// Utility functions
function formatCurrency(amount) {
  return '$' + amount.toFixed(2);
}

function validateEmail(email) {
  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return regex.test(email);
}

module.exports = { formatCurrency, validateEmail };
        `.trim(),
      },
      {
        path: 'src/app.test.js',
        content: `
// Test file
const { calculateTotal, processOrder } = require('./app');

test('calculateTotal sums item prices', () => {
  const items = [{ price: 10 }, { price: 20 }];
  expect(calculateTotal(items)).toBe(30);
});

test('processOrder throws error for null order', () => {
  expect(() => processOrder(null)).toThrow('Order is required');
});
        `.trim(),
      },
    ];
    
    for (const file of files) {
      const filePath = path.join(outputDir, file.path);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, file.content);
      logger.info(`Generated ${filePath}`);
    }
    
    logger.info('Sample project generated successfully');
  } catch (error) {
    logger.error('Error generating sample project:', error);
    throw error;
  }
}

/**
 * Main function to generate all demo data
 */
async function generateAllDemoData() {
  try {
    logger.info('Generating demo data...');
    
    // Generate training data
    const trainingData = generateTrainingData(100);
    await fs.mkdir('./data', { recursive: true });
    await fs.writeFile(
      './data/training-data.json',
      JSON.stringify(trainingData, null, 2)
    );
    logger.info('Training data generated: ./data/training-data.json');
    
    // Generate sample logs
    await generateSampleLogs();
    
    // Generate sample project
    await generateSampleProject();
    
    logger.info('All demo data generated successfully!');
    logger.info('You can now run the application with: npm start');
  } catch (error) {
    logger.error('Error generating demo data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateAllDemoData();
}

module.exports = {
  generateTrainingData,
  generateSampleLogs,
  generateSampleProject,
  generateAllDemoData,
};

// Made with Bob
