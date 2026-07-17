import { describe, test, expect } from 'vitest';
import { normalizeStadiumData, normalizeManualIncident, validateAndNormalizeAiResponse } from './dataNormalizer';

describe('dataNormalizer.js unit tests', () => {
  describe('normalizeStadiumData', () => {
    test('returns default snapshot layout for empty or null rows', () => {
      const resultNull = normalizeStadiumData(null);
      expect(resultNull.averageQueueTime).toBe(0);
      expect(resultNull.crowdDensityLevel).toBe('Low');
      expect(resultNull.gates).toEqual([]);

      const resultEmpty = normalizeStadiumData([]);
      expect(resultEmpty.maxQueueTime).toBe(0);
      expect(resultEmpty.incidents).toEqual([]);
    });

    test('deduplicates rows by gate name, keeping the latest one', () => {
      const mockRows = [
        { gate: 'Gate A', queueLength: 10, occupancy: 30, capacity: 1000, staff: 5, weather: 'Clear', incident: 'None', parking: 50, transitDelay: 0, time: '12:00' },
        { gate: 'Gate B', queueLength: 15, occupancy: 40, capacity: 1200, staff: 6, weather: 'Clear', incident: 'None', parking: 50, transitDelay: 0, time: '12:00' },
        { gate: 'Gate A', queueLength: 5, occupancy: 20, capacity: 1000, staff: 8, weather: 'Clear', incident: 'None', parking: 50, transitDelay: 0, time: '12:00' } // Latest Gate A
      ];
      
      const snapshot = normalizeStadiumData(mockRows);
      expect(snapshot.gates.length).toBe(2);
      
      const gateA = snapshot.gates.find(g => g.name === 'Gate A');
      expect(gateA.queueTime).toBe(5);
      expect(gateA.occupancy).toBe(20);
      expect(gateA.staff).toBe(8);
    });

    test('maps crowd density levels correctly based on average occupancy', () => {
      // 1. Low density: average occupancy < 35% (e.g. 30%)
      const snapshotLow = normalizeStadiumData([
        { gate: 'Gate A', queueLength: 5, occupancy: 30, capacity: 1000, staff: 5, weather: 'Clear', time: '12:00' }
      ]);
      expect(snapshotLow.crowdDensityLevel).toBe('Low');

      // 2. Moderate density: average occupancy >= 35% and < 60% (e.g. 40%)
      const snapshotMod = normalizeStadiumData([
        { gate: 'Gate A', queueLength: 5, occupancy: 40, capacity: 1000, staff: 5, weather: 'Clear', time: '12:00' }
      ]);
      expect(snapshotMod.crowdDensityLevel).toBe('Moderate');

      // 3. High density: average occupancy >= 60% and < 80% (e.g. 70%)
      const snapshotHigh = normalizeStadiumData([
        { gate: 'Gate A', queueLength: 5, occupancy: 70, capacity: 1000, staff: 5, weather: 'Clear', time: '12:00' }
      ]);
      expect(snapshotHigh.crowdDensityLevel).toBe('High');

      // 4. Critical density: average occupancy >= 80% (e.g. 85%)
      const snapshotCritical = normalizeStadiumData([
        { gate: 'Gate A', queueLength: 5, occupancy: 85, capacity: 1000, staff: 5, weather: 'Clear', time: '12:00' }
      ]);
      expect(snapshotCritical.crowdDensityLevel).toBe('Critical');
    });

    test('extracts active incident rows successfully', () => {
      const mockRows = [
        { gate: 'Gate A', queueLength: 10, occupancy: 30, capacity: 1000, staff: 5, weather: 'Clear', incident: 'None', time: '12:00' },
        { gate: 'Gate B', queueLength: 15, occupancy: 40, capacity: 1200, staff: 6, weather: 'Clear', incident: 'Turnstile jam', time: '12:00' }
      ];
      const snapshot = normalizeStadiumData(mockRows);
      expect(snapshot.incidents.length).toBe(1);
      expect(snapshot.incidents[0]).toEqual({ gate: 'Gate B', description: 'Turnstile jam' });
    });

    test('cleans gate ID formatting replacing spaces/symbols with hyphens', () => {
      const snapshot = normalizeStadiumData([
        { gate: 'Gate North#1', queueLength: 5, occupancy: 20, capacity: 1000, staff: 5, weather: 'Clear', time: '12:00' }
      ]);
      expect(snapshot.gates[0].gateId).toBe('gate-north-1');
    });
  });

  describe('normalizeManualIncident', () => {
    test('formats manual incident input correctly', () => {
      const incident = normalizeManualIncident('Gate B', 'Crowd overflow detected', '14:30');
      expect(incident.matchTime).toBe('14:30');
      expect(incident.incidents[0]).toEqual({ gate: 'Gate B', description: 'Crowd overflow detected' });
      expect(incident.gates[0].gateId).toBe('gate-b');
    });

    test('handles default current time when time is omitted', () => {
      const incident = normalizeManualIncident('Gate C', 'Medical alert');
      expect(incident.matchTime).toBeDefined();
      expect(incident.incidents[0].gate).toBe('Gate C');
    });
  });

  test('caps confidence if missing information is present', () => {
    const rawRec = {
      missing_information: "Need camera feed for Gate C",
      confidence: 80
    };
    const result = validateAndNormalizeAiResponse(rawRec, 'Test', '1.0', 'Model X');
    
    expect(result.missing_information).toBe("Need camera feed for Gate C");
    expect(result.confidence).toBe(49);
    expect(result.validation_status).toBe("Confidence reduced due to missing information");
  });
});
