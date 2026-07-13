import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { recommendationEngine } from '../utils/recommendationEngine';
import { ShieldCheck, ShieldAlert, Users, Activity, Settings2, Sliders } from 'lucide-react';

export const Operations = () => {
  const [gates, setGates] = useState([]);
  const [activeSnapshot, setActiveSnapshot] = useState(null);

  const loadSnapshotData = () => {
    const snapshot = recommendationEngine.getActiveSnapshot();
    if (snapshot) {
      setActiveSnapshot(snapshot);
      setGates(snapshot.gates);
    }
  };

  useEffect(() => {
    // Initial load
    loadSnapshotData();
    
    // Listen for streaming updates
    window.addEventListener('stadiumops-telemetry-update', loadSnapshotData);
    return () => window.removeEventListener('stadiumops-telemetry-update', loadSnapshotData);
  }, []);

  const toggleGateStatus = (gateId) => {
    if (!activeSnapshot) return;
    const updatedGates = gates.map(gate => {
      if (gate.gateId === gateId) {
        const nextStatus = gate.status === 'Open' ? 'Restricted' : gate.status === 'Restricted' ? 'Closed' : 'Open';
        return { ...gate, status: nextStatus };
      }
      return gate;
    });

    const nextSnapshot = { ...activeSnapshot, gates: updatedGates };
    localStorage.setItem('stadiumops_active_snapshot', JSON.stringify(nextSnapshot));
    setGates(updatedGates);
    
    // Dispatch telemetry update
    window.dispatchEvent(new CustomEvent('stadiumops-telemetry-update'));
  };

  const totalEntryFlow = gates.reduce((sum, g) => sum + (g.queueTime * 5 + 30), 0);
  const avgSecurityTime = activeSnapshot ? Math.round(activeSnapshot.averageQueueTime * 0.2 * 10) / 10 : 2.4;

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
          <Activity className="h-6 w-6 text-blue-500" />
          <span>Access Point Control Deck</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Supervising security lanes, turnstiles, and entry rates for all perimeter gates.</p>
      </div>

      {/* Grid of Gate Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {gates.map((gate) => {
          const isWarning = gate.queueTime >= 15;
          const isDanger = gate.queueTime >= 25;
          let statusVariant = 'success';
          if (gate.status === 'Restricted') statusVariant = 'warning';
          if (gate.status === 'Closed') statusVariant = 'danger';

          // Look for associated active incident in snapshot
          const activeIncident = activeSnapshot?.incidents?.find(inc => inc.gate.toLowerCase().includes(gate.name.toLowerCase().split(' ')[0].toLowerCase()));

          return (
            <Card 
              key={gate.gateId}
              title={gate.name}
              subtitle={`ID: ${gate.gateId.toUpperCase()}`}
              headerAction={
                <Badge variant={statusVariant}>{gate.status || 'Open'}</Badge>
              }
              hover
            >
              <div className="mt-4 space-y-4">
                {/* Metric grid */}
                <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Queue Wait Time</span>
                    <div className={`text-lg font-black font-mono mt-0.5 ${isDanger ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-slate-100'}`}>
                      {gate.queueTime} mins
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Staff</span>
                    <div className="text-lg font-black font-mono text-slate-100 mt-0.5">
                      {gate.staff} stewards
                    </div>
                  </div>
                </div>

                {/* Turnstile Load Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400 uppercase tracking-wide">Turnstile Occupancy</span>
                    <span className={gate.occupancy >= 80 ? 'text-amber-400' : 'text-slate-300'}>{gate.occupancy}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${gate.occupancy >= 90 ? 'bg-rose-500' : gate.occupancy >= 75 ? 'bg-amber-500' : 'bg-blue-500'}`} 
                      style={{ width: `${gate.occupancy}%` }}
                    ></div>
                  </div>
                </div>

                {/* Local Incident Banner */}
                {activeIncident && (
                  <div className="p-2.5 rounded bg-rose-500/5 border border-rose-500/10 text-[10px] text-rose-400 flex items-start gap-1.5 leading-relaxed font-semibold">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>Incident: {activeIncident.description}</span>
                  </div>
                )}

                {/* Operations Control Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-900/60">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-[11px] font-bold uppercase tracking-wide"
                    onClick={() => toggleGateStatus(gate.gateId)}
                    aria-label={`Cycle gate status for ${gate.name}`}
                  >
                    Cycle Status
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="text-[11px] font-bold"
                    onClick={() => alert(`Opening Configuration Manager for ${gate.name}`)}
                    aria-label={`Configure settings for ${gate.name}`}
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Global Diagnostics Card */}
      <Card title="Diagnostics Summary" subtitle="Access control network status">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
          <div className="flex gap-3 items-center bg-slate-950/40 p-4 rounded-xl border border-slate-900">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Network Nodes</span>
              <span className="text-sm font-bold text-slate-200">144 / 144 Online</span>
            </div>
          </div>
          <div className="flex gap-3 items-center bg-slate-950/40 p-4 rounded-xl border border-slate-900">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Entry Flow</span>
              <span className="text-sm font-bold text-slate-200">{Math.round(totalEntryFlow)} persons/min</span>
            </div>
          </div>
          <div className="flex gap-3 items-center bg-slate-950/40 p-4 rounded-xl border border-slate-900">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
              <Sliders className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Security Transit</span>
              <span className="text-sm font-bold text-slate-200">{avgSecurityTime} min duration</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
export default Operations;
