import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { ExecutiveBriefingModal } from './ExecutiveBriefingModal';

describe('ExecutiveBriefingModal', () => {
  const mockSnapshot = {
    gates: [
      { name: 'Gate A (North)', capacity: 2000, occupancy: 95, queueTime: 30 }
    ],
    incidents: [
      { gate: 'Gate A', description: 'Validator outage' },
      { gate: 'Gate B', description: 'Minor issue' }
    ],
    context: {
      weather: 'Heavy Rain',
      transitDelay: 25,
      parkingOccupancy: 95
    },
    maxQueueTime: 30
  };

  const mockExplainRec = {
    title: 'Reroute to Gate A',
    description: 'Use Gate A',
    confidence: 90,
    reasoning: 'Because it is faster',
    modelName: 'Gemini',
    promptVersion: '1.0',
    recommended_action: 'Do it',
    risk_if_ignored: 'Very high'
  };

  test('renders AI Decision Trace & Impact Simulator UI with Scenario A and B', () => {
    render(<ExecutiveBriefingModal activeSnapshot={mockSnapshot} explainRec={mockExplainRec} onClose={() => {}} />);
    expect(screen.getByText('AI Decision Trace & Impact Simulator')).toBeInTheDocument();
    expect(screen.getByText('Scenario A')).toBeInTheDocument();
    expect(screen.getByText('Scenario B')).toBeInTheDocument();
    expect(screen.getByText('Reroute to Gate A')).toBeInTheDocument();
  });
  
  test('renders metadata from explainRec correctly', () => {
    const noGateRec = { ...mockExplainRec, title: 'Unknown', description: 'Unknown' };
    render(<ExecutiveBriefingModal activeSnapshot={mockSnapshot} explainRec={noGateRec} onClose={() => {}} />);
    expect(screen.getByText(/Gemini/)).toBeInTheDocument();
    expect(screen.getByText(/1.0/)).toBeInTheDocument();
  });
});
