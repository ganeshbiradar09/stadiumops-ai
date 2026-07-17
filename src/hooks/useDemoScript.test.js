import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDemoScript } from './useDemoScript';
import { recommendationEngine } from '../utils/recommendationEngine';
import { parseAndValidateCSV } from '../services/csvParser';

vi.mock('../utils/recommendationEngine', () => ({
  recommendationEngine: {
    processNewDataset: vi.fn().mockResolvedValue({ recommendations: [{ id: '1', priority: 'Critical', title: 'Test Rec' }] }),
    approveRecommendation: vi.fn().mockResolvedValue(),
    getActiveSnapshot: vi.fn().mockReturnValue({ averageQueueTime: 5, maxQueueTime: 10, crowdDensityLevel: 'Low' }),
    getActiveRecommendations: vi.fn().mockReturnValue([{ status: 'Approved', title: 'Test', recommended_action: 'Do it', confidence: 95 }])
  }
}));

vi.mock('../services/csvParser', () => ({
  parseAndValidateCSV: vi.fn().mockReturnValue({ processedRows: [] })
}));

describe('useDemoScript hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    global.alert = vi.fn();
    global.URL.createObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('executes full demo sequence', async () => {
    const setIsAiProcessing = vi.fn();
    const { result } = renderHook(() => useDemoScript(setIsAiProcessing));

    expect(result.current.demoRunning).toBe(false);

    let promise;
    act(() => {
      promise = result.current.runOneClickDemo();
    });

    expect(result.current.demoRunning).toBe(true);
    expect(parseAndValidateCSV).toHaveBeenCalled();
    expect(recommendationEngine.processNewDataset).toHaveBeenCalled();

    await act(async () => {
      await Promise.resolve(); // flush microtasks
    });

    expect(setIsAiProcessing).toHaveBeenCalledWith(true);

    await act(async () => {
      vi.advanceTimersByTime(4000);
      await Promise.resolve();
    });

    expect(recommendationEngine.approveRecommendation).toHaveBeenCalledWith('1');

    await act(async () => {
      vi.advanceTimersByTime(4000);
      await Promise.resolve();
    });

    await act(async () => {
      vi.advanceTimersByTime(3000);
      await Promise.resolve();
    });

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await promise;
    });

    expect(result.current.demoRunning).toBe(false);
  });

  it('handles errors gracefully in catch block', async () => {
    const setIsAiProcessing = vi.fn();
    recommendationEngine.processNewDataset.mockRejectedValueOnce(new Error('Test Error'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { result } = renderHook(() => useDemoScript(setIsAiProcessing));

    await act(async () => {
      try {
        await result.current.runOneClickDemo();
      } catch {}
    });

    expect(alertSpy).toHaveBeenCalledWith("Demo simulation error occurred.");
  });
});
