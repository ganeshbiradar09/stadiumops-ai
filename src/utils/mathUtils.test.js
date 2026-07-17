import { describe, test, expect } from 'vitest';
import { calculateOperationalScore, predictQueue } from './mathUtils';

describe('mathUtils', () => {
  test('calculateOperationalScore returns 100 for null snapshot', () => {
    expect(calculateOperationalScore(null)).toBe(100);
    expect(calculateOperationalScore()).toBe(100);
  });

  test('predictQueue handles null or short history', () => {
    expect(predictQueue(null)).toBe(0);
    expect(predictQueue([])).toBe(0);
    expect(predictQueue([5])).toBe(5);
  });
});
