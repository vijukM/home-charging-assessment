// src/routes/AdminRoutes.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import admin komponenti
import AdminDashboard from '../components/Admin/AdminDashboard';
import AllAssessments from '../components/Admin/AllAssessments';
import AllUsers from '../components/Admin/AllUsers';

import {
  ActiveUsers,
  RecentSignups,
  CompletionRates,
  DropOffAnalysis,
  GenerateReports,
  AdminManagement,
  DatabaseManagement,
  SystemLogs
} from '../components/Admin/AdminPlaceholders';

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path="dashboard" element={<AdminDashboard />} />
      
      {/* Assessment Management */}
      <Route path="assessments">
        <Route path="all" element={<AllAssessments />} />
        <Route index element={<Navigate to="all" replace />} />
      </Route>

      {/* users Management */}
      <Route path="users">
        <Route path="all" element={<AllUsers />} />
        <Route path="active" element={<ActiveUsers />} />
        <Route path="recent" element={<RecentSignups />} />
        <Route index element={<Navigate to="all" replace />} />
      </Route>

      {/* Analytics */}
      <Route path="analytics">
        <Route path="completion-rates" element={<CompletionRates />} />
        <Route path="drop-off" element={<DropOffAnalysis />} />
        <Route path="reports" element={<GenerateReports />} />
        <Route index element={<Navigate to="completion-rates" replace />} />
      </Route>

      {/* System Management */}
      <Route path="system">
        <Route path="admins" element={<AdminManagement />} />
        <Route path="database" element={<DatabaseManagement />} />
        <Route path="logs" element={<SystemLogs />} />
        <Route index element={<Navigate to="admins" replace />} />
      </Route>

      {/* Default redirect to dashboard */}
      <Route index element={<Navigate to="dashboard" replace />} />
      
      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;