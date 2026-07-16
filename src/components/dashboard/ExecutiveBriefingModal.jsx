import React, { useEffect, useRef } from 'react';
import { 
  BrainCircuit, 
  X,
  Clock,
  Users,
  CloudSun,
  ShieldAlert,
  Car
} from 'lucide-react';
import { Button } from '../common/Button';

export const ExecutiveBriefingModal = ({ activeSnapshot, explainRec, onClose }) => {
  const lastActiveElement = useRef(null);

  useEffect(() => {
    if (explainRec) {
      lastActiveElement.current = document.activeElement;
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        if (lastActiveElement.current) {
          lastActiveElement.current.focus();
        }
      };
    }
  }, [explainRec, onClose]);

  if (!activeSnapshot || !explainRec) return null;

  // Compute triggering telemetry variables for the redesigned Explain Decision Executive Briefing
  const targetGateName = activeSnapshot && explainRec
    ? (activeSnapshot.gates.find(g => 
        explainRec.title.includes(g.name.split(' (')[0]) || 
        explainRec.description.includes(g.name.split(' (')[0])
      )?.name || null)
    : null;
  const targetGate = targetGateName ? activeSnapshot.gates.find(g => g.name === targetGateName) : null;
  
  const totalCapacity = activeSnapshot.gates.reduce((sum, g) => sum + g.capacity, 0);
  const totalOccupancy = Math.round(activeSnapshot.gates.reduce((sum, g) => sum + (g.capacity * (g.occupancy / 100)), 0));
  const occupancyPercentage = Math.round((totalOccupancy / totalCapacity) * 100);

  const queueVal = targetGate ? targetGate.queueTime : activeSnapshot.maxQueueTime;
  const queueLabel = targetGate ? `${targetGate.name.split(' (')[0]} Queue` : 'Max Queue Wait';
  let queueSeverity = 'normal';
  if (queueVal > 25) queueSeverity = 'critical';
  else if (queueVal > 15) queueSeverity = 'warning';

  const occVal = targetGate ? targetGate.occupancy : occupancyPercentage;
  const occLabel = targetGate ? `${targetGate.name.split(' (')[0]} Load` : 'Average Stadium Load';
  let occSeverity = 'normal';
  if (occVal > 90) occSeverity = 'critical';
  else if (occVal > 75) occSeverity = 'warning';

  const weatherVal = activeSnapshot.context.weather;
  let weatherSeverity = 'normal';
  if (weatherVal === 'Heavy Rain') weatherSeverity = 'critical';
  else if (weatherVal !== 'Clear' && weatherVal !== 'Unknown') weatherSeverity = 'warning';

  let incidentTextVal = 'None';
  let incidentSeverity = 'normal';
  if (targetGate) {
    const gateInc = activeSnapshot.incidents.find(i => i.gate.includes(targetGate.name.split(' ')[0]));
    if (gateInc) {
      incidentTextVal = gateInc.description;
      incidentSeverity = (gateInc.description.toLowerCase().includes('outage') || gateInc.description.toLowerCase().includes('validator')) ? 'critical' : 'warning';
    }
  } else if (activeSnapshot.incidents.length > 0) {
    incidentTextVal = activeSnapshot.incidents.map(i => i.description).join(', ');
    incidentSeverity = 'warning';
  }

  const transitVal = activeSnapshot.context.transitDelay;
  let transitSeverity = 'normal';
  if (transitVal > 20) transitSeverity = 'critical';
  else if (transitVal > 5) transitSeverity = 'warning';

  const parkingVal = activeSnapshot.context.parkingOccupancy;
  let parkingSeverity = 'normal';
  if (parkingVal > 90) parkingSeverity = 'critical';
  else if (parkingVal > 80) parkingSeverity = 'warning';

  const renderSeverityCard = (icon, label, value, severity) => {
    const severityClasses = {
      critical: 'border-rose-500/30 bg-rose-500/5 text-rose-300',
      warning: 'border-amber-500/30 bg-amber-500/5 text-amber-300',
      normal: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300'
    };

    const statusBadge = {
      critical: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      normal: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    };

    return (
      <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${severityClasses[severity]}`}>
        <div className="flex items-center gap-1.5 mb-1.5 opacity-80">
          {icon}
          <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-sm font-black font-mono tracking-tight">{value}</span>
          <span className={`text-[7px] font-bold uppercase px-1.5 py-0.5 rounded ${statusBadge[severity]}`}>
            {severity.toUpperCase()}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-5 animate-scale-up max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">
              <BrainCircuit className="h-4 w-4" />
              <span>Executive Decision Support briefing</span>
            </div>
            <h3 id="modal-title" className="text-base font-extrabold text-slate-100 mt-1 leading-snug">
              {explainRec.title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label="Close executive briefing modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* AI Summary and Confidence Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {/* Confidence badge card */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-md">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Confidence Score
            </span>
            <div className="text-3xl font-black text-blue-400 font-mono">
              {explainRec.confidence}%
            </div>
            <span className="text-[8px] text-slate-400 font-bold uppercase mt-2 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
              Trust Rated
            </span>
          </div>

          {/* Rationale summary */}
          <div className="md:col-span-2 bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                AI Summary
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold italic">
                "{explainRec.reasoning}"
              </p>
            </div>
            <div className="flex gap-4 text-[9px] font-mono text-slate-400 border-t border-slate-900/60 pt-2 mt-2">
              <span>Model: <span className="text-slate-400">{explainRec.modelName}</span></span>
              <span>Version: <span className="text-slate-400">v{explainRec.promptVersion}</span></span>
            </div>
          </div>
        </div>

        {/* Triggered telemetry cards grid */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Triggered Telemetry Signals
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {renderSeverityCard(<Clock className="h-3.5 w-3.5 text-slate-400" />, queueLabel, `${queueVal} mins`, queueSeverity)}
            {renderSeverityCard(<Users className="h-3.5 w-3.5 text-slate-400" />, occLabel, `${occVal}%`, occSeverity)}
            {renderSeverityCard(<CloudSun className="h-3.5 w-3.5 text-slate-400" />, 'Weather State', weatherVal, weatherSeverity)}
            {renderSeverityCard(<ShieldAlert className="h-3.5 w-3.5 text-slate-400" />, 'Override Alert', incidentTextVal, incidentSeverity)}
            {renderSeverityCard(<Car className="h-3.5 w-3.5 text-slate-400" />, 'Transit Delay', `${transitVal} mins`, transitSeverity)}
            {renderSeverityCard(<Car className="h-3.5 w-3.5 text-slate-400" />, 'Parking Fill', `${parkingVal}%`, parkingSeverity)}
          </div>
        </div>

        {/* Operational Directive (The recommended action) */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Operational Recommendation
          </span>
          <p className="text-xs text-slate-100 font-extrabold leading-relaxed">
            {explainRec.recommended_action}
          </p>
        </div>

        {/* Safety Risks if Ignored */}
        <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start gap-2.5">
          <ShieldAlert className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-400 block text-[10px] uppercase">Safety Risk if Ignored:</span>
            <p className="mt-0.5 text-xs text-slate-300 leading-normal font-semibold">{explainRec.risk_if_ignored}</p>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Dismiss Briefing
          </Button>
        </div>
      </div>
    </div>
  );
};
