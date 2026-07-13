import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { recommendationEngine } from '../utils/recommendationEngine';
import { Bus, Train, ShieldAlert } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export const Transit = () => {
  const [, setActiveSnapshot] = useState(null);
  const [parkingOccupancy, setParkingOccupancy] = useState(86);
  const [transitDelay, setTransitDelay] = useState(0);

  const loadSnapshotData = () => {
    const snapshot = recommendationEngine.getActiveSnapshot();
    if (snapshot) {
      setActiveSnapshot(snapshot);
      setParkingOccupancy(snapshot.context.parkingOccupancy);
      setTransitDelay(snapshot.context.transitDelay);
    }
  };

  useEffect(() => {
    loadSnapshotData();
    window.addEventListener('stadiumops-telemetry-update', loadSnapshotData);
    return () => window.removeEventListener('stadiumops-telemetry-update', loadSnapshotData);
  }, []);

  // Compute parking stats dynamically relative to the snapshot fill percentage
  const totalSpots = 12000;

  const lots = [
    { name: "Lot A (VIP & Media)", capacity: 2000, occupied: Math.min(2000, Math.round(2000 * (parkingOccupancy / 100) * 1.1)) },
    { name: "Lot B (General West)", capacity: 4000, occupied: Math.min(4000, Math.round(4000 * (parkingOccupancy / 100) * 0.95)) },
    { name: "Lot C (General East)", capacity: 4000, occupied: Math.min(4000, Math.round(4000 * (parkingOccupancy / 100) * 0.9)) },
    { name: "Lot D (Shuttle & Rideshare)", capacity: 2000, occupied: Math.min(2000, Math.round(2000 * (parkingOccupancy / 100) * 1.05)) }
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
          <Bus className="h-6 w-6 text-blue-500" />
          <span>Transit & Parking Coordination</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Supervising parking lot capacities, electric shuttle operations, and municipal metro links.</p>
      </div>

      {/* Main Grid: Parking on Left, Shuttle/Metro on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parking Lot Statuses */}
        <Card title="Parking Perimeter Matrix" subtitle={`Total Capacity: ${formatNumber(totalSpots)} stalls`}>
          <div className="space-y-5 mt-4">
            {lots.map((lot, idx) => {
              const occupancy = Math.round((lot.occupied / lot.capacity) * 100);
              let status = "Moderate";
              if (occupancy >= 95) status = "Full";
              else if (occupancy >= 85) status = "Near Capacity";

              let badgeColor = 'info';
              if (status === 'Full') badgeColor = 'danger';
              if (status === 'Near Capacity') badgeColor = 'warning';

              return (
                <div key={idx} className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 flex flex-col justify-between gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{lot.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {formatNumber(lot.occupied)} / {formatNumber(lot.capacity)} slots
                      </p>
                    </div>
                    <Badge variant={badgeColor} className="text-[9px] py-0">{status}</Badge>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${occupancy >= 95 ? 'bg-rose-500' : occupancy >= 85 ? 'bg-amber-500' : 'bg-blue-500'}`} 
                        style={{ width: `${occupancy}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold font-mono">
                      <span>Occupancy: {occupancy}%</span>
                      <span>{lot.capacity - lot.occupied} open spots</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Public Transit and Shuttles */}
        <div className="space-y-6">
          {/* Shuttle Fleet Card */}
          <Card title="Electric Shuttle Diagnostics" subtitle="Shuttle loop telemetry stats">
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-900">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Fleet</span>
                  <span className="text-lg font-black text-slate-200 font-mono">
                    {transitDelay > 0 ? '26 / 26 vehicles' : '24 / 26 vehicles'}
                  </span>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-900">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Headway</span>
                  <span className={`text-lg font-black font-mono ${transitDelay > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {transitDelay > 0 ? '5.4 minutes' : '3.2 minutes'}
                  </span>
                </div>
              </div>
              
              {transitDelay > 0 && (
                <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/10 flex items-start gap-2.5 text-xs text-slate-300">
                  <ShieldAlert className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    Caution: Active transit delays ({transitDelay} min) causing spectator rerouting surges near west shuttle lines.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Metro Network Link */}
          <Card title="Municipal Metro Status" subtitle="Integration with city rail operations">
            <div className="space-y-4 mt-4">
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <Train className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Metro Station Alpha (East)</h4>
                    <p className="text-[10px] text-slate-400">Intervals: 4 mins • Load level: Normal</p>
                  </div>
                </div>
                <Badge variant={transitDelay > 0 ? 'warning' : 'success'}>
                  {transitDelay > 0 ? 'Delayed' : 'On Time'}
                </Badge>
              </div>
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <Train className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Metro Station West Link</h4>
                    <p className="text-[10px] text-slate-400">Intervals: 5 mins • Load level: Low</p>
                  </div>
                </div>
                <Badge variant="success">On Time</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Transit;
