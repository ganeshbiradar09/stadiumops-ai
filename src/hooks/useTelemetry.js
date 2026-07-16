import { useState, useEffect, useCallback, useMemo } from 'react';
import { recommendationEngine } from '../utils/recommendationEngine';

export const useTelemetry = () => {
  const [activeSnapshot, setActiveSnapshot] = useState(recommendationEngine.getActiveSnapshot());
  const [datasetName, setDatasetName] = useState(recommendationEngine.getActiveDatasetName());
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }));

  const syncTelemetry = useCallback(() => {
    setActiveSnapshot(recommendationEngine.getActiveSnapshot());
    setDatasetName(recommendationEngine.getActiveDatasetName());
    setLastUpdateTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
  }, []);

  useEffect(() => {
    window.addEventListener('stadiumops-telemetry-update', syncTelemetry);
    return () => window.removeEventListener('stadiumops-telemetry-update', syncTelemetry);
  }, [syncTelemetry]);

  // Calculate active layout metrics safely
  const { occupancyPercentage, totalOccupancy } = useMemo(() => {
    if (!activeSnapshot || !activeSnapshot.gates) return { occupancyPercentage: 0, totalOccupancy: 0 };
    const cap = activeSnapshot.gates.reduce((sum, g) => sum + g.capacity, 0);
    if (cap === 0) return { occupancyPercentage: 0, totalOccupancy: 0 };
    const occ = Math.round(activeSnapshot.gates.reduce((sum, g) => sum + (g.capacity * (g.occupancy / 100)), 0));
    return {
      occupancyPercentage: Math.round((occ / cap) * 100),
      totalOccupancy: occ
    };
  }, [activeSnapshot]);

  return {
    activeSnapshot,
    datasetName,
    lastUpdateTime,
    occupancyPercentage,
    totalOccupancy,
    syncTelemetry
  };
};
