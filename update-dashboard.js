const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'public', 'unified-dashboard.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace IBM Cloud button with Log Reports
html = html.replace(
  /<button class="tab-button" data-tab="cloud">\s*<span class="tab-icon">☁️<\/span>\s*<span>IBM Cloud<\/span>\s*<\/button>/,
  `<button class="tab-button" data-tab="cloud">
                <span class="tab-icon">📊</span>
                <span>Log Reports</span>
            </button>`
);

// Replace IBM Cloud tab content
const ibmCloudTabStart = html.indexOf('<!-- Tab 3: IBM Cloud -->');
const ibmCloudTabEnd = html.indexOf('<!-- Tab 4:', ibmCloudTabStart);

if (ibmCloudTabStart !== -1 && ibmCloudTabEnd !== -1) {
  const newTabContent = `<!-- Tab 3: Log Reports -->
        <div id="tab-cloud" class="tab-content">
            <div class="section-header">
                <h2>📊 Log Reports & Analytics</h2>
                <p>Generate comprehensive reports and export log data</p>
            </div>

            <div class="grid-2">
                <!-- Report Generation -->
                <div class="card">
                    <div class="card-header">
                        <h3>📄 Generate Report</h3>
                    </div>
                    <div class="card-body">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: #aaa;">Report Format:</label>
                            <select id="reportFormat" style="width: 100%; padding: 10px; background: #1a1f3a; border: 1px solid #2a2f4a; border-radius: 4px; color: #fff;">
                                <option value="html">HTML Report</option>
                                <option value="json">JSON Data</option>
                            </select>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: #aaa;">Time Range:</label>
                            <select id="reportTimeRange" style="width: 100%; padding: 10px; background: #1a1f3a; border: 1px solid #2a2f4a; border-radius: 4px; color: #fff;">
                                <option value="1h">Last 1 Hour</option>
                                <option value="6h">Last 6 Hours</option>
                                <option value="24h" selected>Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                            </select>
                        </div>
                        <button onclick="generateReport()" class="btn-primary" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">
                            📊 Generate Report
                        </button>
                        <div id="reportStatus" style="margin-top: 15px; padding: 10px; background: #1a1f3a; border-radius: 4px; display: none;"></div>
                    </div>
                </div>

                <!-- Export Data -->
                <div class="card">
                    <div class="card-header">
                        <h3>💾 Export Logs</h3>
                    </div>
                    <div class="card-body">
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: #aaa;">Export Format:</label>
                            <select id="exportFormat" style="width: 100%; padding: 10px; background: #1a1f3a; border: 1px solid #2a2f4a; border-radius: 4px; color: #fff;">
                                <option value="csv">CSV File</option>
                                <option value="json">JSON File</option>
                            </select>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: #aaa;">Log Levels:</label>
                            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                <label style="display: flex; align-items: center; gap: 5px; color: #aaa;">
                                    <input type="checkbox" id="exportError" checked> ERROR
                                </label>
                                <label style="display: flex; align-items: center; gap: 5px; color: #aaa;">
                                    <input type="checkbox" id="exportCritical" checked> CRITICAL
                                </label>
                                <label style="display: flex; align-items: center; gap: 5px; color: #aaa;">
                                    <input type="checkbox" id="exportWarn" checked> WARN
                                </label>
                            </div>
                        </div>
                        <button onclick="exportLogs()" class="btn-primary" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border: none; border-radius: 8px; color: white; font-weight: bold; cursor: pointer;">
                            💾 Export Data
                        </button>
                        <div id="exportStatus" style="margin-top: 15px; padding: 10px; background: #1a1f3a; border-radius: 4px; display: none;"></div>
                    </div>
                </div>
            </div>

            <!-- Report Preview -->
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3>📈 Quick Statistics</h3>
                </div>
                <div class="card-body">
                    <div id="quickStats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div style="background: #1a1f3a; padding: 20px; border-radius: 8px; border-left: 4px solid #4CAF50;">
                            <div style="color: #aaa; font-size: 14px; margin-bottom: 5px;">Total Logs (24h)</div>
                            <div style="font-size: 32px; font-weight: bold;" id="stat-total">--</div>
                        </div>
                        <div style="background: #1a1f3a; padding: 20px; border-radius: 8px; border-left: 4px solid #f44336;">
                            <div style="color: #aaa; font-size: 14px; margin-bottom: 5px;">Errors</div>
                            <div style="font-size: 32px; font-weight: bold; color: #f44336;" id="stat-errors">--</div>
                        </div>
                        <div style="background: #1a1f3a; padding: 20px; border-radius: 8px; border-left: 4px solid #d32f2f;">
                            <div style="color: #aaa; font-size: 14px; margin-bottom: 5px;">Critical</div>
                            <div style="font-size: 32px; font-weight: bold; color: #d32f2f;" id="stat-critical">--</div>
                        </div>
                        <div style="background: #1a1f3a; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800;">
                            <div style="color: #aaa; font-size: 14px; margin-bottom: 5px;">Warnings</div>
                            <div style="font-size: 32px; font-weight: bold; color: #ff9800;" id="stat-warnings">--</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        `;
  
  html = html.substring(0, ibmCloudTabStart) + newTabContent + html.substring(ibmCloudTabEnd);
}

// Remove IBM Cloud JavaScript functions and add new ones
const scriptStart = html.lastIndexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');

if (scriptStart !== -1 && scriptEnd !== -1) {
  const beforeScript = html.substring(0, scriptStart + 8);
  const afterScript = html.substring(scriptEnd);
  
  // Add new functions for reports
  const newFunctions = `
        
        // Generate Report Function
        async function generateReport() {
            const format = document.getElementById('reportFormat').value;
            const timeRange = document.getElementById('reportTimeRange').value;
            const statusDiv = document.getElementById('reportStatus');
            
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = '⏳ Generating report...';
            statusDiv.style.color = '#4CAF50';
            
            try {
                const url = \`\${API_BASE}/logs/report?format=\${format}&timeRange=now-\${timeRange}\`;
                
                if (format === 'html') {
                    window.open(url, '_blank');
                    statusDiv.innerHTML = '✅ Report opened in new tab';
                } else {
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    if (data.success) {
                        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
                        const downloadUrl = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = downloadUrl;
                        a.download = \`log-report-\${Date.now()}.json\`;
                        a.click();
                        statusDiv.innerHTML = '✅ Report downloaded successfully';
                    } else {
                        throw new Error(data.error);
                    }
                }
            } catch (error) {
                statusDiv.innerHTML = '❌ Error: ' + error.message;
                statusDiv.style.color = '#f44336';
            }
        }
        
        // Export Logs Function
        async function exportLogs() {
            const format = document.getElementById('exportFormat').value;
            const statusDiv = document.getElementById('exportStatus');
            
            const levels = [];
            if (document.getElementById('exportError').checked) levels.push('ERROR');
            if (document.getElementById('exportCritical').checked) levels.push('CRITICAL');
            if (document.getElementById('exportWarn').checked) levels.push('WARN');
            
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = '⏳ Exporting logs...';
            statusDiv.style.color = '#4CAF50';
            
            try {
                const response = await fetch(\`\${API_BASE}/logs/export\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ format, levels })
                });
                
                if (format === 'csv') {
                    const text = await response.text();
                    const blob = new Blob([text], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = \`logs-export-\${Date.now()}.csv\`;
                    a.click();
                } else {
                    const data = await response.json();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = \`logs-export-\${Date.now()}.json\`;
                    a.click();
                }
                
                statusDiv.innerHTML = '✅ Export completed successfully';
            } catch (error) {
                statusDiv.innerHTML = '❌ Error: ' + error.message;
                statusDiv.style.color = '#f44336';
            }
        }
        
        // Load Quick Stats
        async function loadQuickStats() {
            try {
                const response = await fetch(\`\${API_BASE}/logs/stats\`);
                const data = await response.json();
                
                if (data.success) {
                    const stats = data.data;
                    let total = 0, errors = 0, critical = 0, warnings = 0;
                    
                    stats.byLevel.forEach(item => {
                        total += item.count;
                        if (item.level === 'ERROR') errors = item.count;
                        if (item.level === 'CRITICAL') critical = item.count;
                        if (item.level === 'WARN') warnings = item.count;
                    });
                    
                    document.getElementById('stat-total').textContent = total;
                    document.getElementById('stat-errors').textContent = errors;
                    document.getElementById('stat-critical').textContent = critical;
                    document.getElementById('stat-warnings').textContent = warnings;
                }
            } catch (error) {
                console.error('Error loading quick stats:', error);
            }
        }
        
        // Load stats when cloud tab is opened
        const originalSwitchTab = switchTab;
        switchTab = function(tabName) {
            originalSwitchTab(tabName);
            if (tabName === 'cloud') {
                loadQuickStats();
            }
        };
`;

  const existingScript = html.substring(scriptStart + 8, scriptEnd);
  
  // Remove IBM Cloud functions
  let cleanedScript = existingScript
    .replace(/async function updateIBMCloudHealth\(\) \{[\s\S]*?\n        \}/g, '')
    .replace(/async function updateIBMCloudMetrics\(\) \{[\s\S]*?\n        \}/g, '')
    .replace(/async function simulateDowntime\(\) \{[\s\S]*?\n        \}/g, '');
  
  html = beforeScript + cleanedScript + newFunctions + afterScript;
}

// Write the updated HTML
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('✅ Dashboard updated successfully!');
console.log('- Replaced IBM Cloud tab with Log Reports');
console.log('- Added report generation functionality');
console.log('- Added log export functionality');
console.log('\nPlease refresh your browser to see the changes.');

// Made with Bob
