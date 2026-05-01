const { MongoClient } = require('mongodb');
require('dotenv').config();

/**
 * Script to populate sample logs in MongoDB for demo purposes
 */
async function populateSampleLogs() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const database = process.env.MONGODB_DATABASE || 'admin';
  const collection = process.env.MONGODB_LOGS_COLLECTION || 'application-logs';
  
  console.log('Connecting to MongoDB...');
  console.log('URI:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password
  console.log('Database:', database);
  console.log('Collection:', collection);
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');
    
    const db = client.db(database);
    const logsCollection = db.collection(collection);
    
    // Sample log data
    const sampleLogs = [
      {
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        level: 'ERROR',
        service: 'api-gateway',
        message: 'Database connection timeout after 30 seconds',
        stack: 'Error: Connection timeout\n  at Database.connect (db.js:45)\n  at async Server.start (server.js:12)',
        metadata: { 
          userId: 'user_12345', 
          endpoint: '/api/users',
          duration: 30000,
          retries: 3
        }
      },
      {
        timestamp: new Date(Date.now() - 3000000), // 50 minutes ago
        level: 'WARN',
        service: 'auth-service',
        message: 'Multiple failed login attempts detected from same IP',
        metadata: { 
          ip: '192.168.1.100', 
          attempts: 5,
          username: 'admin',
          blocked: false
        }
      },
      {
        timestamp: new Date(Date.now() - 2400000), // 40 minutes ago
        level: 'CRITICAL',
        service: 'payment-service',
        message: 'Payment gateway unreachable - all transactions failing',
        stack: 'Error: Payment gateway timeout\n  at PaymentGateway.process (payment.js:89)\n  at async Transaction.complete (transaction.js:156)',
        metadata: { 
          transactionId: 'TXN-789456',
          amount: 99.99,
          currency: 'USD',
          gateway: 'stripe'
        }
      },
      {
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        level: 'ERROR',
        service: 'notification-service',
        message: 'Failed to send email notification - SMTP server not responding',
        stack: 'Error: SMTP connection failed\n  at SMTPClient.send (smtp.js:234)',
        metadata: { 
          recipient: 'user@example.com',
          emailType: 'password-reset',
          smtpHost: 'smtp.example.com'
        }
      },
      {
        timestamp: new Date(Date.now() - 1200000), // 20 minutes ago
        level: 'WARN',
        service: 'cache-service',
        message: 'Redis cache miss rate exceeding threshold',
        metadata: { 
          missRate: 0.45,
          threshold: 0.30,
          totalRequests: 10000,
          cacheHits: 5500
        }
      },
      {
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        level: 'ERROR',
        service: 'api-gateway',
        message: 'Rate limit exceeded for API endpoint',
        metadata: { 
          endpoint: '/api/data/export',
          clientId: 'client_abc123',
          requestCount: 1050,
          limit: 1000,
          window: '1h'
        }
      },
      {
        timestamp: new Date(Date.now() - 600000), // 10 minutes ago
        level: 'CRITICAL',
        service: 'database-service',
        message: 'Database disk space critically low',
        metadata: { 
          diskUsage: 95,
          threshold: 90,
          availableSpace: '2.5GB',
          totalSpace: '50GB'
        }
      },
      {
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        level: 'ERROR',
        service: 'file-service',
        message: 'File upload failed - invalid file format',
        metadata: { 
          fileName: 'document.xyz',
          fileSize: 5242880,
          expectedFormats: ['pdf', 'doc', 'docx'],
          userId: 'user_67890'
        }
      },
      {
        timestamp: new Date(Date.now() - 120000), // 2 minutes ago
        level: 'WARN',
        service: 'auth-service',
        message: 'JWT token expiration approaching for active session',
        metadata: { 
          userId: 'user_12345',
          sessionId: 'sess_abc123',
          expiresIn: 300,
          tokenType: 'access'
        }
      },
      {
        timestamp: new Date(Date.now() - 60000), // 1 minute ago
        level: 'ERROR',
        service: 'api-gateway',
        message: 'Downstream service timeout - request took too long',
        stack: 'Error: Request timeout\n  at ServiceClient.request (client.js:78)\n  at async Gateway.proxy (gateway.js:234)',
        metadata: { 
          service: 'user-service',
          endpoint: '/api/users/profile',
          timeout: 5000,
          actualDuration: 5100
        }
      }
    ];
    
    // Insert sample logs
    console.log(`\nInserting ${sampleLogs.length} sample logs...`);
    const result = await logsCollection.insertMany(sampleLogs);
    console.log(`✓ Successfully inserted ${result.insertedCount} logs`);
    
    // Create indexes
    console.log('\nCreating indexes...');
    await logsCollection.createIndex({ timestamp: -1 });
    await logsCollection.createIndex({ level: 1 });
    await logsCollection.createIndex({ service: 1 });
    await logsCollection.createIndex({ timestamp: -1, level: 1 });
    console.log('✓ Indexes created successfully');
    
    // Display summary
    console.log('\n=== Summary ===');
    const stats = await logsCollection.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\nLogs by level:');
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });
    
    const serviceStats = await logsCollection.aggregate([
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\nLogs by service:');
    serviceStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });
    
    console.log('\n✓ Sample data population complete!');
    console.log('\nNext steps:');
    console.log('1. Start the server: npm start');
    console.log('2. Open dashboard: http://localhost:3000/unified-dashboard.html');
    console.log('3. Click on "Log Analysis" tab to view the logs');
    
  } catch (error) {
    console.error('✗ Error populating sample logs:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your MONGODB_URI in .env file');
    console.error('2. Ensure MongoDB Atlas IP whitelist includes your IP');
    console.error('3. Verify database credentials are correct');
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✓ MongoDB connection closed');
  }
}

// Run the script
populateSampleLogs();

// Made with Bob