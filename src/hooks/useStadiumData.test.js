import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useStadiumData } from './useStadiumData';
import * as mockData from '../data/mockStadiumData';

describe('useStadiumData.js hook unit tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('returns initial state matching mock stadium metadata', () => {
    const { result } = renderHook(() => useStadiumData());
    
    expect(result.current.stadiumMetadata.name).toBe(mockData.stadiumMetadata.name);
    expect(result.current.gatesList.length).toBe(mockData.gatesList.length);
    expect(result.current.weatherData.temperature).toBe(mockData.weatherData.temperature);
  });

  test('updates gate queue times on 15-second interval ticks', () => {
    const { result } = renderHook(() => useStadiumData());
    
    
    // Fast-forward 15 seconds
    act(() => {
      vi.advanceTimersByTime(15000);
    });

    const updatedGateBQueue = result.current.gatesList.find(g => g.id === 'gate-b').queueTime;
    
    // The hook modifies B or C by adding +1 or -1, so it should change or stay within bounds
    expect(updatedGateBQueue).toBeGreaterThanOrEqual(10);
    expect(updatedGateBQueue).toBeLessThanOrEqual(35);
  });

  test('cleans up interval on unmount to prevent memory leaks', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    
    const { unmount } = renderHook(() => useStadiumData());
    
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});
