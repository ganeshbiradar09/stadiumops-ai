import React from 'react';
import { Card } from '../../common/Card';
import { Flame } from 'lucide-react';

export const CrowdDensityCard = ({ crowdDensityLevel, maxQueueTime }) => {
  return (
    <Card hover className="flex flex-col justify-between p-4.5">
      <div className="flex justify-between items-start mb-2.5">
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Crowd Density</span>
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
          <Flame className="h-4.5 w-4.5" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-black tracking-tight text-slate-100 uppercase flex items-baseline gap-1.5">
          <span key={crowdDensityLevel} className="animate-number-pulse">
            {crowdDensityLevel}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 truncate">
          Max wait: <span key={maxQueueTime} className="animate-number-pulse font-mono">{maxQueueTime}</span> mins
        </p>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        <span>{crowdDensityLevel === 'Critical' ? 'Immediate action required' : 'Monitored grid'}</span>
      </div>
    </Card>
  );
};
