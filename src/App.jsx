import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Operations = lazy(() => import('./pages/Operations').then(module => ({ default: module.Operations })));
const Crowd = lazy(() => import('./pages/Crowd').then(module => ({ default: module.Crowd })));
const Transit = lazy(() => import('./pages/Transit').then(module => ({ default: module.Transit })));
const DataSources = lazy(() => import('./pages/DataSources').then(module => ({ default: module.DataSources })));
const Reports = lazy(() => import('./pages/Reports').then(module => ({ default: module.Reports })));
const SettingsPage = lazy(() => import('./pages/Settings').then(module => ({ default: module.SettingsPage })));

/**
 * Core application component establishing client-side routing.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main dashboard routing structure inside Layout wrapper */}
        <Route path="/" element={<Layout />}>
          <Route index element={
            <Suspense fallback={<div className="h-96 flex flex-col items-center justify-center gap-3"><div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" aria-busy="true" role="progressbar"></div><span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Dashboard...</span></div>}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="operations" element={
            <Suspense fallback={<div className="h-96 flex flex-col items-center justify-center gap-3"><div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" aria-busy="true" role="progressbar"></div><span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Operations...</span></div>}>
              <Operations />
            </Suspense>
          } />
          <Route path="crowd" element={
            <Suspense fallback={<div className="h-96 flex flex-col items-center justify-center gap-3"><div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" aria-busy="true" role="progressbar"></div><span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Crowd...</span></div>}>
              <Crowd />
            </Suspense>
          } />
          <Route path="transport" element={
            <Suspense fallback={<div className="h-96 flex flex-col items-center justify-center gap-3"><div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" aria-busy="true" role="progressbar"></div><span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Transport...</span></div>}>
              <Transit />
            </Suspense>
          } />
          <Route path="data-sources" element={
            <Suspense fallback={<div className="h-96 flex flex-col items-center justify-center gap-3"><div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" aria-busy="true" role="progressbar"></div><span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Data...</span></div>}>
              <DataSources />
            </Suspense>
          } />
          <Route path="reports" element={
            <Suspense fallback={<div className="h-96 flex flex-col items-center justify-center gap-3"><div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" aria-busy="true" role="progressbar"></div><span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Reports...</span></div>}>
              <Reports />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<div className="h-96 flex flex-col items-center justify-center gap-3"><div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" aria-busy="true" role="progressbar"></div><span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Settings...</span></div>}>
              <SettingsPage />
            </Suspense>
          } />
          
          {/* Fallback routing to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
