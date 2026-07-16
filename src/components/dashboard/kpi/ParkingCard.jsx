import React from 'react';
import { Card } from '../../common/Card';
import { Car } from 'lucide-react';

export const ParkingCard = ({ parkingOccupancy }) => {
  return (
    <Card hover className="flex flex-col justify-between p-4.5">
      <div className="flex justify-between items-start mb-2.5">
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Parking Lots</span>
        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
          <Car className="h-4.5 w-4.5" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-black tracking-tight text-slate-100 font-mono">
          <span key={parkingOccupancy} className="animate-number-pulse">
            {parkingOccupancy}
          </span>%
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 truncate">
          Lot A-D combined capacity
        </p>
      </div>
      <div className="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-900">
        <div 
          className="bg-purple-500 h-full rounded-full transition-all duration-500" 
          style={{ width: `${parkingOccupancy}%` }}
        ></div>
      </div>
    </Card>
  );
};
