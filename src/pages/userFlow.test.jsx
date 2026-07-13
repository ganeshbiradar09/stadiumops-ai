import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Firebase SDKs to prevent database network requests in E2E tests
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => [{ name: '[DEFAULT]' }])
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null }))
}));

vi.mock('firebase/firestore', () => {
  return {
    getFirestore: vi.fn(() => ({})),
    collection: vi.fn(),
    doc: vi.fn(),
    addDoc: vi.fn(async () => ({ id: 'mock-firestore-id' })),
    getDocs: vi.fn(async () => ({ docs: [] })),
    updateDoc: vi.fn(async () => ({}))
  };
});

import { Dashboard } from './Dashboard';
import { recommendationEngine } from '../utils/recommendationEngine';

// Stub charts to bypass JSDOM SVG canvas layout restrictions
vi.mock('../components/dashboard/CrowdChart', () => ({
  CrowdChart: () => <div data-testid="crowd-chart">Mock Crowd Chart</div>
}));
vi.mock('../components/dashboard/GateChart', () => ({
  GateChart: () => <div data-testid="gate-chart">Mock Gate Chart</div>
}));
vi.mock('../components/dashboard/IntelSection', () => ({
  IntelSection: () => <div data-testid="intel-section">Mock Intel Section</div>
}));

describe('StadiumOps AI End-to-End User Flow Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-13T19:00:00.000Z'));
    vi.spyOn(recommendationEngine, 'startLiveStreaming').mockImplementation(() => {});
    localStorage.clear();
    // Configure default Mock database
    localStorage.setItem('stadiumops_active_snapshot', JSON.stringify(null));
    localStorage.setItem('stadiumops_active_recommendations', JSON.stringify([]));
    localStorage.setItem('stadiumops_timeline', JSON.stringify([]));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('successfully executes the full cycle: load scenario -> AI analysis -> review explain modal -> approve recommendation -> update metrics', async () => {
    const _parseSpy = vi.spyOn(recommendationEngine, 'processNewDataset');

    // 1. Ingest a synthetic dataset csv scenario using the engine
    const _rawCSV = `Gate, Queue Length, Occupancy, Capacity, Staff, Weather, Incident, Parking, Transit Delay, Time
Gate A, 30, 85%, 2000, 10, Clear, None, 50%, 0, 12:00
Gate B, 5, 20%, 2000, 10, Clear, None, 50%, 0, 12:00`;

    // Process dataset
    let ingestPromise;
    act(() => {
      ingestPromise = recommendationEngine.processNewDataset([
        { gate: 'Gate A', queueLength: 30, occupancy: 85, capacity: 2000, staff: 10, weather: 'Clear', incident: 'None', parking: 50, transitDelay: 0, time: '12:00' },
        { gate: 'Gate B', queueLength: 5, occupancy: 20, capacity: 2000, staff: 10, weather: 'Clear', incident: 'None', parking: 50, transitDelay: 0, time: '12:00' }
      ], 'Ingressed Influx');
    });

    await ingestPromise;

    // Simulate redirection trigger
    localStorage.setItem('stadiumops_trigger_loading', 'true');

    // 2. Render Dashboard Command Deck
    const { rerender } = render(<Dashboard />);

    // Assert that the inline loader starts running
    expect(screen.getByText(/Connecting telemetry/i)).toBeInTheDocument();

    // Fast-forward timers through Stage 1, 2, and loading completion (1800ms)
    act(() => {
      vi.advanceTimersByTime(1800);
    });

    // Rerender to reflect resolved loader state
    rerender(<Dashboard />);

    // Loader should be dismissed and recommendation card must render
    expect(screen.queryByText(/Connecting telemetry/i)).not.toBeInTheDocument();
    expect(screen.getByText('Reroute Ingress Flow: Gate A to Gate B')).toBeInTheDocument();

    // Average Queue time: (30 + 5) / 2 = 17.5 mins
    expect(screen.getAllByText('17.5')[0]).toBeInTheDocument();

    // 3. Open Explain Decision modal and verify telemetry grid
    const explainBtn = screen.getByRole('button', { name: /Explain Decision/i });
    fireEvent.click(explainBtn);

    expect(screen.getByText('Executive Decision Support briefing')).toBeInTheDocument();
    expect(screen.getByText('30 mins')).toBeInTheDocument(); // Max queue wait time (no gateId in generated simulation rec)
    expect(screen.getAllByText('Clear')[0]).toBeInTheDocument(); // Weather context
    expect(screen.getAllByText('50%')[0]).toBeInTheDocument(); // Parking context

    // Dismiss modal
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    });
    expect(screen.queryByText('Executive Decision Support briefing')).not.toBeInTheDocument();

    // 4. Click Approve button on card and check estimated queue reduction
    const approveBtn = screen.getByRole('button', { name: /Approve/i });
    fireEvent.click(approveBtn);

    // Fast-forward transition delay timer (250ms)
    await act(async () => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.queryByText('Applying outcomes...')).not.toBeInTheDocument();

    // Rerender
    rerender(<Dashboard />);

    // The simulator should immediately balance and drain Gate A's wait time:
    // (Math.max(4, 30 - 6) = 24 mins for Gate A, Gate B increases to 5 + 2 = 7 mins)
    // Next Average: (24 + 7) / 2 = 15.5 mins
    expect(screen.getAllByText('15.5')[0]).toBeInTheDocument();
    
    // Check that timeline events and localStorage stores are updated successfully
    const timeline = JSON.parse(localStorage.getItem('stadiumops_timeline'));
    expect(timeline[0].status).toBe('Approved');
  });
});
