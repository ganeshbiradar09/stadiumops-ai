import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { recommendationEngine } from '../utils/recommendationEngine';
import { Users, ShieldAlert, Eye, Flame, Shield } from 'lucide-react';

export const Crowd = () => {
  const [activeSnapshot, setActiveSnapshot] = useState(null);
  const [zones, setZones] = useState([]);

  const loadSnapshotData = () => {
    const snapshot = recommendationEngine.getActiveSnapshot();
    if (snapshot) {
      setActiveSnapshot(snapshot);
      // Map gates to crowd sectors dynamically
      setZones(snapshot.gates.map((g, idx) => {
        let density = "Low";
        if (g.occupancy >= 90) density = "Critical";
        else if (g.occupancy >= 75) density = "High";
        else if (g.occupancy >= 45) density = "Moderate";

        let risk = "Low";
        if (g.queueTime >= 25) risk = "Critical";
        else if (g.queueTime >= 15) risk = "Medium";

        return {
          name: `Sector ${idx + 1} - ${g.name.split(' (')[0]} Concourse`,
          occupancy: g.occupancy,
          density,
          risk,
          dispatchers: Math.round(g.staff * 0.4)
        };
      }));
    }
  };

  useEffect(() => {
    loadSnapshotData();
    window.addEventListener('stadiumops-telemetry-update', loadSnapshotData);
    return () => window.removeEventListener('stadiumops-telemetry-update', loadSnapshotData);
  }, []);

  const totalPatrols = zones.reduce((sum, z) => sum + z.dispatchers, 0);

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-500" />
          <span>Crowd Intelligence Command</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Analyzing spectator distribution patterns, blockages, and safety density indices.</p>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card hover className="p-4 bg-slate-900/40">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Crowd Heat Index</span>
          <div className="text-xl font-black text-slate-100 font-mono mt-1">
            {activeSnapshot ? activeSnapshot.crowdDensityLevel : 'Moderate'}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Overall density rating</p>
        </Card>
        <Card hover className="p-4 bg-slate-900/40">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active incident logs</span>
          <div className="text-xl font-black text-rose-400 font-mono mt-1">
            {activeSnapshot ? activeSnapshot.incidents.length : 0} Override Flags
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Telemetry bypass overrides</p>
        </Card>
        <Card hover className="p-4 bg-slate-900/40">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Patrol Teams Dispatched</span>
          <div className="text-xl font-black text-slate-100 font-mono mt-1">{totalPatrols} Officers</div>
          <p className="text-[10px] text-slate-400 mt-1">Across active perimeter grids</p>
        </Card>
        <Card hover className="p-4 bg-slate-900/40">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Peak queue wait</span>
          <div className="text-xl font-black text-blue-400 font-mono mt-1">
            {activeSnapshot ? activeSnapshot.maxQueueTime : 0} mins max
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Egress simulation forecast</p>
        </Card>
      </div>

      {/* Grid view of zones */}
      <Card title="Sector Heatmap Details" subtitle="Telemetry readings from overhead perimeter optical scanners">
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Zone Description</th>
                <th className="py-3 px-4">Occupancy</th>
                <th className="py-3 px-4">Density Level</th>
                <th className="py-3 px-4">Safety Risk</th>
                <th className="py-3 px-4">Staff Count</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {zones.map((zone, idx) => {
                const isCritical = zone.occupancy >= 90;
                const isModerate = zone.occupancy >= 50;
                
                return (
                  <tr key={idx} className="hover:bg-slate-900/20 text-slate-300">
                    <td className="py-3 px-4 font-bold text-slate-200">{zone.name}</td>
                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                          <div 
                            className={`h-full rounded-full ${isCritical ? 'bg-rose-500' : isModerate ? 'bg-amber-500' : 'bg-blue-500'}`} 
                            style={{ width: `${zone.occupancy}%` }}
                          ></div>
                        </div>
                        <span>{zone.occupancy}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={zone.density === 'Critical' ? 'danger' : zone.density === 'High' ? 'warning' : 'slate'}>
                        {zone.density}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={zone.risk === 'Critical' ? 'danger' : zone.risk === 'Medium' ? 'warning' : 'slate'}>{zone.risk} Risk</Badge>
                    </td>
                    <td className="py-3 px-4 font-mono">{zone.dispatchers} marshals</td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => alert(`Deploying additional patrols to ${zone.name}`)}
                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wide"
                      >
                        Deploy Patrol
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default Crowd;
