import React from 'react';
import { Card } from '../../common/Card';
import { CloudSun } from 'lucide-react';

export const WeatherCard = ({ weather }) => {
  return (
    <Card hover className="flex flex-col justify-between p-4.5">
      <div className="flex justify-between items-start mb-2.5">
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Weather Telemetry</span>
        <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
          <CloudSun className="h-4.5 w-4.5" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-black tracking-tight text-slate-100" key={weather}>
          {weather}
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 truncate">
          Rain impact: {weather === 'Heavy Rain' ? 'High delay risk' : 'Normal'}
        </p>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
        <span>Sensor telemetry active</span>
      </div>
    </Card>
  );
};
