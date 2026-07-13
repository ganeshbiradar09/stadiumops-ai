import React from 'react';

/**
 * Premium glassmorphism container card for the dashboard command-center.
 */
export const Card = ({ children, title, subtitle, className = '', headerAction, hover = false }) => {
  return (
    <div 
      className={`
        bg-slate-900/50 backdrop-blur-md 
        border border-slate-800/80 rounded-xl p-5 
        shadow-lg shadow-slate-950/20 
        transition-all duration-300 ease-out
        ${hover ? 'hover:border-blue-500/30 hover:shadow-blue-500/5 hover:-translate-y-0.5' : ''}
        ${className}
      `}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex justify-between items-start mb-4 gap-4">
          <div>
            {title && <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div className="text-xs">{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
