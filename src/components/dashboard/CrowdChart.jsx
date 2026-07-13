import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { crowdTrendData } from '../../data/mockStadiumData';
import { recommendationEngine } from '../../utils/recommendationEngine';
import { Card } from '../common/Card';
import { formatNumber } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl">
        <p className="text-xs font-semibold text-slate-400 mb-1">Time: {label}</p>
        <p className="text-sm font-bold text-blue-400">
          Attendance: <span className="font-mono text-slate-100">{formatNumber(payload[0].value)}</span>
        </p>
        <p className="text-xs font-semibold text-emerald-400 mt-1">
          Flow Rate: <span className="font-mono">{payload[0].payload.flowRate} p/min</span>
        </p>
      </div>
    );
  }
  return null;
};

export const CrowdChart = () => {
  const [data, setData] = useState(recommendationEngine.getChartHistory());

  useEffect(() => {
    const handleUpdate = () => {
      const history = recommendationEngine.getChartHistory();
      if (history && history.length > 0) {
        setData(history);
      }
    };
    window.addEventListener('stadiumops-telemetry-update', handleUpdate);
    // Initial load check
    handleUpdate();
    return () => window.removeEventListener('stadiumops-telemetry-update', handleUpdate);
  }, []);

  // Fallback to static mock if history is empty
  const activeData = data && data.length > 0 ? data : crowdTrendData.map(d => ({
    time: d.time,
    crowdSize: d.crowdSize,
    flowRate: d.flowRate
  }));

  return (
    <Card 
      title="Crowd Trend Analytics" 
      subtitle="Pedestrian accumulation and arrival rates inside the security perimeter"
      className="h-[380px] flex flex-col justify-between"
    >
      <div className="w-full h-[280px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={activeData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCrowd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.2)" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${Math.round(value / 1000)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="crowdSize" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorCrowd)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
export default React.memo(CrowdChart);
