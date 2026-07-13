import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { recommendationEngine } from '../utils/recommendationEngine';

// Import pages
import { Crowd } from './Crowd';
import { Operations } from './Operations';
import { Reports } from './Reports';
import SettingsPage from './Settings';
import { Transit } from './Transit';

// Mock layout charts to bypass canvas limitations
vi.mock('../components/dashboard/CrowdChart', () => ({
  CrowdChart: () => <div>Mock Crowd Chart</div>
}));
vi.mock('../components/dashboard/GateChart', () => ({
  GateChart: () => <div>Mock Gate Chart</div>
}));

const mockSnapshot = {
  timestamp: "2026-07-13T12:00:00.000Z",
  matchTime: "72:00",
  averageQueueTime: 10,
  maxQueueTime: 15,
  crowdDensityLevel: "Moderate",
  gates: [
    { gateId: "gate-a", name: "Gate A", queueTime: 7, occupancy: 36, capacity: 5000, staff: 32, securityAlerts: 0, medicalCases: 0, emergencyStatus: "Normal" },
    { gateId: "gate-b", name: "Gate B", queueTime: 14, occupancy: 63, capacity: 5000, staff: 45, securityAlerts: 0, medicalCases: 0, emergencyStatus: "Normal" }
  ],
  incidents: [],
  context: {
    weather: "Clear",
    parkingOccupancy: 76,
    transitDelay: 5
  }
};

describe('Page compilation and rendering suite', () => {
  beforeEach(() => {
    vi.spyOn(recommendationEngine, 'startLiveStreaming').mockImplementation(() => {});
    localStorage.setItem('stadiumops_active_snapshot', JSON.stringify(mockSnapshot));
    localStorage.setItem('stadiumops_active_recommendations', JSON.stringify([]));
    localStorage.setItem('stadiumops_timeline', JSON.stringify([]));
  });

  test('renders Crowd page nominal components', () => {
    render(
      <MemoryRouter>
        <Crowd />
      </MemoryRouter>
    );

    expect(screen.getByText(/Crowd Intelligence Command/i)).toBeInTheDocument();
    expect(screen.getByText(/Sector Heatmap Details/i)).toBeInTheDocument();
  });

  test('renders Operations page nominal components', () => {
    render(
      <MemoryRouter>
        <Operations />
      </MemoryRouter>
    );

    expect(screen.getByText(/Access Point Control Deck/i)).toBeInTheDocument();
    expect(screen.getByText(/Diagnostics Summary/i)).toBeInTheDocument();
  });

  test('renders Reports page nominal components', () => {
    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    );

    expect(screen.getByText(/Operational Reports Registry/i)).toBeInTheDocument();
    expect(screen.getByText(/Compile Report/i)).toBeInTheDocument();
  });

  test('renders Settings page nominal components', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('System Configuration')).toBeInTheDocument();
    expect(screen.getByText(/Venue Metadata/i)).toBeInTheDocument();
  });

  test('renders Transit page nominal components', () => {
    render(
      <MemoryRouter>
        <Transit />
      </MemoryRouter>
    );

    expect(screen.getByText(/Transit & Parking Coordination/i)).toBeInTheDocument();
    expect(screen.getByText(/Parking Perimeter Matrix/i)).toBeInTheDocument();
  });
});
