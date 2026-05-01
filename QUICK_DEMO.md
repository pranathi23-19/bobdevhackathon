# Quick Demo Guide - AI Risk Predictor with MongoDB

## 🚀 Quick Start (5 Minutes)

### Step 1: Setup Environment

1. **Create `.env` file** from the example:
```bash
cp .env.example .env
```

2. **Edit `.env` file** and add your MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://admin:<your-password>@cluster0.bugdyot.mongodb.net/?appName=Cluster0
MONGODB_LOGS_ENABLED=true
MONGODB_DATABASE=admin
MONGODB_LOGS_COLLECTION=application-logs
```

Replace `<your-password>` with your actual MongoDB password.

### Step 2: Populate Sample Data

Run the script to create the collection and insert sample logs:

```bash
node populate-sample-logs.js
```

You should see:
```
✓ Connected to MongoDB
✓ Successfully inserted 10 logs
✓ Indexes created successfully
```

This will:
- Create the `application-logs` collection in your `admin` database
- Insert 10 sample error/warning logs
- Create indexes for fast queries

### Step 3: Start the Application

```bash
npm start
```

Server will start on `http://localhost:3000`

### Step 4: View the Dashboard

Open your browser:
```
http://localhost:3000/unified-dashboard.html
```

## 📊 What You'll See

### Log Analysis Tab
- **Live Error Logs**: Real-time display of errors from MongoDB
- **AI Analysis**: Click "Analyze Logs with AI" for intelligent insights
- **Filters**: Filter by log level, service, time range

### Sample Data Includes:
- ❌ **ERROR** logs: Database timeouts, API failures, file upload errors
- ⚠️ **WARN** logs: Failed login attempts, cache issues, token expiration
- 🔴 **CRITICAL** logs: Payment gateway down, disk space low

## 🧪 Test the API

### Get Recent Logs
```bash
curl http://localhost:3000/api/v1/logs/recent
```

### Get Only Errors
```bash
curl "http://localhost:3000/api/v1/logs/recent?levels=ERROR&size=5"
```

### Get Log Statistics
```bash
curl http://localhost:3000/api/v1/logs/stats
```

### Check MongoDB Health
```bash
curl http://localhost:3000/api/v1/mongodb/health
```

### Get Collection Info
```bash
curl http://localhost:3000/api/v1/mongodb/collection-info
```

## 🎯 Demo Scenarios

### Scenario 1: View Error Trends
1. Open dashboard → Log Analysis tab
2. Observe the 10 sample logs displayed
3. Note different error levels (ERROR, WARN, CRITICAL)
4. Check timestamps showing logs from last hour

### Scenario 2: Filter Logs
1. Use browser console or modify dashboard to filter
2. Filter by service: `api-gateway`, `auth-service`, `payment-service`
3. Filter by level: `ERROR`, `WARN`, `CRITICAL`

### Scenario 3: AI Analysis
1. Click "Analyze Logs with AI" button
2. System analyzes patterns in the logs
3. Provides insights and recommendations

### Scenario 4: Add More Logs
Run the populate script again to add more sample data:
```bash
node populate-sample-logs.js
```

## 📁 Verify in MongoDB Atlas

1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections"
3. Navigate to: **Cluster0** → **admin** → **application-logs**
4. You should see 10 documents (or more if you ran the script multiple times)

## 🔧 Troubleshooting

### "Loading logs..." doesn't finish
**Solution**: 
- Check `.env` file has correct `MONGODB_URI`
- Verify `MONGODB_LOGS_ENABLED=true`
- Check server console for errors

### Connection errors
**Solution**:
- Verify MongoDB Atlas IP whitelist includes your IP (or use 0.0.0.0/0 for testing)
- Check username/password in connection string
- Ensure database name is `admin`

### No logs showing
**Solution**:
- Run `node populate-sample-logs.js` to insert sample data
- Check MongoDB Atlas to verify collection exists
- Verify collection name is `application-logs`

## 📝 Sample Log Structure

Each log document contains:
```json
{
  "timestamp": "2026-05-01T19:00:00.000Z",
  "level": "ERROR",
  "service": "api-gateway",
  "message": "Database connection timeout",
  "stack": "Error: Connection timeout\n  at Database.connect",
  "metadata": {
    "userId": "user_12345",
    "endpoint": "/api/users",
    "duration": 30000
  }
}
```

## 🎨 Dashboard Features

### Real-Time Monitoring
- Live error count
- Service health status
- Performance metrics

### Log Analysis
- Recent error logs with details
- Stack traces for debugging
- Metadata for context

### AI Insights
- Pattern detection
- Anomaly identification
- Recommendations

## 📊 API Response Examples

### Recent Logs Response:
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2026-05-01T19:00:00.000Z",
      "level": "ERROR",
      "service": "api-gateway",
      "message": "Database connection timeout",
      "stack": "...",
      "metadata": {...}
    }
  ],
  "source": "mongodb"
}
```

### Log Stats Response:
```json
{
  "success": true,
  "data": {
    "byLevel": [
      { "level": "ERROR", "count": 5 },
      { "level": "WARN", "count": 3 },
      { "level": "CRITICAL", "count": 2 }
    ],
    "byService": [
      { "service": "api-gateway", "count": 4 },
      { "service": "auth-service", "count": 3 }
    ],
    "timeline": [...]
  }
}
```

## 🚀 Next Steps

1. **Customize**: Modify sample data in `populate-sample-logs.js`
2. **Integrate**: Connect your real applications to send logs
3. **Extend**: Add more analysis features
4. **Deploy**: Deploy to production with proper security

## 📚 Additional Resources

- Full API Documentation: `docs/API.md`
- Configuration Guide: `config/default.js`
- MongoDB Service: `src/services/mongodb-service.js`

---

**Made with Bob** 🤖

Need help? Check the server logs at `./logs/app.log`