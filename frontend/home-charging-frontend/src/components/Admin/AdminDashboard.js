// src/components/Admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import adminService from '../../services/adminService';
import './AdminDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    kpis: {},
    topData: {},
    chartSummary: {},
    systemHealth: {}
  });
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load dashboard summary
      const summary = await adminService.getDashboardSummary();
      setDashboardData(summary);

      // Load recent assessments (first 5)
      const assessmentsResponse = await adminService.getAllAssessments({
        page: 1,
        pageSize: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (assessmentsResponse.items) {
        setRecentAssessments(assessmentsResponse.items.map(item => 
          adminService.formatAssessmentFromAPI(item)
        ));
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError(adminService.handleError(error, 'loading dashboard'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (assessment) => {
    if (assessment.IsComplete) {
      return <span className="status-badge completed">Completed</span>;
    }
    return <span className="status-badge incomplete">In progress</span>;
  };

  const getProgressPercentage = (currentPage) => {
    return Math.round((currentPage / 6) * 100);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={loadDashboardData}>
          <i className="fas fa-sync-alt"></i> Try Again
        </button>
      </div>
    );
  }
const formatMinutesToTime = (decimalMinutes) => {
  if (!decimalMinutes || decimalMinutes === 0) return '0min 0sec';
  
  const minutes = Math.floor(decimalMinutes);
  const seconds = Math.round((decimalMinutes - minutes) * 60);
  
  return `${minutes}:${seconds}`;
};
  const { kpis, topData, chartSummary } = dashboardData;


  // Extract EV charger data from chart summary
  const getEvChargerCounts = () => {
    if (chartSummary?.evChargerDistribution?.data && chartSummary.evChargerDistribution.data.length >= 3) {
      // Assuming the order is: ['Already Have', 'Want to Buy', "Don't Want"]
      return {
        alreadyHave: chartSummary.evChargerDistribution.data[0] || 0,
        wantToBuy: chartSummary.evChargerDistribution.data[1] || 0,
        dontWant: chartSummary.evChargerDistribution.data[2] || 0
      };
    }
    return { alreadyHave: 0, wantToBuy: 0, dontWant: 0 };
  };

  const evChargerCounts = getEvChargerCounts();

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" onClick={loadDashboardData}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="main-content-grid">
        {/* Left Side - KPI Cards */}
        <div className="kpi-section">
          <div className="kpi-cards">
            {/* Top Row - Total Assessments and Average Time */}
            <div className="kpi-card total">
              <div className="kpi-icon">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <div className="kpi-content">
                <h3>{kpis.totalAssessments || 0}</h3>
                <p>Total Assessments</p>
                <small>All time assessments</small>
              </div>
            </div>
            
         <div className="kpi-card time">
  <div className="kpi-icon">
    <i className="fas fa-stopwatch"></i>
  </div>
  <div className="kpi-content">
    <h3>{formatMinutesToTime(kpis.averageCompletionTime)}</h3>
    <p>Avg. Time</p>
    <small>Completion time (min:sec)</small>
  </div>
</div>
            
            {/* Middle Row - Completed and In Progress */}
            <div className="kpi-card completed">
              <div className="kpi-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="kpi-content">
                <h3>{kpis.completedAssessments || 0}</h3>
                <p>Completed</p>
                <small>{kpis.completionRate?.toFixed(1) || 0}% success rate</small>
              </div>
            </div>
            
            <div className="kpi-card incomplete">
              <div className="kpi-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="kpi-content">
                <h3>{kpis.incompleteAssessments || 0}</h3>
                <p>In Progress</p>
                <small>Currently active</small>
              </div>
            </div>

            {/* Bottom Row - New EV Charger Cards */}
            <div className="kpi-card want-charger">
              <div className="kpi-icon">
                <i className="fas fa-shopping-cart"></i>
              </div>
              <div className="kpi-content">
                <h3>{evChargerCounts.wantToBuy}</h3>
                <p>Want to Buy</p>
                <small>Planning to purchase</small>
              </div>
            </div>
            
            <div className="kpi-card have-charger">
              <div className="kpi-icon">
                <i className="fas fa-charging-station"></i>
              </div>
              <div className="kpi-content">
                <h3>{evChargerCounts.alreadyHave}</h3>
                <p>Already Have</p>
                <small>Currently installed</small>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Charts Grid */}
        <div className="chart-section">
          {/* Top Row - 2 Pie Charts */}
          <div className="charts-top-row">
            {/* First Pie Chart */}
            <div className="chart-card pie-chart">
              <div className="chart-header">
                <h3>Assessment Status</h3>
              </div>
              <div className="chart-content pie-content">
                {chartSummary.statusDistribution && (
                  <Doughnut
                    data={{
                      labels: ['Completed', 'In Progress'],
                      datasets: [{
                        data: [
                          kpis.completedAssessments || 0,
                          kpis.incompleteAssessments || 0
                        ],
                        backgroundColor: ['#22c55e', '#f59e0b'],
                        borderWidth: 3,
                        borderColor: '#ffffff'
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { 
                          position: 'bottom',
                          labels: { 
                            padding: 15,
                            font: {
                              size: 12,
                              weight: 500
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = total > 0 ? ((context.parsed * 100) / total).toFixed(1) : 0;
                              return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* Second Pie Chart - EV Charger Distribution */}
            <div className="chart-card pie-chart">
              <div className="chart-header">
                <h3>EV Charger Status</h3>
              </div>
              <div className="chart-content pie-content">
                {chartSummary?.evChargerDistribution?.data && chartSummary.evChargerDistribution.data.length > 0 ? (
                  <Doughnut
                    data={{
                      labels: ['Already Have', 'Want to Buy', "Don't Want"],
                      datasets: [{
                        data: chartSummary.evChargerDistribution.data,
                        backgroundColor: ['#22c55e', '#3b82f6', '#ef4444'],
                        borderWidth: 3,
                        borderColor: '#ffffff'
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { 
                          position: 'bottom',
                          labels: { 
                            padding: 15,
                            font: {
                              size: 12,
                              weight: 500
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = total > 0 ? ((context.parsed * 100) / total).toFixed(1) : 0;
                              return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <p className="no-data">No EV charger data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row - Assessment Flow Chart */}
          <div className="charts-bottom-row">
            <div className="chart-card flow-chart">
              <div className="chart-header">
                <h3>Assessment Flow</h3>
                <span className="chart-separator"> -  step where users dropped off</span>
              </div>
              <div className="chart-content flow-content">
                {chartSummary.dropOffBreakdown && (
                  <Bar
                    data={{
                      labels: chartSummary.dropOffBreakdown.map(p => p.pageName || `Step ${p.page}`),
                      datasets: [{
                        label: 'Users',
                        data: chartSummary.dropOffBreakdown.map(p => p.count),
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                        borderRadius: 6
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            afterLabel: function(context) {
                              const total = context.dataset.data[0]; // First step should be highest
                              const dropOff = total > 0 ? ((total - context.parsed) / total * 100).toFixed(1) : 0;
                              return `Drop-off: ${dropOff}%`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: { 
                          beginAtZero: true,
                          grid: { color: 'rgba(0,0,0,0.1)' }
                        },
                        x: {
                          grid: { display: false }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Overview Section */}
      <div className="overview-section">
        <div className="overview-grid">
          {/* Top Cities */}
          <div className="overview-card">
            <div className="card-header">
              <h3>Top Cities</h3>
              <span className="card-badge">{topData.topCities?.length || 0} cities</span>
            </div>
            <div className="top-list">
              {topData.topCities?.slice(0, 5).map((city, index) => (
                <div key={index} className="top-item">
                  <span className="rank">#{index + 1}</span>
                  <div className="item-info">
                    <span className="name">{city.city}</span>
                    <span className="details">{city.count} assessments</span>
                  </div>
                  <span className="percentage">{city.percentage?.toFixed(1) || 0}%</span>
                </div>
              )) || <p className="no-data">No data available</p>}
            </div>
          </div>

          {/* Top Vehicle Brands */}
          <div className="overview-card">
            <div className="card-header">
              <h3>Top Vehicle Brands</h3>
              <span className="card-badge">{topData.topVehicleBrands?.length || 0} brands</span>
            </div>
            <div className="top-list">
              {topData.topVehicleBrands?.slice(0, 5).map((brand, index) => (
                <div key={index} className="top-item">
                  <span className="rank">#{index + 1}</span>
                  <div className="item-info">
                    <span className="name">{brand.brand}</span>
                    <span className="details">{brand.count} vehicles</span>
                  </div>
                  <span className="percentage">{brand.percentage?.toFixed(1) || 0}%</span>
                </div>
              )) || <p className="no-data">No data available</p>}
            </div>
          </div>

          {/* Top EV Charger Brands (Want to Buy) */}
          <div className="overview-card">
            <div className="card-header">
              <h3>Wanted Chargers</h3>
              <span className="card-badge">{topData.topEvChargerBrands?.length || 0} brands</span>
            </div>
            <div className="top-list">
              {(topData.topEvChargerBrands && topData.topEvChargerBrands.length > 0) ? 
                topData.topEvChargerBrands.slice(0, 5).map((brand, index) => (
                  <div key={index} className="top-item">
                    <span className="rank">#{index + 1}</span>
                    <div className="item-info">
                      <span className="name">{brand.name}</span>
                      <span className="details">{brand.count} wanted</span>
                    </div>
                    <span className="percentage">{brand.percentage?.toFixed(1) || 0}%</span>
                  </div>
                )) : <p className="no-data">Backend missing topEvChargerBrands data</p>}
            </div>
          </div>

          {/* Top Existing EV Charger Brands */}
          <div className="overview-card">
            <div className="card-header">
              <h3>Existing Chargers</h3>
              <span className="card-badge">{topData.topExistingEvChargerBrands?.length || 0} brands</span>
            </div>
            <div className="top-list">
              {(topData.topExistingEvChargerBrands && topData.topExistingEvChargerBrands.length > 0) ? 
                topData.topExistingEvChargerBrands.slice(0, 5).map((brand, index) => (
                  <div key={index} className="top-item">
                    <span className="rank">#{index + 1}</span>
                    <div className="item-info">
                      <span className="name">{brand.name}</span>
                      <span className="details">{brand.count} installed</span>
                    </div>
                    <span className="percentage">{brand.percentage?.toFixed(1) || 0}%</span>
                  </div>
                )) : <p className="no-data">Backend missing topExistingEvChargerBrands data</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions">
          <a href="/admin/assessments" className="quick-action">
            <i className="fas fa-list"></i>
            <span>View All Assessments</span>
          </a>
          <a href="/admin/assessments?status=incomplete" className="quick-action">
            <i className="fas fa-clock"></i>
            <span>Incomplete Assessments</span>
          </a>
          <a href="/admin/users" className="quick-action">
            <i className="fas fa-users"></i>
            <span>Manage Users</span>
          </a>
          <a href="/admin/reports" className="quick-action">
            <i className="fas fa-chart-bar"></i>
            <span>Generate Reports</span>
          </a>
          <a href="/admin/export" className="quick-action">
            <i className="fas fa-download"></i>
            <span>Export Data</span>
          </a>
          <a href="/admin/settings" className="quick-action">
            <i className="fas fa-cog"></i>
            <span>System Settings</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;