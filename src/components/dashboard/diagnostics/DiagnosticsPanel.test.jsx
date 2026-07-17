import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { DiagnosticsPanel } from './DiagnosticsPanel';

vi.mock('../../../services/geminiService', () => ({
  isAiMode: true
}));

describe('DiagnosticsPanel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders closed by default and toggles open', () => {
    render(<DiagnosticsPanel />);
    const toggleBtn = screen.getByRole('button', { name: 'Toggle Developer Diagnostics' });
    expect(screen.queryByText('Dev Diagnostics')).not.toBeInTheDocument();
    
    fireEvent.click(toggleBtn);
    expect(screen.getByText('Dev Diagnostics')).toBeInTheDocument();
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  test('loads metrics from localStorage', () => {
    const mockMetrics = {
      modelName: 'Test Model',
      promptVersion: '1.2',
      aiLatency: 150.5,
      parseStatus: 'Success',
      predictionConfidence: 95,
      telemetryProcessingTime: 12.3,
      lastUpdate: new Date('2026-07-13T12:00:00Z').toISOString()
    };
    localStorage.setItem('stadiumops_diagnostics', JSON.stringify(mockMetrics));
    
    render(<DiagnosticsPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Developer Diagnostics' }));
    
    expect(screen.getByText('Test Model')).toBeInTheDocument();
    expect(screen.getByText('1.2')).toBeInTheDocument();
    expect(screen.getByText('151ms')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('12.3ms')).toBeInTheDocument();
  });

  test('handles malformed localStorage JSON gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('stadiumops_diagnostics', 'invalid json');
    
    render(<DiagnosticsPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Developer Diagnostics' }));
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
  });

  test('updates metrics on stadiumops-diagnostics-update event', () => {
    render(<DiagnosticsPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Developer Diagnostics' }));
    
    const newMetrics = {
      modelName: 'New Model',
      parseStatus: 'Failed parsing'
    };
    
    act(() => {
      const event = new CustomEvent('stadiumops-diagnostics-update', { detail: newMetrics });
      window.dispatchEvent(event);
    });
    
    expect(screen.getByText('New Model')).toBeInTheDocument();
    expect(screen.getByText('Failed parsing')).toBeInTheDocument();
  });
});
