import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Operations } from './pages/Operations';
import { Crowd } from './pages/Crowd';
import { Transit } from './pages/Transit';
import { DataSources } from './pages/DataSources';
import { Reports } from './pages/Reports';
import { SettingsPage } from './pages/Settings';

/**
 * Core application component establishing client-side routing.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main dashboard routing structure inside Layout wrapper */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="operations" element={<Operations />} />
          <Route path="crowd" element={<Crowd />} />
          <Route path="transport" element={<Transit />} />
          <Route path="data-sources" element={<DataSources />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<SettingsPage />} />
          
          {/* Fallback routing to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
