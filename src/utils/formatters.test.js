import { describe, test, expect } from 'vitest';
import { formatNumber, formatPercent, capitalize } from './formatters';

describe('formatters.js unit tests', () => {
  describe('formatNumber', () => {
    test('formats valid numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(-1234)).toBe('-1,234');
    });

    test('returns "0" for invalid inputs', () => {
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
      expect(formatNumber(NaN)).toBe('0');
    });

    test('handles extreme values', () => {
      expect(formatNumber(Infinity)).toBe('∞');
      expect(formatNumber(1e12)).toBe('1,000,000,000,000');
    });
  });

  describe('formatPercent', () => {
    test('formats values as percent strings', () => {
      expect(formatPercent(86.5)).toBe('86.5%');
      expect(formatPercent(0)).toBe('0%');
      expect(formatPercent(-10)).toBe('-10%');
    });

    test('returns "0%" for invalid inputs', () => {
      expect(formatPercent(null)).toBe('0%');
      expect(formatPercent(undefined)).toBe('0%');
      expect(formatPercent(NaN)).toBe('0%');
    });

    test('handles extreme percents', () => {
      expect(formatPercent(150)).toBe('150%');
      expect(formatPercent(10000)).toBe('10000%');
    });
  });

  describe('capitalize', () => {
    test('capitalizes the first letter of string', () => {
      expect(capitalize('open')).toBe('Open');
      expect(capitalize('GATE')).toBe('GATE');
      expect(capitalize('a')).toBe('A');
    });

    test('returns empty string for invalid inputs', () => {
      expect(capitalize(null)).toBe('');
      expect(capitalize(undefined)).toBe('');
      expect(capitalize('')).toBe('');
    });

    test('handles symbols, emojis, and unicode', () => {
      expect(capitalize('🚀 launch')).toBe('🚀 launch');
      expect(capitalize('ünder')).toBe('Ünder');
    });
  });
});
