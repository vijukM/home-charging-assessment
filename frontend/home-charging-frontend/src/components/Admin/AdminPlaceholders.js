// src/components/Admin/AdminPlaceholders.js
import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import './AdminPlaceholders.css';


// Export Data Component
export function ExportData() {
  const [loading, setLoading] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    format: 'xlsx',
    status: '',
    dateFrom: '',
    dateTo: '',
    columns: ['firstName', 'lastName', 'email', 'status', 'city', 'vehicleBrand', 'createdAt']
  });

  const availableColumns = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status' },
    { key: 'city', label: 'City' },
    { key: 'vehicleBrand', label: 'Vehicle Brand' },
    { key: 'vehicleModel', label: 'Vehicle Model' },
    { key: 'currentPage', label: 'Current Step' },
    { key: 'createdAt', label: 'Created Date' }
  ];

  const handleExport = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (exportConfig.status) filters.status = exportConfig.status;
      if (exportConfig.dateFrom) filters.dateFrom = exportConfig.dateFrom;
      if (exportConfig.dateTo) filters.dateTo = exportConfig.dateTo;

      await adminService.exportAssessments({
        format: exportConfig.format,
        filters: filters,
        columns: exportConfig.columns
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleColumnToggle = (columnKey) => {
    setExportConfig(prev => ({
      ...prev,
      columns: prev.columns.includes(columnKey)
        ? prev.columns.filter(col => col !== columnKey)
        : [...prev.columns, columnKey]
    }));
  };

  return (
    <div className="admin-placeholder">
      <div className="placeholder-header">
        <i className="fas fa-download"></i>
        <h1>Export Data</h1>
        <p className="header-subtitle">Export assessment data in various formats</p>
      </div>
      
      <div className="placeholder-content">
        <div className="export-form">
          <div className="form-section">
            <h3>Export Format</h3>
            <div className="format-options">
              <label className="format-option">
                <input
                  type="radio"
                  name="format"
                  value="xlsx"
                  checked={exportConfig.format === 'xlsx'}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, format: e.target.value }))}
                />
                <span>Excel (.xlsx)</span>
              </label>
              <label className="format-option">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportConfig.format === 'csv'}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, format: e.target.value }))}
                />
                <span>CSV (.csv)</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3>Filters</h3>
            <div className="filter-grid">
              <div className="filter-group">
                <label>Status</label>
                <select
                  value={exportConfig.status}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed Only</option>
                  <option value="incomplete">Incomplete Only</option>
                  <option value="abandoned">Abandoned Only</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Date From</label>
                <input
                  type="date"
                  value={exportConfig.dateFrom}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>
              
              <div className="filter-group">
                <label>Date To</label>
                <input
                  type="date"
                  value={exportConfig.dateTo}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Columns to Export</h3>
            <div className="columns-grid">
              {availableColumns.map(column => (
                <label key={column.key} className="column-option">
                  <input
                    type="checkbox"
                    checked={exportConfig.columns.includes(column.key)}
                    onChange={() => handleColumnToggle(column.key)}
                  />
                  <span>{column.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="export-actions">
            <button 
              className="btn-export-action"
              onClick={handleExport}
              disabled={loading || exportConfig.columns.length === 0}
            >
              {loading ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <i className="fas fa-download"></i>
                  Export Data
                </>
              )}
            </button>
            
            <div className="export-info">
              <p>
                <i className="fas fa-info-circle"></i>
                {exportConfig.columns.length} columns selected
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate Reports Component  
export function GenerateReports() {
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { key: 'summary', label: 'Summary Report', icon: 'fas fa-chart-pie' },
    { key: 'completion', label: 'Completion Analysis', icon: 'fas fa-chart-line' },
    { key: 'dropoff', label: 'Drop-off Analysis', icon: 'fas fa-chart-bar' },
    { key: 'geographic', label: 'Geographic Distribution', icon: 'fas fa-map' },
    { key: 'vehicle', label: 'Vehicle Analysis', icon: 'fas fa-car' }
  ];

  const generateReport = async () => {
    setLoading(true);
    try {
      // Implementation would depend on backend endpoints
      await adminService.exportAssessments({
        format: 'xlsx',
        filters: {
          dateFrom: dateRange.from,
          dateTo: dateRange.to,
          reportType: reportType
        },
        columns: getColumnsForReportType(reportType)
      });
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColumnsForReportType = (type) => {
    switch (type) {
      case 'summary':
        return ['firstName', 'lastName', 'email', 'status', 'city', 'vehicleBrand', 'createdAt'];
      case 'completion':
        return ['firstName', 'lastName', 'status', 'currentPage', 'createdAt'];
      case 'geographic':
        return ['city', 'status', 'createdAt'];
      case 'vehicle':
        return ['vehicleBrand', 'vehicleModel', 'status', 'city'];
      default:
        return ['firstName', 'lastName', 'email', 'status'];
    }
  };

  return (
    <div className="admin-placeholder">
      <div className="placeholder-header">
        <i className="fas fa-file-alt"></i>
        <h1>Generate Reports</h1>
        <p className="header-subtitle">Create detailed analysis reports</p>
      </div>
      
      <div className="placeholder-content">
        <div className="report-form">
          <div className="form-section">
            <h3>Report Type</h3>
            <div className="report-types">
              {reportTypes.map(type => (
                <label key={type.key} className="report-type-option">
                  <input
                    type="radio"
                    name="reportType"
                    value={type.key}
                    checked={reportType === type.key}
                    onChange={(e) => setReportType(e.target.value)}
                  />
                  <div className="report-type-content">
                    <i className={type.icon}></i>
                    <span>{type.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Date Range</h3>
            <div className="date-range">
              <div className="date-group">
                <label>From</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                />
              </div>
              <div className="date-group">
                <label>To</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="report-actions">
            <button 
              className="btn-generate-report"
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fas fa-file-alt"></i>
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


export function ActiveUsers() {
  return (
    <div className="admin-placeholder">
      <div className="placeholder-header">
        <i className="fas fa-user-check"></i>
        <h1>Active Users</h1>
        <p className="header-subtitle">Real-time user activity monitoring</p>
      </div>
      <div className="placeholder-content">
        <div className="placeholder-card">
          <h3>User Activity Tracking</h3>
          <p>Monitor and analyze:</p>
          <ul>
            <li>Currently online users and session data</li>
            <li>Daily, weekly, and monthly active user metrics</li>
            <li>User engagement patterns and behavior analytics</li>
            <li>Session duration and activity timeline</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function RecentSignups() {
  return (
    <div className="admin-placeholder">
      <div className="placeholder-header">
        <i className="fas fa-user-plus"></i>
        <h1>Recent Signups</h1>
        <p className="header-subtitle">New user registration tracking</p>
      </div>
      <div className="placeholder-content">
        <div className="placeholder-card">
          <h3>Registration Monitoring</h3>
          <p>Track and manage:</p>
          <ul>
            <li>New user registrations and verification status</li>
            <li>Registration trends and acquisition sources</li>
            <li>Onboarding progress and completion rates</li>
            <li>User activation and first assessment metrics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function CompletionRates() {
  return (
    <div className="admin-placeholder">
      <div className="placeholder-header">
        <i className="fas fa-chart-line"></i>
        <h1>Completion Rates</h1>
        <p className="header-subtitle">Deep analytics on assessment completion</p>
      </div>
      <div className="placeholder-content">
        <div className="placeholder-card">
          <h3>Completion Analytics</h3>
          <p>Analyze completion patterns by:</p>
          <ul>
            <li>Time periods with trend analysis</li>
            <li>Geographic regions and city comparisons</li>
            <li>Vehicle types and brand preferences</li>
            <li>User demographics and behavior segments</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function DropOffAnalysis() {
  return (
    <div className="admin-placeholder">
      <div className="placeholder-header">
        <i className="fas fa-chart-bar"></i>
        <h1>Drop-off Analysis</h1>
        <p className="header-subtitle">Optimize user journey and reduce abandonment</p>
      </div>
      <div className="placeholder-content">
        <div className="placeholder-card">
          <h3>User Journey Optimization</h3>
          <p>Comprehensive analysis including:</p>
          <ul>
            <li>Step-by-step funnel analysis with conversion rates</li>
            <li>Critical exit points identification and patterns</li>
            <li>Time spent analysis per assessment step</li>
            <li>Actionable recommendations for UX improvements</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// System management placeholder components remain the same as they're more technical
export function AdminManagement() {
  return (
    <div className="admin-placeholder">
      <div className="placeholder-header">
        <i className="fas fa-user-shield"></i>
        <h1>Admin Management</h1>
      </div>
      <div className="placeholder-content">
        <div className="placeholder-card">
          <h3>Administrator Controls</h3>
          <p>Manage admin accounts:</p>
          <ul>
            <li>Add/remove admin users</li>
            <li>Permission management</li>
            <li>Role assignments</li>
            <li>Activity audit logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function DatabaseManagement() {
  return (
    <div className="admin-placeholder">
      <div className="placeholder-header">
        <i className="fas fa-database"></i>
        <h1>Database Management</h1>
      </div>
      <div className="placeholder-content">
        <div className="placeholder-card">
          <h3>Database Operations</h3>
          <p>Database maintenance tools:</p>
          <ul>
            <li>Database health monitoring</li>
            <li>Backup management</li>
            <li>Data cleanup utilities</li>
            <li>Performance metrics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function SystemLogs() {
  return (
    <div className="admin-placeholder">
      <div className="placeholder-header">
        <i className="fas fa-clipboard-list"></i>
        <h1>System Logs</h1>
      </div>
      <div className="placeholder-content">
        <div className="placeholder-card">
          <h3>System Activity Logs</h3>
          <p>Monitor system activities:</p>
          <ul>
            <li>Application logs</li>
            <li>Error tracking</li>
            <li>User activity logs</li>
            <li>Security events</li>
          </ul>
        </div>
      </div>
    </div>
  );
}