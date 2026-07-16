import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TelemetryChartPanel } from './TelemetryChartPanel';

vi.mock('../CrowdChart', () => ({
  CrowdChart: () => <div data-testid="crowd-chart" />
}));

vi.mock('../GateChart', () => ({
  GateChart: () => <div data-testid="gate-chart" />
}));

describe('TelemetryChartPanel Component', () => {
  it('renders both charts', () => {
    const { getByTestId } = render(<TelemetryChartPanel />);
    expect(getByTestId('crowd-chart')).toBeInTheDocument();
    expect(getByTestId('gate-chart')).toBeInTheDocument();
  });
});
