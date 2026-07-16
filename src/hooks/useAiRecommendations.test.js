import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAiRecommendations } from './useAiRecommendations';
import { recommendationEngine } from '../utils/recommendationEngine';

vi.mock('../utils/recommendationEngine', () => ({
  recommendationEngine: {
    getActiveRecommendations: vi.fn(),
    approveRecommendation: vi.fn().mockResolvedValue(),
    rejectRecommendation: vi.fn().mockResolvedValue()
  }
}));

describe('useAiRecommendations hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with active recommendations from engine', () => {
    const mockRecs = [{ id: 1, title: 'Test Rec' }];
    recommendationEngine.getActiveRecommendations.mockReturnValue(mockRecs);

    const { result } = renderHook(() => useAiRecommendations());

    expect(result.current.recommendations).toEqual(mockRecs);
  });

  it('handles approve', async () => {
    const { result } = renderHook(() => useAiRecommendations());

    act(() => {
      result.current.handleApprove('123');
    });

    expect(result.current.resolvingId).toBe('123');

    await act(async () => {
      vi.advanceTimersByTime(250);
      await Promise.resolve(); // flush microtasks
    });

    expect(recommendationEngine.approveRecommendation).toHaveBeenCalledWith('123');
    expect(result.current.resolvingId).toBeNull();
  });

  it('handles reject', async () => {
    const { result } = renderHook(() => useAiRecommendations());

    act(() => {
      result.current.handleReject('456');
    });

    expect(result.current.rejectingId).toBe('456');

    await act(async () => {
      vi.advanceTimersByTime(250);
      await Promise.resolve();
    });

    expect(recommendationEngine.rejectRecommendation).toHaveBeenCalledWith('456');
    expect(result.current.rejectingId).toBeNull();
  });
});
