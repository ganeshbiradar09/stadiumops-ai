import React from 'react';
import { Card } from '../../common/Card';
import { Badge } from '../../common/Badge';
import { Gauge, TrendingUp } from 'lucide-react';

export const OperationalScoreCard = ({ score }) => {
  return (
    <Card hover className="flex flex-col justify-between p-4.5 border-blue-500/10">
      <div className="flex justify-between items-start mb-2.5">
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Operational Score</span>
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
          <Gauge className="h-4.5 w-4.5" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-black tracking-tight text-slate-100 font-mono flex items-center gap-1">
          <span key={score} className="animate-number-pulse">
            {score}
          </span>
          <span className="text-[10px] text-emerald-400 flex items-center font-bold">
            <TrendingUp className="h-3 w-3 inline" /> +1.2%
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 truncate">
          Overall flow index rating
        </p>
      </div>
      <div className="mt-3">
        <Badge variant={score < 80 ? 'warning' : 'success'} className="text-[9px] py-0">
          {score < 80 ? 'Moderate Alert' : 'Optimal Grid'}
        </Badge>
      </div>
    </Card>
  );
};
