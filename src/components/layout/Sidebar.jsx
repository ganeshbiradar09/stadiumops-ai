import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  Users, 
  Bus, 
  Database, 
  FileText, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

/**
 * Collapsible left navigation bar for the StadiumOps AI platform.
 */
export const Sidebar = ({ collapsed, setCollapsed }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Operations', path: '/operations', icon: Activity },
    { name: 'Crowd Intelligence', path: '/crowd', icon: Users },
    { name: 'Transportation', path: '/transport', icon: Bus },
    { name: 'Data Sources', path: '/data-sources', icon: Database },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside 
      className={`
        fixed top-0 left-0 h-screen z-30 
        bg-slate-900 border-r border-slate-800/80 
        flex flex-col transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Brand Logo Header */}
      <div className={`p-5 flex items-center h-20 border-b border-slate-800/60 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-blue-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-wider text-slate-100 uppercase">StadiumOps</span>
              <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">AI Command</span>
            </div>
          </div>
        ) : (
          <ShieldCheck className="h-7 w-7 text-blue-500" />
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                }
                ${collapsed ? 'justify-center' : 'gap-4'}
              `}
              title={collapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {!collapsed && (
                <span className="truncate tracking-wide">{item.name}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle Footer Button */}
      <div className="p-4 border-t border-slate-800/60 flex justify-center">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none border border-slate-700/50"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <div className="flex items-center gap-2 px-1">
              <ChevronLeft className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Minimize</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
