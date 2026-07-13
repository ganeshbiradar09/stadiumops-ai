import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DataSources } from './DataSources';
import { recommendationEngine } from '../utils/recommendationEngine';

// Mock useNavigate redirect behavior
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    useNavigate: () => mockNavigate
  };
});

describe('DataSources.jsx integration tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
    vi.stubGlobal('alert', vi.fn());
  });

  test('renders page layout elements and registers data stream items', () => {
    render(
      <MemoryRouter>
        <DataSources />
      </MemoryRouter>
    );

    expect(screen.getByText(/Operations Data Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/Synthetic Scenario Ingestor/i)).toBeInTheDocument();
    expect(screen.getByText(/CSV Ingestion Terminal/i)).toBeInTheDocument();
    expect(screen.getByText(/Manual Incident Form/i)).toBeInTheDocument();
  });

  test('toggles simulation mode correctly', () => {
    render(
      <MemoryRouter>
        <DataSources />
      </MemoryRouter>
    );

    const toggleBtn = screen.getByRole('switch', { name: /Toggle Gemini API Live Mode/i });
    expect(toggleBtn).toBeInTheDocument();
    
    // Toggle
    fireEvent.click(toggleBtn);
    expect(localStorage.getItem('stadiumops_force_simulation')).toBeDefined();
  });

  test('submitting a manual incident triggers recommendationEngine write', async () => {
    const submitSpy = vi.spyOn(recommendationEngine, 'processNewDataset');

    render(
      <MemoryRouter>
        <DataSources />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/e.g. Turnstile scanner/i);
    fireEvent.change(input, { target: { value: 'Severe crowding at Gate A perimeter' } });
    
    const submitBtn = screen.getByRole('button', { name: /Log & Run GenAI Decision/i });
    fireEvent.click(submitBtn);

    // Should call engine to process the manual override row
    expect(submitSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('uploading an invalid CSV displays validation rejected lines', async () => {
    render(
      <MemoryRouter>
        <DataSources />
      </MemoryRouter>
    );

    // Construct invalid CSV (missing required headers)
    const invalidCsvContent = 'Queue Length, Occupancy, Capacity, Staff\n10, 30%, 1000, 5';
    const file = new File([invalidCsvContent], 'stadium_telemetry.csv', { type: 'text/csv' });

    const inputEl = screen.getByLabelText(/Drag & drop CSV file or/i, { selector: 'input' });
    
    // Simulate selection
    fireEvent.change(inputEl, { target: { files: [file] } });

    // Verify validation warnings appear
    await waitFor(() => {
      expect(screen.getByText('CSV Validation Warnings')).toBeInTheDocument();
      expect(screen.getByText(/Missing required header: 'Gate'/i)).toBeInTheDocument();
    });
  });

  test('uploading a valid CSV parsing summary displays processed lines', async () => {
    render(
      <MemoryRouter>
        <DataSources />
      </MemoryRouter>
    );

    const validCsvContent = 'Gate, Queue Length, Occupancy, Capacity, Staff, Weather, Incident, Parking, Transit Delay, Time\nGate A, 10, 30%, 1000, 5, Clear, None, 50%, 0, 12:00';
    const file = new File([validCsvContent], 'stadium_telemetry.csv', { type: 'text/csv' });

    const inputEl = screen.getByLabelText(/Drag & drop CSV file or/i, { selector: 'input' });
    fireEvent.change(inputEl, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Processed Rows:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Run GenAI on Valid Rows/i })).toBeInTheDocument();
    });
  });
});
