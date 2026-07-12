import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

/**
 * Global layout template coordinating the collapsible navigation sidebar, 
 * top telemetry header, and viewport spacing for nested pages.
 */
export const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Collapsible Left Navigation Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Primary Application Workspace */}
      <div 
        className={`
          flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
          ${collapsed ? 'pl-20' : 'pl-64'}
        `}
      >
        {/* Top telemetry control header */}
        <Header />

        {/* Dynamic page content container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <Outlet />
          </div>
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-4 px-8 text-center text-xs text-slate-600 font-semibold tracking-wider uppercase">
          &copy; 2026 FIFA World Cup™ Stadium Operations Command Center. Fictional Mock Environment.
        </footer>
      </div>
    </div>
  );
};
export default Layout;
