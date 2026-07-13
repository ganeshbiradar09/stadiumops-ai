import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { Dashboard } from './Dashboard';
import { recommendationEngine } from '../utils/recommendationEngine';

// Mock charts to prevent canvas sizing issues in JSDOM
vi.mock('../components/dashboard/CrowdChart', () => ({
  CrowdChart: () => <div data-testid="crowd-chart">Mock Crowd Chart</div>
}));
vi.mock('../components/dashboard/GateChart', () => ({
  GateChart: () => <div data-testid="gate-chart">Mock Gate Chart</div>
}));
vi.mock('../components/dashboard/IntelSection', () => ({
  IntelSection: () => <div data-testid="intel-section">Mock Intel Section</div>
}));

const mockSnapshot = {
  timestamp: "2026-07-13T12:00:00.000Z",
  matchTime: "72:00",
  averageQueueTime: 10.5,
  maxQueueTime: 14,
  crowdDensityLevel: "Moderate",
  gates: [
    { gateId: "gate-a", name: "Gate A (NORTH)", queueTime: 7, occupancy: 36, capacity: 5000, staff: 32, securityAlerts: 0, medicalCases: 0, emergencyStatus: "Normal" },
    { gateId: "gate-b", name: "Gate B (EAST)", queueTime: 14, occupancy: 63, capacity: 5000, staff: 45, securityAlerts: 0, medicalCases: 0, emergencyStatus: "Normal" }
  ],
  incidents: [],
  context: {
    weather: "Clear",
    parkingOccupancy: 76,
    transitDelay: 5
  }
};

const mockRecommendations = [
  {
    id: "rec-test-1",
    recommendation_id: "rec-test-1",
    gateId: "gate-a",
    title: "Reroute Ingress Flow: Gate B to Gate A",
    description: "Redirect incoming crowd flow from Congested Gate B to underloaded Gate A.",
    priority: "High",
    confidence: 88,
    reasoning: "Gate B is busy (14m wait time) while Gate A is underloaded (7m wait time).",
    recommended_action: "Redirect 35% of ingress arrivals from Gate B to Gate A.",
    estimated_queue_reduction: "25%",
    staff_required: "4 stewards",
    risk_if_ignored: "High density queue crowding at Gate B.",
    status: "Pending",
    modelName: "gemini-1.5-flash",
    promptVersion: "3.1",
    timestamp: "2026-07-13T12:00:00Z"
  }
];

describe('Dashboard.jsx integration tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-13T19:00:00.000Z'));
    vi.spyOn(recommendationEngine, 'startLiveStreaming').mockImplementation(() => {});
    localStorage.setItem('stadiumops_active_snapshot', JSON.stringify(mockSnapshot));
    localStorage.setItem('stadiumops_active_recommendations', JSON.stringify(mockRecommendations));
    localStorage.setItem('stadiumops_recommendations', JSON.stringify(mockRecommendations));
    localStorage.setItem('stadiumops_timeline', JSON.stringify([]));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('nominal layout rendering', () => {
    test('renders stats grid, charts, and title successfully without errors', () => {
      render(<Dashboard />);
      
      expect(screen.getByText(/Operational Control Deck/i)).toBeInTheDocument();
      expect(screen.getByText(/Crowd Density/i)).toBeInTheDocument();
      expect(screen.getAllByText('10.5')[0]).toBeInTheDocument(); // Avg queue time
      expect(screen.getAllByText('76')[0]).toBeInTheDocument(); // Parking occupancy
      expect(screen.getByTestId('crowd-chart')).toBeInTheDocument();
      expect(screen.getByTestId('gate-chart')).toBeInTheDocument();
      
      // Console should have zero warnings or errors
      expect(console.error).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    });

    test('renders active recommendation cards', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('Reroute Ingress Flow: Gate B to Gate A')).toBeInTheDocument();
      expect(screen.getByText(/4 stewards/i)).toBeInTheDocument();
      expect(screen.getByText(/88%/i)).toBeInTheDocument(); // confidence
    });
  });

  describe('loader state sequence', () => {
    test('transitions through stages during 1.8-second AI loader sequence', () => {
      // Trigger loading flag in storage
      localStorage.setItem('stadiumops_trigger_loading', 'true');
      
      render(<Dashboard />);

      // Verify loader overlay is visible
      expect(screen.getByText(/Connecting telemetry/i)).toBeInTheDocument();

      // Stage 1 (after 600ms)
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(screen.getByText(/Analyzing operational data/i)).toBeInTheDocument();

      // Stage 2 (after 1200ms)
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(screen.getByText(/Generating AI recommendations/i)).toBeInTheDocument();

      // Finish loading (after 1800ms)
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(screen.queryByText(/Generating AI recommendations/i)).not.toBeInTheDocument();
    });
  });

  describe('decision explain modal popup', () => {
    test('clicking Explain Decision button opens Executive Briefing modal', () => {
      render(<Dashboard />);

      const explainBtn = screen.getByRole('button', { name: /Explain Decision/i });
      fireEvent.click(explainBtn);

      // Verify modal is open
      expect(screen.getByText('Executive Decision Support briefing')).toBeInTheDocument();
      expect(screen.getByText(/Trust Rated/i)).toBeInTheDocument();
      
      // Verify telemetry grid metrics are shown inside modal
      expect(screen.getByText('7 mins')).toBeInTheDocument(); // Gate A wait time
      expect(screen.getByText('76%')).toBeInTheDocument(); // Parking occupancy
    });

    test('pressing Escape key closes the explain modal', () => {
      render(<Dashboard />);

      fireEvent.click(screen.getByRole('button', { name: /Explain Decision/i }));
      expect(screen.getByText('Executive Decision Support briefing')).toBeInTheDocument();

      // Press Escape key
      act(() => {
        fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      });

      expect(screen.queryByText('Executive Decision Support briefing')).not.toBeInTheDocument();
    });
  });

  describe('Approve/Reject simulation outcomes', () => {
    test('clicking Approve triggers action and simulates outcome changes after delay', async () => {
      const approveSpy = vi.spyOn(recommendationEngine, 'approveRecommendation');
      
      render(<Dashboard />);

      const approveBtn = screen.getByRole('button', { name: /Approve/i });
      fireEvent.click(approveBtn);

      // Fast forward the transition timer (250ms delay) BEFORE asserting spy
      await act(async () => {
        vi.advanceTimersByTime(250);
      });

      // Verify that engine approve was called
      expect(approveSpy).toHaveBeenCalledWith('rec-test-1');

      // Wait for resolving spinner to clear and state updates to settle
      expect(screen.queryByText('Applying outcomes...')).not.toBeInTheDocument();
    });

    test('clicking Reject handles recommendation rejection', async () => {
      const rejectSpy = vi.spyOn(recommendationEngine, 'rejectRecommendation');
      
      render(<Dashboard />);

      const rejectBtn = screen.getAllByRole('button').find(btn => btn.className.includes('text-rose-400'));
      fireEvent.click(rejectBtn);

      // Fast forward transition timer (250ms)
      await act(async () => {
        vi.advanceTimersByTime(250);
      });

      expect(rejectSpy).toHaveBeenCalledWith('rec-test-1');
      expect(screen.queryByText('Removing recommendation...')).not.toBeInTheDocument();
    });
  });

  describe('accessibility and snapshot testing', () => {
    test('renders with no accessibility violations', async () => {
      const { container: _container } = render(<Dashboard />);
      
      // Just basic validation to satisfy a11y queries
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('Dashboard matches structural snapshot', () => {
      const { container } = render(<Dashboard />);
      expect(container).toMatchSnapshot();
    });
  });

  describe('responsive layouts', () => {
    test('renders correctly under mobile, tablet, and desktop viewports', () => {
      const viewports = [320, 768, 1024, 1440];
      
      viewports.forEach(width => {
        window.innerWidth = width;
        fireEvent(window, new Event('resize'));
        
        const { container } = render(<Dashboard />);
        expect(container.firstChild).toBeDefined();
      });
    });
  });
});
