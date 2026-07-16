import React from 'react';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';
import { LogOut } from 'lucide-react';

export const GatesStatusCard = ({ activeGatesCount, averageQueueTime, incidentsCount }) => {
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
        <p className="text-[10px] text-slate-400 mt-1.5 truncate">
          Avg queue: <span key={averageQueueTime} className="animate-number-pulse">{averageQueueTime}</span> mins
        </p>
      </div>
      <div className="mt-3">
        <Badge variant={incidentsCount > 0 ? 'danger' : 'success'} className="text-[9px] py-0">
          {incidentsCount > 0 ? `${incidentsCount} Alert overrides` : 'All Gates Clear'}
        </Badge>
      </div>
    </Card>
  );
};
