import React from 'react';
import { VisitorCard } from './VisitorCard';
import { CrowdDensityCard } from './CrowdDensityCard';
import { GatesStatusCard } from './GatesStatusCard';
import { ParkingCard } from './ParkingCard';
import { WeatherCard } from './WeatherCard';
import { OperationalScoreCard } from './OperationalScoreCard';
import { calculateOperationalScore } from '../../../utils/mathUtils';

export const KPISection = ({ activeSnapshot, occupancyPercentage, totalOccupancy }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
      <VisitorCard 
        occupancyPercentage={occupancyPercentage} 
        totalOccupancy={totalOccupancy} 
      />
      <CrowdDensityCard 
        crowdDensityLevel={activeSnapshot.crowdDensityLevel} 
        maxQueueTime={activeSnapshot.maxQueueTime} 
      />
      <GatesStatusCard 
        activeGatesCount={activeSnapshot.gates.length} 
        averageQueueTime={activeSnapshot.averageQueueTime} 
        incidentsCount={activeSnapshot.incidents.length} 
      />
      <ParkingCard 
        parkingOccupancy={activeSnapshot.context.parkingOccupancy} 
      />
      <WeatherCard 
        weather={activeSnapshot.context.weather} 
      />
      <OperationalScoreCard 
        score={calculateOperationalScore(activeSnapshot)} 
      />
    </div>
  );
};
