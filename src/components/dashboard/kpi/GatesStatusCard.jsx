import React from 'react';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';
import { LogOut } from 'lucide-react';

export const GatesStatusCard = ({ activeGatesCount, averageQueueTime, incidentsCount, activeSnapshot }) => {
  return (
    <Card hover className="flex flex-col justify-between p-4.5">
      <div className="flex justify-between items-start mb-2.5">
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Gates Status</span>
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
          <LogOut className="h-4.5 w-4.5 rotate-180" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-black tracking-tight text-slate-100 font-mono">
          <span key={activeGatesCount} className="animate-number-pulse">
            {activeGatesCount}
          </span> active
        </div>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <p className="text-[10px] text-slate-400 truncate">
            Avg queue: <span key={averageQueueTime} className="animate-number-pulse">{averageQueueTime}</span> mins
          </p>
          {activeSnapshot?.averageQueueTimeDelta !== undefined && activeSnapshot.averageQueueTimeDelta !== 0 && (
            <span className={`text-[9px] font-bold ${activeSnapshot.averageQueueTimeDelta > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {activeSnapshot.averageQueueTimeDelta > 0 ? '↑' : '↓'} {Math.abs(activeSnapshot.averageQueueTimeDelta)}m
            </span>
          )}
          {activeSnapshot?.predictedAverageQueueTime !== undefined && (
            <span className="text-[9px] text-indigo-400 font-semibold px-1 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              Pred: {activeSnapshot.predictedAverageQueueTime}m
            </span>
          )}
        </div>
      </div>
      <div className="mt-3">
        <Badge variant={incidentsCount > 0 ? 'danger' : 'success'} className="text-[9px] py-0">
          {incidentsCount > 0 ? `${incidentsCount} Alert overrides` : 'All Gates Clear'}
        </Badge>
      </div>
    </Card>
  );
};
