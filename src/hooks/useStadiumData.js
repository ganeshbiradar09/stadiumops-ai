import { useState, useEffect } from 'react';
import * as mockData from '../data/mockStadiumData';

/**
 * Custom hook to retrieve and stream mock operational telemetry data.
 */
export const useStadiumData = () => {
  const [data, setData] = useState({
    stadiumMetadata: mockData.stadiumMetadata,
    operationalScore: mockData.operationalScore,
    weatherData: mockData.weatherData,
    parkingStatus: mockData.parkingStatus,
    gatesList: mockData.gatesList,
    crowdTrendData: mockData.crowdTrendData,
    gateOccupancyData: mockData.gateOccupancyData,
    operationalIntelligenceEvents: mockData.operationalIntelligenceEvents,
    genAiDecisions: mockData.genAiDecisions,
    dataSourcesList: mockData.dataSourcesList,
  });

  // Simulated live update trigger (for design demonstration)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate minor variations in queue times or scores
      setData(prev => {
        const updatedGates = prev.gatesList.map(gate => {
          if (gate.id === 'gate-b' || gate.id === 'gate-c') {
            // Keep B & C wait times slightly dynamic
            const variance = Math.random() > 0.5 ? 1 : -1;
            const nextQueue = Math.max(10, Math.min(35, gate.queueTime + variance));
            return { ...gate, queueTime: nextQueue };
          }
          return gate;
        });

        return {
          ...prev,
          gatesList: updatedGates
        };
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return data;
};
export default useStadiumData;
