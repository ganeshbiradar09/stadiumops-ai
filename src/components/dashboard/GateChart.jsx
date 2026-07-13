import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { gateOccupancyData } from '../../data/mockStadiumData';
import { recommendationEngine } from '../../utils/recommendationEngine';
import { Card } from '../common/Card';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl">
        <p className="text-xs font-semibold text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-100">
          Occupancy: <span className="font-mono text-blue-400">{data.current}%</span>
        </p>
        <p className="text-xs font-semibold text-slate-400 mt-1">
          Active Flow: <span className="font-mono text-emerald-400">{data.activeFlow} p/min</span>
        </p>
      </div>
    );
  }
  return null;
};

export const GateChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const handleUpdate = () => {
      const snapshot = recommendationEngine.getActiveSnapshot();
      if (snapshot && snapshot.gates) {
        setData(snapshot.gates.map(g => ({
          name: g.name.split(' (')[0], // Shorten name
          current: g.occupancy,
          max: 100,
          activeFlow: g.queueTime * 7 + 10 // Dynamic flow math
        })));
      }
    };
    window.addEventListener('stadiumops-telemetry-update', handleUpdate);
    handleUpdate();
    return () => window.removeEventListener('stadiumops-telemetry-update', handleUpdate);
  }, []);

  const activeData = data && data.length > 0 ? data : gateOccupancyData;

  return (
    <Card 
      title="Gate Occupancy & Load" 
      subtitle="Real-time occupancy rates relative to maximum capacity thresholds"
      className="h-[380px] flex flex-col justify-between"
    >
      <div className="w-full h-[280px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={activeData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.2)" vertical={false} />
            <XAxis 
              dataKey="name" 
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
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
            <Bar dataKey="current" radius={[4, 4, 0, 0]}>
              {activeData.map((entry, index) => {
                let fill = '#3b82f6';
                if (entry.current >= 90) {
                  fill = '#f43f5e';
                } else if (entry.current >= 75) {
                  fill = '#f59e0b';
                } else if (entry.current <= 20) {
                  fill = '#10b981';
                }
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
export default React.memo(GateChart);
