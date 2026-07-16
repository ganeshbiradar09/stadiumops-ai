import React from 'react';
import { Card } from '../../common/Card';
import { Users } from 'lucide-react';
import { formatNumber } from '../../../utils/formatters';

export const VisitorCard = ({ occupancyPercentage, totalOccupancy }) => {
  return (
    <Card hover className="flex flex-col justify-between p-4.5">
      <div className="flex justify-between items-start mb-2.5">
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Stadium Occupancy</span>
        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
          <Users className="h-4.5 w-4.5" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-black tracking-tight text-slate-100 font-mono">
          <span key={occupancyPercentage} className="animate-number-pulse">
            {occupancyPercentage}
          </span>%
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 truncate">
          <span key={totalOccupancy} className="animate-number-pulse">
            {formatNumber(totalOccupancy)}
          </span> in attendance
        </p>
      </div>
      <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-900">
        <div 
          className="bg-blue-500 h-full rounded-full transition-all duration-500" 
          style={{ width: `${occupancyPercentage}%` }}
        ></div>
      </div>
    </Card>
  );
};
