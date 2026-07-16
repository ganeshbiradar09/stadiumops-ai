import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTerminalLogger } from './useTerminalLogger';
import { recommendationEngine } from '../utils/recommendationEngine';

vi.mock('../utils/recommendationEngine', () => ({
  recommendationEngine: {
    getTimeline: vi.fn()
  }
}));

describe('useTerminalLogger hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with timeline events from engine', () => {
    const mockEvents = [{ id: 1, status: 'Pending' }];
    recommendationEngine.getTimeline.mockReturnValue(mockEvents);

    const { result } = renderHook(() => useTerminalLogger());

    expect(result.current.timelineEvents).toEqual(mockEvents);
  });

  it('updates timeline events on syncTimeline call', () => {
    const initialEvents = [];
    const newEvents = [{ id: 1, status: 'Approved' }];
    
    recommendationEngine.getTimeline.mockReturnValueOnce(initialEvents).mockReturnValueOnce(newEvents);

    const { result } = renderHook(() => useTerminalLogger());
    
    expect(result.current.timelineEvents).toEqual(initialEvents);

    act(() => {
      result.current.syncTimeline();
    });

    expect(result.current.timelineEvents).toEqual(newEvents);
  });

  it('listens to stadiumops-telemetry-update event', () => {
    const initialEvents = [];
    const newEvents = [{ id: 2, status: 'Rejected' }];
    
    recommendationEngine.getTimeline.mockReturnValueOnce(initialEvents).mockReturnValueOnce(newEvents);

    const { result } = renderHook(() => useTerminalLogger());

    expect(result.current.timelineEvents).toEqual(initialEvents);

    act(() => {
      window.dispatchEvent(new CustomEvent('stadiumops-telemetry-update'));
    });

    expect(result.current.timelineEvents).toEqual(newEvents);
  });
});
