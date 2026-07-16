import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CrowdDensityCard } from './CrowdDensityCard';
import { GatesStatusCard } from './GatesStatusCard';
import { WeatherCard } from './WeatherCard';
import { OperationalScoreCard } from './OperationalScoreCard';

describe('KPI Section Components', () => {
  it('CrowdDensityCard renders critical state', () => {
    render(<CrowdDensityCard crowdDensityLevel="Critical" maxQueueTime={45} />);
    expect(screen.getByText('Immediate action required')).toBeInTheDocument();
  });

  it('CrowdDensityCard renders monitored state', () => {
    render(<CrowdDensityCard crowdDensityLevel="High" maxQueueTime={20} />);
    expect(screen.getByText('Monitored grid')).toBeInTheDocument();
  });

  it('GatesStatusCard renders incident state', () => {
    render(<GatesStatusCard activeGatesCount={6} averageQueueTime={15} incidentsCount={2} />);
    expect(screen.getByText('2 Alert overrides')).toBeInTheDocument();
  });

  it('GatesStatusCard renders clear state', () => {
    render(<GatesStatusCard activeGatesCount={6} averageQueueTime={5} incidentsCount={0} />);
    expect(screen.getByText('All Gates Clear')).toBeInTheDocument();
  });

  it('WeatherCard renders heavy rain state', () => {
    render(<WeatherCard weather="Heavy Rain" />);
    expect(screen.getByText(/High delay risk/i)).toBeInTheDocument();
  });

  it('WeatherCard renders normal state', () => {
    render(<WeatherCard weather="Clear" />);
    expect(screen.getByText(/Normal/)).toBeInTheDocument();
  });

  it('OperationalScoreCard renders moderate alert', () => {
    render(<OperationalScoreCard score={75} />);
    expect(screen.getByText('Moderate Alert')).toBeInTheDocument();
  });

  it('OperationalScoreCard renders optimal grid', () => {
    render(<OperationalScoreCard score={95} />);
    expect(screen.getByText('Optimal Grid')).toBeInTheDocument();
  });
});
