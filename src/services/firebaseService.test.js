// Configure Firebase mock env key BEFORE importing firebaseService
import.meta.env.VITE_FIREBASE_API_KEY = 'mock-firebase-key';

import { describe, test, expect, vi, beforeEach, beforeAll } from 'vitest';

// Toggle mock behaviors
let mockShouldFail = false;
let mockDocsToReturn = [];

// Mock Firebase SDKs
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => [{ name: '[DEFAULT]' }])
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null }))
}));

vi.mock('firebase/firestore', () => {
  const collectionMock = vi.fn((db, path) => ({ path }));
  const docMock = vi.fn((db, path, id) => ({ path, id }));
  
  const addDocMock = vi.fn(async (_col, _data) => {
    if (mockShouldFail) throw new Error("Firestore permission denied or timeout");
    return { id: "mock-doc-id-123" };
  });

  const getDocsMock = vi.fn(async (_col) => {
    if (mockShouldFail) throw new Error("Network unavailable");
    
    return {
      docs: mockDocsToReturn.map(doc => ({
        id: doc.id,
        data: () => doc.data
      }))
    };
  });

  const updateDocMock = vi.fn(async (_docRef, _data) => {
    if (mockShouldFail) throw new Error("Invalid schema or document missing");
    return {};
  });

  return {
    getFirestore: vi.fn(() => ({})),
    collection: collectionMock,
    doc: docMock,
    addDoc: addDocMock,
    getDocs: getDocsMock,
    updateDoc: updateDocMock
  };
});

describe('firebaseService.js unit tests with Firestore mocks', () => {
  let service;

  beforeAll(async () => {
    service = await import('./firebaseService');
  });

  beforeEach(() => {
    mockShouldFail = false;
    mockDocsToReturn = [];
    localStorage.clear();
  });

  describe('configuration check', () => {
    test('verifies firebase configuration status', () => {
      expect(typeof service.isFirebaseConfigured).toBe('boolean');
      expect(service.isFirebaseConfigured).toBe(true);
    });
  });

  describe('nominal firebase operations', () => {
    test('saveDataset saves correctly and returns row ID', async () => {
      const dataset = { name: 'Normal Scenario', timestamp: '12:00' };
      const result = await service.saveDataset(dataset);
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Normal Scenario');
    });

    test('saveRecommendation returns mock ID', async () => {
      const rec = { title: 'Reroute Gate A', confidence: 95 };
      const result = await service.saveRecommendation(rec);
      expect(result.id).toBeDefined();
      expect(result.title).toBe('Reroute Gate A');
    });

    test('updateRecommendationStatus succeeds', async () => {
      const result = await service.updateRecommendationStatus('doc-123', 'Approved');
      expect(result.status).toBe('Approved');
    });

    test('saveIncident and saveAuditLog record data', async () => {
      const incident = { gate: 'Gate A', description: 'Power failure' };
      const incResult = await service.saveIncident(incident);
      expect(incResult.id).toBeDefined();

      const auditResult = await service.saveAuditLog('TEST_ACTION', { detail: 'test' });
      expect(auditResult.id).toBeDefined();
    });

    test('getStoredRecommendations and getAuditLogs fetch lists', async () => {
      mockDocsToReturn = [
        { id: 'rec-1', data: { title: 'Action 1', status: 'Pending' } },
        { id: 'rec-2', data: { title: 'Action 2', status: 'Approved' } }
      ];
      const recs = await service.getStoredRecommendations();
      expect(recs.length).toBe(2);
      expect(recs[0].title).toBe('Action 1');
    });

    test('getAuditLogs fetches lists', async () => {
      mockDocsToReturn = [
        { id: 'log-1', data: { action: 'TEST', details: {} } }
      ];
      const logs = await service.getAuditLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe('TEST');
    });
  });

  describe('database failure & local storage offline fallback layers', () => {
    test('saveDataset falls back to localStorage on Firestore write failure', async () => {
      mockShouldFail = true;
      const dataset = { name: 'Failure Ingest', timestamp: '12:00' };
      const result = await service.saveDataset(dataset);
      
      expect(result.id).toBeDefined();
      expect(result.id).toContain('dat-');
      expect(result.name).toBe('Failure Ingest');

      const localStore = JSON.parse(localStorage.getItem('stadiumops_datasets'));
      expect(localStore.length).toBe(1);
      expect(localStore[0].name).toBe('Failure Ingest');
    });

    test('getStoredRecommendations falls back to localStorage on Firestore read failure', async () => {
      mockShouldFail = true;
      localStorage.setItem('stadiumops_recommendations', JSON.stringify([
        { id: 'rec-local-1', title: 'Local Action' }
      ]));

      const recs = await service.getStoredRecommendations();
      expect(recs.length).toBe(1);
      expect(recs[0].id).toBe('rec-local-1');
      expect(recs[0].title).toBe('Local Action');
    });

    test('updateRecommendationStatus falls back to localStorage on Firestore update failure', async () => {
      mockShouldFail = true;
      localStorage.setItem('stadiumops_recommendations', JSON.stringify([
        { id: 'doc-local-99', title: 'Action Target', status: 'Pending' }
      ]));

      const result = await service.updateRecommendationStatus('doc-local-99', 'Approved');
      expect(result.status).toBe('Approved');

      const localStore = JSON.parse(localStorage.getItem('stadiumops_recommendations'));
      expect(localStore[0].status).toBe('Approved');
    });

    test('saveRecommendation falls back to localStorage on failure', async () => {
      mockShouldFail = true;
      const rec = { title: 'Failed Rec', confidence: 50 };
      const result = await service.saveRecommendation(rec);
      expect(result.id).toBeDefined();
    });

    test('saveAuditLog and getAuditLogs fall back to local storage on failure', async () => {
      mockShouldFail = true;
      const logResult = await service.saveAuditLog('FAIL_ACTION', { x: 1 });
      expect(logResult.id).toBeDefined();

      const logs = await service.getAuditLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe('FAIL_ACTION');
    });

    test('saveIncident falls back to local storage on failure', async () => {
      mockShouldFail = true;
      const result = await service.saveIncident({ gate: 'Gate A', description: 'Failed Turnstile' });
      expect(result.id).toBeDefined();
    });

    test('offline fallback when Firebase is not configured at all', async () => {
      vi.resetModules();
      import.meta.env.VITE_FIREBASE_API_KEY = '';
      const offlineService = await import('./firebaseService');

      const dataset = { name: 'Offline Scenario', timestamp: '12:00' };
      const result = await offlineService.saveDataset(dataset);
      expect(result.id).toBeDefined();

      const recs = await offlineService.getStoredRecommendations();
      expect(recs.length).toBe(0);

      const logs = await offlineService.getAuditLogs();
      expect(logs.length).toBe(0);
    });
  });
});
