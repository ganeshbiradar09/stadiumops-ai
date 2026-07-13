import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { operationalIntelligenceEvents } from '../../data/mockStadiumData';
import { ShieldAlert, RefreshCw, Terminal, Search } from 'lucide-react';

/**
 * Operational Intelligence event stream and sensor logs widget.
 */
export const IntelSection = React.memo(() => {
  const [filter, setFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const filteredEvents = filter === 'ALL' 
    ? operationalIntelligenceEvents 
    : operationalIntelligenceEvents.filter(evt => evt.type.toUpperCase() === filter);

  return (
    <Card 
      title="Operational Intelligence" 
      subtitle="Fusing IoT telemetry, ticketing feeds, and physical security feeds"
      className="h-[480px] flex flex-col justify-between"
      headerAction={
        <div className="flex items-center gap-2">
          <button 
            onClick={triggerRefresh}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh feed"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <span className="font-mono text-[10px] text-slate-400 font-semibold uppercase">Sensor Network: OK</span>
        </div>
      }
    >
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-b border-slate-800/60 pb-4 mb-4 mt-2">
        <div className="relative w-full sm:w-48">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search logs..." 
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
            disabled
          />
        </div>
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          {['ALL', 'DANGER', 'WARNING', 'INFO'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`
                px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all
                ${filter === type 
                  ? 'bg-blue-600 text-slate-100' 
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }
              `}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Event List Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[300px]">
        {filteredEvents.map((evt) => {
          let badgeVariant = 'info';
          if (evt.type === 'danger') badgeVariant = 'danger';
          if (evt.type === 'warning') badgeVariant = 'warning';
          if (evt.type === 'success') badgeVariant = 'success';

          return (
            <div 
              key={evt.id} 
              className={`
                p-3.5 rounded-xl border bg-slate-950/40 flex gap-3 items-start transition-all hover:bg-slate-900/30
                ${evt.type === 'danger' ? 'border-rose-950/30 hover:border-rose-950/50' : 'border-slate-800/80 hover:border-slate-700/50'}
              `}
            >
              <div className="mt-0.5">
                {evt.type === 'danger' && <ShieldAlert className="h-4.5 w-4.5 text-rose-400" />}
                {evt.type === 'warning' && <ShieldAlert className="h-4.5 w-4.5 text-amber-400" />}
                {evt.type === 'info' && <Terminal className="h-4.5 w-4.5 text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={badgeVariant}>{evt.category}</Badge>
                    <span className="text-[10px] text-slate-400 font-mono font-semibold">{evt.location}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono font-semibold">{evt.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 font-medium leading-relaxed">{evt.message}</p>
                
                {evt.status === 'Resolved' && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    <span>Resolved</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
});
export default IntelSection;
