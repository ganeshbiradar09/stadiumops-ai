import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusTerminal } from './StatusTerminal';

const mockEvents = [
  {
    timestamp: '2026-07-16T19:00:00Z',
    incident: 'Test Incident',
    status: 'Pending',
    recommendation: 'Test recommendation text',
    outcome: ''
  },
  {
    timestamp: '2026-07-16T19:05:00Z',
    incident: 'Test Approved',
    status: 'Approved',
    recommendation: 'Test approved rec',
    outcome: 'Resolved successfully'
  },
  {
    timestamp: '2026-07-16T19:10:00Z',
    incident: 'Test Rejected',
    status: 'Rejected',
    recommendation: 'Test rejected rec',
    outcome: 'Manager declined'
  }
];

describe('StatusTerminal Component', () => {
  it('renders empty state when no events exist', () => {
    render(<StatusTerminal timelineEvents={[]} />);
    expect(screen.getByText('Timeline logs await dataset uploads...')).toBeInTheDocument();
  });

  it('renders all statuses correctly', () => {
    render(<StatusTerminal timelineEvents={mockEvents} />);
    
    // Check pending event
    expect(screen.getByText('Test Incident')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Pending operational manager authorization.')).toBeInTheDocument();

    // Check approved event
    expect(screen.getByText('Test Approved')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Resolved successfully')).toBeInTheDocument();

    // Check rejected event
    expect(screen.getByText('Test Rejected')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(screen.getByText('Manager declined')).toBeInTheDocument();
  });
});
