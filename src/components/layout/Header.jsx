import React, { useState, useEffect } from 'react';
import { stadiumMetadata } from '../../data/mockStadiumData';
import { Bell, Clock, MapPin, Wifi, ShieldAlert } from 'lucide-react';
import { Badge } from '../common/Badge';
import { recommendationEngine } from '../../utils/recommendationEngine';

/**
 * Top navigation bar containing match telemetry, current time, and network indicators.
 */
export const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateAlerts = () => {
      const snap = recommendationEngine.getActiveSnapshot();
      if (snap) {
        const alerts = [];
        // Add incidents alerts
        snap.incidents.forEach((inc, idx) => {
          alerts.push({ 
            id: `inc-${idx}`, 
            text: `${inc.gate}: ${inc.incident}`, 
            type: 'error' 
          });
        });
        // Add gate wait time warnings
        snap.gates.forEach((g) => {
          if (g.queueLength > 20) {
            alerts.push({ 
              id: `queue-${g.gate}`, 
              text: `${g.gate}: Heavy congestion wait times at ${g.queueLength} mins`, 
              type: 'warning' 
            });
          }
        });
        // Fallback if clean
        if (alerts.length === 0) {
          alerts.push({ 
            id: 'clean', 
            text: 'All perimeter entry gates operating within optimal parameters.', 
            type: 'info' 
          });
        }
        setActiveAlerts(alerts);
      }
    };

    updateAlerts();
    window.addEventListener('stadiumops-telemetry-update', updateAlerts);
    return () => window.removeEventListener('stadiumops-telemetry-update', updateAlerts);
  }, []);

  const formatSystemTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatSystemDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const hasLiveAlerts = activeAlerts.length > 0 && activeAlerts[0].id !== 'clean';

  return (
    <header className="h-20 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Left side: Venue details and status */}
      <div className="flex items-center gap-6">
        <div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">{stadiumMetadata.name}</span>
          </div>
          <h1 className="text-lg font-bold text-slate-100 mt-0.5 leading-none">Command & Control</h1>
        </div>

        {/* Live Match Telemetry Ribbon */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-lg px-4 py-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="font-bold text-slate-300 uppercase tracking-wide">{stadiumMetadata.currentMatch.stage}:</span>
          </div>
          <span className="font-bold text-blue-400">{stadiumMetadata.currentMatch.teams}</span>
          <span className="text-slate-600">|</span>
          <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400 font-semibold">{stadiumMetadata.currentMatch.score}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-medium">{stadiumMetadata.currentMatch.timeRemaining}</span>
        </div>
      </div>

      {/* Right side: Operations Telemetry, System Clock, Notifications */}
      <div className="flex items-center gap-6">
        {/* Network & Safety Status */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <Wifi className="h-4 w-4 text-emerald-400" />
            <span>Telemetries Live</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            <span>Alert Log: <Badge variant={hasLiveAlerts ? 'danger' : 'success'} className="ml-1">{hasLiveAlerts ? `${activeAlerts.length} Active` : 'Clear'}</Badge></span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

        {/* System Clock */}
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="h-4 w-4 text-blue-500" />
          <div className="text-right">
            <div className="font-mono text-sm font-semibold tracking-wide leading-none">{formatSystemTime(currentTime)}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 tracking-wider uppercase font-semibold">{formatSystemDate(currentTime)}</div>
          </div>
        </div>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60 focus:outline-none"
            aria-label="Alert notifications"
          >
            <Bell className="h-5 w-5" />
            {hasLiveAlerts && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-slate-800 animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <>
              {/* Overlay background to dismiss when clicking outside */}
              <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)}></div>
              
              <div className="absolute right-0 mt-2.5 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-40 animate-scale-up">
                <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live System Alerts</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    hasLiveAlerts ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {hasLiveAlerts ? `${activeAlerts.length} Active` : 'All Clear'}
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60">
                  {activeAlerts.map((alert) => (
                    <div key={alert.id} className="p-3 hover:bg-slate-800/30 transition-colors flex gap-2.5 items-start">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 mt-1.5 ${
                        alert.type === 'error' ? 'bg-rose-500' : alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-400'
                      }`}></span>
                      <p className="text-xs text-slate-300 leading-snug font-semibold">{alert.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
