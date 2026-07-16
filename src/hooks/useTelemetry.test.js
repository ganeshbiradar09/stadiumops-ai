import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTelemetry } from './useTelemetry';
import { recommendationEngine } from '../utils/recommendationEngine';

vi.mock('../utils/recommendationEngine', () => ({
  recommendationEngine: {
    getActiveSnapshot: vi.fn(),
    getActiveDatasetName: vi.fn()
  }
}));

describe('useTelemetry hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes and computes metrics correctly', () => {
    const mockSnapshot = {
      gates: [
        { capacity: 1000, occupancy: 50 },
        { capacity: 1000, occupancy: 100 }
      ]
    };
    // Total capacity = 2000
    // Total occupancy = 500 + 1000 = 1500
    // occupancyPercentage = 1500 / 2000 = 75%
    
    recommendationEngine.getActiveSnapshot.mockReturnValue(mockSnapshot);
    recommendationEngine.getActiveDatasetName.mockReturnValue('Test Dataset');

    const { result } = renderHook(() => useTelemetry());

    expect(result.current.activeSnapshot).toEqual(mockSnapshot);
    expect(result.current.datasetName).toBe('Test Dataset');
    expect(result.current.occupancyPercentage).toBe(75);
    expect(result.current.totalOccupancy).toBe(1500);
  });

  it('handles empty snapshot gracefully', () => {
    recommendationEngine.getActiveSnapshot.mockReturnValue(null);
    recommendationEngine.getActiveDatasetName.mockReturnValue('Empty Dataset');

    const { result } = renderHook(() => useTelemetry());

    expect(result.current.occupancyPercentage).toBe(0);
    expect(result.current.totalOccupancy).toBe(0);
  });

  it('updates telemetry on stadiumops-telemetry-update event', () => {
    const mockSnapshot1 = { gates: [{ capacity: 1000, occupancy: 50 }] };
    const mockSnapshot2 = { gates: [{ capacity: 1000, occupancy: 100 }] };
    
    recommendationEngine.getActiveSnapshot.mockReturnValueOnce(mockSnapshot1).mockReturnValueOnce(mockSnapshot2);
    recommendationEngine.getActiveDatasetName.mockReturnValueOnce('Data 1').mockReturnValueOnce('Data 2');

    const { result } = renderHook(() => useTelemetry());

    expect(result.current.activeSnapshot).toEqual(mockSnapshot1);
    expect(result.current.datasetName).toBe('Data 1');

    act(() => {
      window.dispatchEvent(new CustomEvent('stadiumops-telemetry-update'));
    });

    expect(result.current.activeSnapshot).toEqual(mockSnapshot2);
    expect(result.current.datasetName).toBe('Data 2');
  });
});
