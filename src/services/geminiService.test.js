// Stub Gemini API environment key before importing the service
import.meta.env.VITE_GEMINI_API_KEY = 'mock_key';

import { describe, test, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';

const originalApiKey = import.meta.env.VITE_GEMINI_API_KEY;

describe('geminiService.js unit tests', () => {
  let service;

  beforeAll(async () => {
    service = await import('./geminiService');
  });

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isAiMode status', () => {
    test('reports AI status accurately', () => {
      expect(typeof service.getAiModeStatus()).toBe('boolean');
    });
  });

  describe('Simulation Mode Fallback (No API Key)', () => {
    test('runs rule-based simulation when Gemini is inactive', async () => {
      import.meta.env.VITE_GEMINI_API_KEY = '';
      
      const mockSnapshot = {
        gates: [
          { name: 'Gate A', queueTime: 25, occupancy: 85, capacity: 1000, staff: 10, securityAlerts: 0, medicalCases: 0, emergencyStatus: 'Normal' },
          { name: 'Gate B', queueTime: 5, occupancy: 20, capacity: 1000, staff: 10, securityAlerts: 0, medicalCases: 0, emergencyStatus: 'Normal' }
        ],
        incidents: [],
        context: { weather: 'Clear', parkingOccupancy: 50, transitDelay: 0 }
      };

      const result = await service.generateRecommendations(mockSnapshot, 'Test Scenario');
      import.meta.env.VITE_GEMINI_API_KEY = originalApiKey;

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].modelName).toBe('Simulation-Engine-Cognitive-v3');
      expect(result[0].title).toContain('Reroute Ingress Flow');
      expect(result[0].datasetName).toBe('Test Scenario');
    });

    test('generates incident remediation recommendation', async () => {
      import.meta.env.VITE_GEMINI_API_KEY = '';

      const mockSnapshot = {
        gates: [{ name: 'Gate B', queueTime: 10, occupancy: 40, capacity: 1000, staff: 10, securityAlerts: 0, medicalCases: 0, emergencyStatus: 'Normal' }],
        incidents: [{ gate: 'Gate B', description: 'Turnstile validator outage' }],
        context: { weather: 'Clear', parkingOccupancy: 50, transitDelay: 0 }
      };

      const result = await service.generateRecommendations(mockSnapshot, 'Test Scenario');
      import.meta.env.VITE_GEMINI_API_KEY = originalApiKey;

      expect(result.length).toBeGreaterThan(0);
      const incidentRec = result.find(r => r.title.includes('Remediate Gate B'));
      expect(incidentRec).toBeDefined();
      expect(incidentRec.priority).toBe('Critical');
      expect(incidentRec.staff_required).toContain('technicians');
    });

    test('generates weather incident remediation recommendation', async () => {
      import.meta.env.VITE_GEMINI_API_KEY = '';

      const mockSnapshot = {
        gates: [{ name: 'Gate B', queueTime: 10, occupancy: 40, capacity: 1000, staff: 10, securityAlerts: 0, medicalCases: 0, emergencyStatus: 'Normal' }],
        incidents: [{ gate: 'Gate B', description: 'Heavy rain causing scanner malfunction' }],
        context: { weather: 'Clear', parkingOccupancy: 50, transitDelay: 0 }
      };

      const result = await service.generateRecommendations(mockSnapshot, 'Test Scenario');
      import.meta.env.VITE_GEMINI_API_KEY = originalApiKey;

      const rainRec = result.find(r => r.title.includes('Weather Response') || r.recommended_action.includes('canopies'));
      expect(rainRec).toBeDefined();
      expect(rainRec.priority).toBe('High');
    });

    test('generates weather hazard protocol when inclement conditions occur', async () => {
      import.meta.env.VITE_GEMINI_API_KEY = '';

      const mockSnapshot = {
        gates: [{ name: 'Gate A', queueTime: 8, occupancy: 30, capacity: 1000, staff: 10, securityAlerts: 0, medicalCases: 0, emergencyStatus: 'Normal' }],
        incidents: [],
        context: { weather: 'Heavy Rain', parkingOccupancy: 50, transitDelay: 0 }
      };

      const result = await service.generateRecommendations(mockSnapshot, 'Test Scenario');
      import.meta.env.VITE_GEMINI_API_KEY = originalApiKey;

      const weatherRec = result.find(r => r.title.includes('Weather Response'));
      expect(weatherRec).toBeDefined();
      expect(weatherRec.priority).toBe('High');
      expect(weatherRec.recommended_action).toContain('canopies');
    });

    test('generates emergency security and medical squad recommendations', async () => {
      import.meta.env.VITE_GEMINI_API_KEY = '';

      const mockSnapshot = {
        gates: [
          { name: 'Gate C', queueTime: 10, occupancy: 40, capacity: 1000, staff: 10, securityAlerts: 2, medicalCases: 1, emergencyStatus: 'Amber Warning' }
        ],
        incidents: [],
        context: { weather: 'Clear', parkingOccupancy: 50, transitDelay: 0 }
      };

      const result = await service.generateRecommendations(mockSnapshot, 'Test Scenario');
      import.meta.env.VITE_GEMINI_API_KEY = originalApiKey;

      const secRec = result.find(r => r.title.includes('Emergency Security Dispatch'));
      const medRec = result.find(r => r.title.includes('Medical Squad'));

      expect(secRec).toBeDefined();
      expect(secRec.priority).toBe('Critical');
      expect(medRec).toBeDefined();
      expect(medRec.priority).toBe('High');
    });
  });

  describe('Live Gemini REST Endpoint Failures', () => {
    const mockSnapshot = {
      gates: [{ name: 'Gate A', queueTime: 10, occupancy: 40, capacity: 1000, staff: 5, securityAlerts: 0, medicalCases: 0, emergencyStatus: 'Normal' }],
      incidents: [],
      context: { weather: 'Clear', parkingOccupancy: 50, transitDelay: 0 }
    };

    test('recovers and runs simulation when API responds with 429 Rate Limit', async () => {
      import.meta.env.VITE_GEMINI_API_KEY = 'mock_key';

      fetch.mockResolvedValue({
        ok: false,
        status: 429
      });

      const result = await service.generateRecommendations(mockSnapshot, 'Test Ingest');
      import.meta.env.VITE_GEMINI_API_KEY = originalApiKey;

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].modelName).toBe('Simulation-Engine-Cognitive-v3');
    });

    test('recovers when API responds with 500 Server Error', async () => {
      import.meta.env.VITE_GEMINI_API_KEY = 'mock_key';

      fetch.mockResolvedValue({
        ok: false,
        status: 500
      });

      const result = await service.generateRecommendations(mockSnapshot, 'Test Ingest');
      import.meta.env.VITE_GEMINI_API_KEY = originalApiKey;

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].modelName).toBe('Simulation-Engine-Cognitive-v3');
    });

    test('recovers when response returns malformed JSON text', async () => {
      import.meta.env.VITE_GEMINI_API_KEY = 'mock_key';

      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  { text: 'INVALID_JSON_STRING_NOT_PARSABLE' }
                ]
              }
            }
          ]
        })
      });

      const result = await service.generateRecommendations(mockSnapshot, 'Test Ingest');
      import.meta.env.VITE_GEMINI_API_KEY = originalApiKey;

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].modelName).toBe('Simulation-Engine-Cognitive-v3');
    });

    test('recovers when candidate content parts are empty', async () => {
      import.meta.env.VITE_GEMINI_API_KEY = 'mock_key';

      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: []
        })
      });

      const result = await service.generateRecommendations(mockSnapshot, 'Test Ingest');
      import.meta.env.VITE_GEMINI_API_KEY = originalApiKey;

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].modelName).toBe('Simulation-Engine-Cognitive-v3');
    });
  });

  describe('Live Gemini REST Success', () => {
    test('successfully parses JSON and injects metadata', async () => {
      import.meta.env.VITE_GEMINI_API_KEY = 'mock_key';

      const mockResponseRecs = [
        {
          title: 'Direct Flow Control',
          recommended_action: 'Increase checkpoint stewards by 5',
          confidence: 90
        }
      ];

      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  { text: JSON.stringify(mockResponseRecs) }
                ]
              }
            }
          ]
        })
      });

      const mockSnapshot = {
        gates: [{ name: 'Gate A', queueTime: 10, occupancy: 40, capacity: 1000, staff: 5, securityAlerts: 0, medicalCases: 0, emergencyStatus: 'Normal' }],
        incidents: [],
        context: { weather: 'Clear', parkingOccupancy: 50, transitDelay: 0 }
      };

      const result = await service.generateRecommendations(mockSnapshot, 'Test Ingest');
      import.meta.env.VITE_GEMINI_API_KEY = originalApiKey;

      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Direct Flow Control');
      expect(result[0].modelName).toBe('gemini-1.5-flash');
      expect(result[0].promptVersion).toBeDefined();
    });
  });
});
