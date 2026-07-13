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

  test('renders with critical severity and incidents', () => {
    render(<ExecutiveBriefingModal activeSnapshot={mockSnapshot} explainRec={mockExplainRec} onClose={() => {}} />);
    expect(screen.getByText('Validator outage')).toBeInTheDocument();
    expect(screen.getByText('Heavy Rain')).toBeInTheDocument();
  });
  
  test('renders with no target gate', () => {
    const noGateRec = { ...mockExplainRec, title: 'Unknown', description: 'Unknown' };
    render(<ExecutiveBriefingModal activeSnapshot={mockSnapshot} explainRec={noGateRec} onClose={() => {}} />);
    expect(screen.getByText('Validator outage, Minor issue')).toBeInTheDocument();
  });
});
