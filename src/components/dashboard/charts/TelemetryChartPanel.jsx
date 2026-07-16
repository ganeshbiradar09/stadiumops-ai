import React from 'react';
import { CrowdChart } from '../CrowdChart';
import { GateChart } from '../GateChart';

export const TelemetryChartPanel = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CrowdChart />
      <GateChart />
    </div>
  );
};
