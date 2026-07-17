import { describe, test, expect } from 'vitest';
import { runSimulationMode } from './simulationEngine';

describe('simulationEngine', () => {
  test('returns incident response if active incidents exist', () => {
    const snapshot = {
      incidents: [
        { gate: 'Gate A', type: 'Security Alert', description: 'Intrusion' }
      ],
      gates: [
        { name: 'Gate A', queueTime: 5, capacity: 5000, occupancy: 50, staff: 20, securityAlerts: 0, medicalCases: 0, emergencyStatus: 'Normal' },
        { name: 'Gate B', queueTime: 5, capacity: 5000, occupancy: 50, staff: 20, securityAlerts: 0, medicalCases: 0, emergencyStatus: 'Normal' }
      ],
      context: { transitDelay: 0, parkingOccupancy: 50 }
    };
    const recs = runSimulationMode(snapshot);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].title).toContain('Remediate Gate A Incident');
    expect(recs[0].priority).toBe('High');
  });

  test('returns transit response if transit delays are severe', () => {
    const snapshot = {
      incidents: [],
      gates: [
        { name: 'Gate A', queueTime: 5, capacity: 5000, occupancy: 50, staff: 20, securityAlerts: 0, medicalCases: 0, emergencyStatus: 'Normal' },
        { name: 'Gate B', queueTime: 5, capacity: 5000, occupancy: 50, staff: 20, securityAlerts: 0, medicalCases: 0, emergencyStatus: 'Normal' }
      ],
      context: { transitDelay: 35, parkingOccupancy: 50 }
    };
    const recs = runSimulationMode(snapshot);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].title).toContain('Deploy Transit Shuttles');
    expect(recs[0].priority).toBe('High');
  });

  test('returns maintenance response if parking is full because parking logic is not in simulationEngine', () => {
    const snapshot = {
      incidents: [],
      gates: [
        { name: 'Gate A', queueTime: 5, capacity: 5000, occupancy: 50, staff: 20, securityAlerts: 0, medicalCases: 0, emergencyStatus: 'Normal' },
        { name: 'Gate B', queueTime: 5, capacity: 5000, occupancy: 50, staff: 20, securityAlerts: 0, medicalCases: 0, emergencyStatus: 'Normal' }
      ],
      context: { transitDelay: 0, parkingOccupancy: 96 }
    };
    const recs = runSimulationMode(snapshot);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].title).toContain('Maintain Standard Ingress Operations');
    expect(recs[0].priority).toBe('Low');
  });

  test('returns reroute response if queue discrepancy exists', () => {
    const snapshot = {
      incidents: [],
      gates: [
        { name: 'Gate A', queueTime: 30, capacity: 5000, occupancy: 95, staff: 20, securityAlerts: 0, medicalCases: 0, emergencyStatus: 'Normal' },
        { name: 'Gate B', queueTime: 5, capacity: 5000, occupancy: 20, staff: 20, securityAlerts: 0, medicalCases: 0, emergencyStatus: 'Normal' }
      ],
      context: { transitDelay: 0, parkingOccupancy: 50 },
      maxQueueTime: 30,
      averageQueueTime: 17.5
    };
    const recs = runSimulationMode(snapshot);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].title).toContain('Reroute Ingress Flow');
    expect(recs[0].expected_impact).toBeDefined();
    expect(recs[0].confidence_reason).toBeDefined();
  });

  test('returns maintenance response if no critical issues found', () => {
    const snapshot = {
      incidents: [],
      gates: [
        { name: 'Gate A', queueTime: 5, capacity: 5000, occupancy: 50, staff: 20, securityAlerts: 0, medicalCases: 0, emergencyStatus: 'Normal' },
        { name: 'Gate B', queueTime: 6, capacity: 5000, occupancy: 50, staff: 20, securityAlerts: 0, medicalCases: 0, emergencyStatus: 'Normal' }
      ],
      context: { transitDelay: 0, parkingOccupancy: 50 },
      maxQueueTime: 6,
      averageQueueTime: 5.5
    };
    const recs = runSimulationMode(snapshot);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].title).toContain('Maintain Standard Ingress Operations');
    expect(recs[0].priority).toBe('Low');
    expect(recs[0].confidence).toBeGreaterThan(90);
  });
});
