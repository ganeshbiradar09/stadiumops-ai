import React, { useState, useEffect } from 'react';
import { Terminal, ChevronUp, ChevronDown, Activity, Cpu, Database, Network } from 'lucide-react';
import { isAiMode } from '../../../services/geminiService';

export const DiagnosticsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Initial load
    const raw = localStorage.getItem('stadiumops_diagnostics');
    if (raw) {
      try {
        setMetrics(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to parse diagnostics", e);
      }
    }

    const handleUpdate = (e) => {
      setMetrics(e.detail);
    };

    window.addEventListener('stadiumops-diagnostics-update', handleUpdate);
    return () => window.removeEventListener('stadiumops-diagnostics-update', handleUpdate);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Expandable Panel */}
      {isOpen && (
        <div className="mb-2 w-80 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl overflow-hidden font-mono text-[10px] animate-fade-in origin-bottom-right transition-all duration-200">
          <div className="p-2.5 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Terminal className="h-3 w-3 text-emerald-400" />
              Dev Diagnostics
            </span>
            <span className="text-[9px] text-slate-500">v4.1.10 (Prod)</span>
          </div>
          
          <div className="p-3 space-y-3">
            {/* AI Metrics */}
            <div className="space-y-1.5">
              <div className="text-emerald-500 font-bold mb-1 border-b border-slate-800 pb-1 flex justify-between">
                <span className="flex items-center gap-1"><Cpu className="h-3 w-3"/> AI Pipeline</span>
                <span className={isAiMode ? "text-emerald-400" : "text-amber-400"}>{isAiMode ? 'LIVE' : 'SIMULATION'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Model:</span>
                <span className="text-slate-300">{metrics?.modelName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Prompt:</span>
                <span className="text-slate-300">{metrics?.promptVersion || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Latency:</span>
                <span className="text-emerald-400 font-bold">{metrics?.aiLatency ? `${metrics.aiLatency.toFixed(0)}ms` : '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Parser:</span>
                <span className={metrics?.parseStatus?.includes('Failed') ? 'text-rose-400' : 'text-emerald-400'}>{metrics?.parseStatus || 'Awaiting'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Max Confidence:</span>
                <span className="text-blue-400 font-bold">{metrics?.predictionConfidence ? `${metrics.predictionConfidence}%` : '---'}</span>
              </div>
            </div>

            {/* Telemetry Metrics */}
            <div className="space-y-1.5 pt-2">
              <div className="text-blue-500 font-bold mb-1 border-b border-slate-800 pb-1 flex items-center gap-1">
                <Activity className="h-3 w-3"/> Telemetry Engine
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Processing Time:</span>
                <span className="text-blue-400 font-bold">{metrics?.telemetryProcessingTime ? `${metrics.telemetryProcessingTime.toFixed(1)}ms` : '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Snapshot Buffer:</span>
                <span className="text-slate-300">30 ticks (Rolling)</span>
              </div>
            </div>

            {/* System Status */}
            <div className="space-y-1.5 pt-2">
              <div className="text-slate-400 font-bold mb-1 border-b border-slate-800 pb-1 flex items-center gap-1">
                <Network className="h-3 w-3"/> System
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Theme:</span>
                <span className="text-slate-300">Dark Mode (Strict)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Update:</span>
                <span className="text-slate-300 truncate w-32 text-right">
                  {metrics?.lastUpdate ? new Date(metrics.lastUpdate).toLocaleTimeString() : '---'}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 p-2 rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-700 flex items-center justify-center gap-2"
        aria-label="Toggle Developer Diagnostics"
      >
        <Database className="h-4 w-4" />
        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
      </button>
    </div>
  );
};
